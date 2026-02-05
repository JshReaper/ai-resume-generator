using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using AIResumeGenerator.API.Models;

namespace AIResumeGenerator.API.Services;

public class OllamaResumeService : IResumeService
{
    private readonly HttpClient _httpClient;
    private readonly string _model;
    private readonly ILogger<OllamaResumeService> _logger;

    public OllamaResumeService(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<OllamaResumeService> logger)
    {
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient("Ollama");

        var baseUrl = configuration["Ollama:BaseUrl"] ?? "http://localhost:11434";
        _httpClient.BaseAddress = new Uri(baseUrl);
        _model = configuration["Ollama:Model"] ?? "llama3.1:8b";
    }

    public async Task<ResumeResponse> GenerateResumeAsync(ResumeRequest request, CancellationToken cancellationToken = default)
    {
        var systemPrompt = BuildSystemPrompt();
        var userPrompt = BuildUserPrompt(request);

        var ollamaRequest = new OllamaGenerateRequest
        {
            Model = _model,
            Prompt = userPrompt,
            System = systemPrompt,
            Stream = false,
            Options = new OllamaOptions
            {
                Temperature = 0.7f
            }
        };

        try
        {
            _logger.LogInformation("Sending request to Ollama model {Model}", _model);

            var response = await _httpClient.PostAsJsonAsync("/api/generate", ollamaRequest, cancellationToken);
            response.EnsureSuccessStatusCode();

            var ollamaResponse = await response.Content.ReadFromJsonAsync<OllamaGenerateResponse>(cancellationToken: cancellationToken);
            var content = ollamaResponse?.Response ?? string.Empty;

            _logger.LogInformation("Received response from Ollama ({Length} chars)", content.Length);

            return ParseResponse(content);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to connect to Ollama. Is it running? Try: ollama serve");
            throw new InvalidOperationException("Failed to connect to Ollama. Make sure Ollama is running with 'ollama serve'", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating resume with Ollama");
            throw;
        }
    }

    private static string BuildSystemPrompt()
    {
        return """
            You are a professional resume writer and career coach. Your task is to enhance resumes by:
            1. Writing compelling professional summaries
            2. Transforming job responsibilities into achievement-focused bullet points using action verbs
            3. Suggesting relevant skills based on the target job
            4. Identifying important keywords for ATS optimization

            IMPORTANT: You must respond with ONLY valid JSON, no additional text before or after.
            Use this exact structure:
            {
                "generatedSummary": "string",
                "enhancedExperiences": [
                    {
                        "jobTitle": "string",
                        "company": "string",
                        "startDate": "string",
                        "endDate": "string or null",
                        "enhancedResponsibilities": ["string"]
                    }
                ],
                "suggestedSkills": ["string"],
                "keywords": ["string"]
            }
            """;
    }

    private static string BuildUserPrompt(ResumeRequest request)
    {
        return $"""
            Please enhance the following resume information and respond with ONLY JSON:

            Name: {request.FullName}
            Current Summary: {request.Summary ?? "Not provided"}
            Target Job Title: {request.TargetJobTitle ?? "Not specified"}
            Target Job Description: {request.TargetJobDescription ?? "Not provided"}

            Work Experience:
            {FormatWorkExperiences(request.WorkExperiences)}

            Education:
            {FormatEducation(request.Educations)}

            Current Skills: {string.Join(", ", request.Skills)}

            Respond with JSON only. Provide an enhanced version with a compelling summary, improved bullet points for each job, suggested additional skills, and relevant keywords.
            """;
    }

    private static string FormatWorkExperiences(List<WorkExperience> experiences)
    {
        if (experiences.Count == 0) return "None provided";

        return string.Join("\n\n", experiences.Select(exp => $"""
            {exp.JobTitle} at {exp.Company}
            {exp.StartDate} - {(exp.IsCurrent ? "Present" : exp.EndDate)}
            Responsibilities:
            {string.Join("\n", exp.Responsibilities.Select(r => $"- {r}"))}
            """));
    }

    private static string FormatEducation(List<Education> educations)
    {
        if (educations.Count == 0) return "None provided";

        return string.Join("\n", educations.Select(edu =>
            $"- {edu.Degree} in {edu.FieldOfStudy ?? "N/A"} from {edu.Institution} ({edu.GraduationYear})"));
    }

    private ResumeResponse ParseResponse(string content)
    {
        try
        {
            // Try to extract JSON from the response
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
                    return parsed;
                }
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse Ollama response as JSON");
        }

        // Fallback: return raw content as summary
        return new ResumeResponse
        {
            GeneratedSummary = content,
            EnhancedExperiences = [],
            SuggestedSkills = [],
            Keywords = []
        };
    }
}
