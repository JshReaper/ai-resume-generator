namespace AIResumeGenerator.API.Models;

public class CvUploadResponse
{
    public required string SessionId { get; set; }
    public required string ExtractedText { get; set; }
    public required ParsedCvData ParsedData { get; set; }
    public required string AiSummary { get; set; }
    public List<string> SuggestedImprovements { get; set; } = [];
}

public class ParsedCvData
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? LinkedIn { get; set; }
    public string? Summary { get; set; }
    public List<ParsedWorkExperience> WorkExperiences { get; set; } = [];
    public List<ParsedEducation> Educations { get; set; } = [];
    public List<string> Skills { get; set; } = [];
}

public class ParsedWorkExperience
{
    public string? JobTitle { get; set; }
    public string? Company { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public List<string> Responsibilities { get; set; } = [];
}

public class ParsedEducation
{
    public string? Degree { get; set; }
    public string? Institution { get; set; }
    public string? GraduationYear { get; set; }
    public string? FieldOfStudy { get; set; }
}

public class ChatMessage
{
    public required string Role { get; set; } // "user" or "assistant"
    public required string Content { get; set; }
}

public class ChatRequest
{
    public required string SessionId { get; set; }
    public required string Message { get; set; }
    public string? TargetJobTitle { get; set; }
    public string? TargetJobDescription { get; set; }
    public string Language { get; set; } = "en"; // "en" or "da"
    public string CountryCode { get; set; } = "DK"; // For phone formatting
}

public class ChatResponse
{
    public required string Message { get; set; }
    public ParsedCvData? UpdatedCvData { get; set; }
    public ResumeResponse? GeneratedResume { get; set; }
    public bool IsComplete { get; set; }
}

public class GenerateFromSessionRequest
{
    public required string SessionId { get; set; }
    public string? TargetJobTitle { get; set; }
    public string? TargetJobDescription { get; set; }
    public string? AdditionalInstructions { get; set; }
    public string Language { get; set; } = "en"; // "en" or "da"
    public string CountryCode { get; set; } = "DK"; // For phone formatting
    public string Template { get; set; } = "modern"; // "modern", "classic", "minimal"
}

public class CoverLetterRequest
{
    public required string SessionId { get; set; }
    public required string JobTitle { get; set; }
    public required string CompanyName { get; set; }
    public required string JobDescription { get; set; }
    public string Language { get; set; } = "en"; // "en" or "da"
}

public class CoverLetterResponse
{
    public required string Content { get; set; }
    public required string Salutation { get; set; }
    public required string Closing { get; set; }
}
