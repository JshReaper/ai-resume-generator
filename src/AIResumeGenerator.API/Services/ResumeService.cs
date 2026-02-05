using System.Text.Json;
using Anthropic.SDK;
using Anthropic.SDK.Messaging;
using AIResumeGenerator.API.Models;

namespace AIResumeGenerator.API.Services;

public class ResumeService : IResumeService
{
    private readonly AnthropicClient _client;
    private readonly string _model;
    private readonly ILogger<ResumeService> _logger;

    public ResumeService(IConfiguration configuration, ILogger<ResumeService> logger)
    {
        _logger = logger;

        var apiKey = configuration["Claude:ApiKey"]
            ?? throw new InvalidOperationException("Claude:ApiKey not configured");
        _model = configuration["Claude:Model"] ?? "claude-sonnet-4-20250514";

        _client = new AnthropicClient(apiKey);
    }

    public async Task<ResumeResponse> GenerateResumeAsync(ResumeRequest request, CancellationToken cancellationToken = default)
    {
        var systemPrompt = BuildSystemPrompt();
        var userPrompt = BuildUserPrompt(request);

        var messages = new List<Message>
        {
            new(RoleType.User, userPrompt)
        };

        var messageRequest = new MessageParameters
        {
            Model = _model,
            MaxTokens = 2000,
            SystemMessage = systemPrompt,
            Messages = messages,
            Temperature = 0.7m
        };

        try
        {
            var response = await _client.Messages.GetClaudeMessageAsync(messageRequest);
            var textContent = response.Content.FirstOrDefault() as TextContent;
            var content = textContent?.Text ?? string.Empty;

            return ParseResponse(content, request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating resume with Claude AI");
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

            Always respond in JSON format with the following structure:
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
        var prompt = $"""
            Please enhance the following resume information:

            Name: {request.FullName}
            Current Summary: {request.Summary ?? "Not provided"}
            Target Job Title: {request.TargetJobTitle ?? "Not specified"}
            Target Job Description: {request.TargetJobDescription ?? "Not provided"}

            Work Experience:
            {FormatWorkExperiences(request.WorkExperiences)}

            Education:
            {FormatEducation(request.Educations)}

            Current Skills: {string.Join(", ", request.Skills)}

            Please provide an enhanced version with a compelling summary, improved bullet points for each job, suggested additional skills, and relevant keywords.
            """;

        return prompt;
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

    private ResumeResponse ParseResponse(string content, ResumeRequest originalRequest)
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
                    return parsed;
                }
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse AI response as JSON, returning raw content");
        }

        return new ResumeResponse
        {
            GeneratedSummary = content,
            EnhancedExperiences = [],
            SuggestedSkills = [],
            Keywords = []
        };
    }
}
