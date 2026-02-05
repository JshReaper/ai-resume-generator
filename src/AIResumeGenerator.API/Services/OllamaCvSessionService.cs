using System.Collections.Concurrent;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using AIResumeGenerator.API.Models;

namespace AIResumeGenerator.API.Services;

public class OllamaCvSessionService : ICvSessionService
{
    private readonly HttpClient _httpClient;
    private readonly string _model;
    private readonly ILogger<OllamaCvSessionService> _logger;
    private readonly IPhoneNumberFormatter _phoneFormatter;
    private static readonly ConcurrentDictionary<string, CvSession> _sessions = new();

    public OllamaCvSessionService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<OllamaCvSessionService> logger,
        IPhoneNumberFormatter phoneFormatter)
    {
        _logger = logger;
        _phoneFormatter = phoneFormatter;
        _httpClient = httpClientFactory.CreateClient("Ollama");

        var baseUrl = configuration["Ollama:BaseUrl"] ?? "http://localhost:11434";
        _httpClient.BaseAddress = new Uri(baseUrl);
        _model = configuration["Ollama:Model"] ?? "llama3.1:8b";
    }

    public async Task<CvUploadResponse> ProcessUploadedCvAsync(string extractedText, string language = "en", string countryCode = "DK", CancellationToken cancellationToken = default)
    {
        var sessionId = Guid.NewGuid().ToString("N")[..12];

        var langInstruction = language == "da"
            ? "Respond in Danish (dansk). Provide aiSummary and suggestedImprovements in Danish."
            : "Respond in English.";

        var systemPrompt = $$"""
            You are a professional CV/resume analyst. Analyze the provided CV text and extract structured information.
            {{langInstruction}}

            Respond with ONLY valid JSON in this exact format:
            {
                "fullName": "string or null",
                "email": "string or null",
                "phone": "string or null",
                "linkedIn": "string or null",
                "summary": "string or null",
                "workExperiences": [
                    {
                        "jobTitle": "string",
                        "company": "string",
                        "startDate": "string",
                        "endDate": "string or null",
                        "isCurrent": boolean,
                        "responsibilities": ["string"]
                    }
                ],
                "educations": [
                    {
                        "degree": "string",
                        "institution": "string",
                        "graduationYear": "string",
                        "fieldOfStudy": "string or null"
                    }
                ],
                "skills": ["string"],
                "aiSummary": "A brief 2-3 sentence analysis of this CV's strengths",
                "suggestedImprovements": ["3-5 specific suggestions to improve this CV"]
            }
            """;

        var userPrompt = $"Please analyze this CV and extract the information:\n\n{extractedText}";

        var response = await SendToOllamaAsync(systemPrompt, userPrompt, cancellationToken);
        var parsed = ParseCvAnalysisResponse(response, countryCode);

        var session = new CvSession
        {
            Id = sessionId,
            OriginalText = extractedText,
            ParsedData = parsed.Data
        };

        _sessions[sessionId] = session;

        return new CvUploadResponse
        {
            SessionId = sessionId,
            ExtractedText = extractedText,
            ParsedData = parsed.Data,
            AiSummary = parsed.AiSummary,
            SuggestedImprovements = parsed.Improvements
        };
    }

    public async Task<ChatResponse> ChatAsync(string sessionId, string userMessage, string? targetJob, string? jobDescription, string language = "en", CancellationToken cancellationToken = default)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
        {
            throw new InvalidOperationException("Session not found. Please upload a CV first.");
        }

        session.LastActivityAt = DateTime.UtcNow;
        session.ChatHistory.Add(new ChatMessage { Role = "user", Content = userMessage });

        var contextInfo = targetJob != null ? $"\nTarget Job: {targetJob}" : "";
        contextInfo += jobDescription != null ? $"\nJob Description: {jobDescription}" : "";

        var langInstruction = language == "da"
            ? "Respond in Danish (dansk)."
            : "Respond in English.";

        var systemPrompt = $"""
            You are a helpful CV/resume improvement assistant. You're helping improve a CV.
            {langInstruction}

            Current CV Data:
            {JsonSerializer.Serialize(session.ParsedData, new JsonSerializerOptions { WriteIndented = true })}
            {contextInfo}

            Help the user improve their CV. You can:
            1. Answer questions about their CV
            2. Suggest improvements
            3. Help rewrite sections
            4. Tailor content for specific jobs

            If the user asks you to make changes, describe what you would change.
            If they ask to generate the final CV, tell them to click the "Generate Resume" button.

            Be conversational and helpful. Keep responses concise but informative.
            """;

        var chatContext = string.Join("\n", session.ChatHistory.TakeLast(10).Select(m => $"{m.Role}: {m.Content}"));
        var response = await SendToOllamaAsync(systemPrompt, chatContext, cancellationToken);

        session.ChatHistory.Add(new ChatMessage { Role = "assistant", Content = response });

        return new ChatResponse
        {
            Message = response,
            UpdatedCvData = session.ParsedData,
            IsComplete = false
        };
    }

    public async Task<ResumeResponse> GenerateOptimizedResumeAsync(
        string sessionId,
        string? targetJob,
        string? jobDescription,
        string? additionalInstructions,
        string language = "en",
        string countryCode = "DK",
        string template = "modern",
        CancellationToken cancellationToken = default)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
        {
            throw new InvalidOperationException("Session not found. Please upload a CV first.");
        }

        var chatContext = session.ChatHistory.Count > 0
            ? $"\n\nConversation context (improvements discussed):\n{string.Join("\n", session.ChatHistory.TakeLast(6).Select(m => $"{m.Role}: {m.Content}"))}"
            : "";

        var langInstruction = language == "da"
            ? "Generate the resume in Danish (dansk). Use Danish language for all text."
            : "Generate the resume in English.";

        var systemPrompt = $$"""
            You are a professional resume writer. Generate an optimized, ATS-friendly resume based on the CV data provided.
            {{langInstruction}}

            IMPORTANT: Respond with ONLY valid JSON in this exact format:
            {
                "generatedSummary": "A compelling 3-4 sentence professional summary",
                "enhancedExperiences": [
                    {
                        "jobTitle": "string",
                        "company": "string",
                        "startDate": "string",
                        "endDate": "string or null",
                        "enhancedResponsibilities": ["Achievement-focused bullet points starting with action verbs"]
                    }
                ],
                "existingSkills": ["Skills from the original CV"],
                "suggestedSkills": ["NEW skills to add that weren't in the original CV"],
                "keywords": ["ATS-optimized keywords for this resume"]
            }

            IMPORTANT for skills:
            - existingSkills: Only include skills that were already in the CV
            - suggestedSkills: Only include NEW skills the candidate should add based on target job
            - Do NOT duplicate skills between existingSkills and suggestedSkills

            Make responsibilities achievement-focused with metrics where possible.
            Use strong action verbs (Led, Developed, Implemented, Increased, etc.)
            """;

        var userPrompt = $"""
            Generate an optimized resume from this CV data:

            {JsonSerializer.Serialize(session.ParsedData, new JsonSerializerOptions { WriteIndented = true })}

            Target Job: {targetJob ?? "General professional role"}
            Job Description: {jobDescription ?? "Not provided"}
            Additional Instructions: {additionalInstructions ?? "None"}
            Template Style: {template}
            {chatContext}

            Respond with JSON only.
            """;

        var response = await SendToOllamaAsync(systemPrompt, userPrompt, cancellationToken);
        var resumeResponse = ParseResumeResponse(response, session.ParsedData.Skills, template);

        // Format phone number if available
        if (!string.IsNullOrEmpty(session.ParsedData.Phone))
        {
            session.ParsedData.Phone = _phoneFormatter.FormatPhoneNumber(session.ParsedData.Phone, countryCode);
        }

        return resumeResponse;
    }

    public async Task<CoverLetterResponse> GenerateCoverLetterAsync(
        string sessionId,
        string jobTitle,
        string companyName,
        string jobDescription,
        string language = "en",
        CancellationToken cancellationToken = default)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
        {
            throw new InvalidOperationException("Session not found. Please upload a CV first.");
        }

        var langInstruction = language == "da"
            ? "Write the cover letter in Danish (dansk). Use formal Danish business language."
            : "Write the cover letter in English. Use professional business English.";

        var systemPrompt = $$"""
            You are a professional cover letter writer. Generate a compelling cover letter based on the CV data and job application.
            {{langInstruction}}

            IMPORTANT: Respond with ONLY valid JSON in this exact format:
            {
                "salutation": "Dear Hiring Manager" or appropriate greeting,
                "content": "3-4 paragraphs of the cover letter body, formatted with \n\n between paragraphs",
                "closing": "Sincerely" or appropriate closing
            }

            The cover letter should:
            1. Open with enthusiasm for the specific role and company
            2. Highlight 2-3 most relevant experiences from the CV
            3. Explain why the candidate is a great fit for THIS specific job
            4. Close with a call to action

            Be professional but personable. Use specific examples from the CV.
            """;

        var userPrompt = $"""
            Generate a cover letter for this job application:

            Job Title: {jobTitle}
            Company: {companyName}
            Job Description: {jobDescription}

            Candidate's CV Data:
            {JsonSerializer.Serialize(session.ParsedData, new JsonSerializerOptions { WriteIndented = true })}

            Respond with JSON only.
            """;

        var response = await SendToOllamaAsync(systemPrompt, userPrompt, cancellationToken);
        return ParseCoverLetterResponse(response);
    }

    public CvSession? GetSession(string sessionId)
    {
        _sessions.TryGetValue(sessionId, out var session);
        return session;
    }

    private async Task<string> SendToOllamaAsync(string systemPrompt, string userPrompt, CancellationToken cancellationToken)
    {
        var request = new OllamaGenerateRequest
        {
            Model = _model,
            Prompt = userPrompt,
            System = systemPrompt,
            Stream = false,
            Options = new OllamaOptions { Temperature = 0.7f }
        };

        _logger.LogInformation("Sending request to Ollama model {Model}", _model);

        var response = await _httpClient.PostAsJsonAsync("/api/generate", request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var ollamaResponse = await response.Content.ReadFromJsonAsync<OllamaGenerateResponse>(cancellationToken: cancellationToken);
        return ollamaResponse?.Response ?? string.Empty;
    }

    private (ParsedCvData Data, string AiSummary, List<string> Improvements) ParseCvAnalysisResponse(string content, string countryCode)
    {
        try
        {
            var jsonStart = content.IndexOf('{');
            var jsonEnd = content.LastIndexOf('}') + 1;

            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                var jsonContent = content[jsonStart..jsonEnd];
                using var doc = JsonDocument.Parse(jsonContent);
                var root = doc.RootElement;

                var phoneRaw = root.TryGetProperty("phone", out var ph) ? ph.GetString() : null;
                var phoneFormatted = !string.IsNullOrEmpty(phoneRaw)
                    ? _phoneFormatter.FormatPhoneNumber(phoneRaw, countryCode)
                    : phoneRaw;

                var data = new ParsedCvData
                {
                    FullName = root.TryGetProperty("fullName", out var fn) ? fn.GetString() : null,
                    Email = root.TryGetProperty("email", out var em) ? em.GetString() : null,
                    Phone = phoneFormatted,
                    LinkedIn = root.TryGetProperty("linkedIn", out var li) ? li.GetString() : null,
                    Summary = root.TryGetProperty("summary", out var su) ? su.GetString() : null,
                    Skills = root.TryGetProperty("skills", out var sk)
                        ? sk.EnumerateArray().Select(s => s.GetString() ?? "").Where(s => !string.IsNullOrEmpty(s)).Distinct().ToList()
                        : []
                };

                if (root.TryGetProperty("workExperiences", out var workExp))
                {
                    foreach (var exp in workExp.EnumerateArray())
                    {
                        data.WorkExperiences.Add(new ParsedWorkExperience
                        {
                            JobTitle = exp.TryGetProperty("jobTitle", out var jt) ? jt.GetString() : null,
                            Company = exp.TryGetProperty("company", out var co) ? co.GetString() : null,
                            StartDate = exp.TryGetProperty("startDate", out var sd) ? sd.GetString() : null,
                            EndDate = exp.TryGetProperty("endDate", out var ed) ? ed.GetString() : null,
                            IsCurrent = exp.TryGetProperty("isCurrent", out var ic) && ic.GetBoolean(),
                            Responsibilities = exp.TryGetProperty("responsibilities", out var resp)
                                ? resp.EnumerateArray().Select(r => r.GetString() ?? "").Where(r => !string.IsNullOrEmpty(r)).ToList()
                                : []
                        });
                    }
                }

                if (root.TryGetProperty("educations", out var eduArr))
                {
                    foreach (var edu in eduArr.EnumerateArray())
                    {
                        data.Educations.Add(new ParsedEducation
                        {
                            Degree = edu.TryGetProperty("degree", out var dg) ? dg.GetString() : null,
                            Institution = edu.TryGetProperty("institution", out var inst) ? inst.GetString() : null,
                            GraduationYear = edu.TryGetProperty("graduationYear", out var gy) ? gy.GetString() : null,
                            FieldOfStudy = edu.TryGetProperty("fieldOfStudy", out var fs) ? fs.GetString() : null
                        });
                    }
                }

                var aiSummary = root.TryGetProperty("aiSummary", out var ais) ? ais.GetString() ?? "" : "";
                var improvements = root.TryGetProperty("suggestedImprovements", out var si)
                    ? si.EnumerateArray().Select(s => s.GetString() ?? "").Where(s => !string.IsNullOrEmpty(s)).ToList()
                    : new List<string>();

                return (data, aiSummary, improvements);
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse CV analysis response as JSON");
        }

        return (new ParsedCvData(), "Could not analyze CV", []);
    }

    private ResumeResponse ParseResumeResponse(string content, List<string> originalSkills, string template)
    {
        try
        {
            var jsonStart = content.IndexOf('{');
            var jsonEnd = content.LastIndexOf('}') + 1;

            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                var jsonContent = content[jsonStart..jsonEnd];
                var parsed = JsonSerializer.Deserialize<ResumeResponse>(jsonContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (parsed != null)
                {
                    parsed.Template = template;

                    // Deduplicate skills: remove from suggestedSkills if already in existingSkills
                    if (parsed.ExistingSkills.Count == 0 && originalSkills.Count > 0)
                    {
                        parsed.ExistingSkills = originalSkills.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
                    }

                    var existingSkillsLower = new HashSet<string>(parsed.ExistingSkills.Select(s => s.ToLowerInvariant()));
                    parsed.SuggestedSkills = parsed.SuggestedSkills
                        .Where(s => !existingSkillsLower.Contains(s.ToLowerInvariant()))
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToList();

                    return parsed;
                }
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse resume response as JSON");
        }

        return new ResumeResponse
        {
            GeneratedSummary = content,
            EnhancedExperiences = [],
            ExistingSkills = originalSkills,
            SuggestedSkills = [],
            Keywords = [],
            Template = template
        };
    }

    private CoverLetterResponse ParseCoverLetterResponse(string content)
    {
        try
        {
            var jsonStart = content.IndexOf('{');
            var jsonEnd = content.LastIndexOf('}') + 1;

            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                var jsonContent = content[jsonStart..jsonEnd];
                var parsed = JsonSerializer.Deserialize<CoverLetterResponse>(jsonContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (parsed != null) return parsed;
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse cover letter response as JSON");
        }

        return new CoverLetterResponse
        {
            Salutation = "Dear Hiring Manager",
            Content = content,
            Closing = "Sincerely"
        };
    }
}

// Ollama API models (reused from OllamaResumeService)
public class OllamaGenerateRequest
{
    [JsonPropertyName("model")]
    public required string Model { get; set; }

    [JsonPropertyName("prompt")]
    public required string Prompt { get; set; }

    [JsonPropertyName("system")]
    public string? System { get; set; }

    [JsonPropertyName("stream")]
    public bool Stream { get; set; }

    [JsonPropertyName("options")]
    public OllamaOptions? Options { get; set; }
}

public class OllamaOptions
{
    [JsonPropertyName("temperature")]
    public float Temperature { get; set; } = 0.7f;
}

public class OllamaGenerateResponse
{
    [JsonPropertyName("response")]
    public string? Response { get; set; }

    [JsonPropertyName("done")]
    public bool Done { get; set; }
}
