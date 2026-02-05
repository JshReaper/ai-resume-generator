using AIResumeGenerator.API.Models;

namespace AIResumeGenerator.API.Services;

public interface ICvSessionService
{
    Task<CvUploadResponse> ProcessUploadedCvAsync(string extractedText, string language = "en", string countryCode = "DK", CancellationToken cancellationToken = default);
    Task<ChatResponse> ChatAsync(string sessionId, string userMessage, string? targetJob, string? jobDescription, string language = "en", CancellationToken cancellationToken = default);
    Task<ResumeResponse> GenerateOptimizedResumeAsync(string sessionId, string? targetJob, string? jobDescription, string? additionalInstructions, string language = "en", string countryCode = "DK", string template = "modern", CancellationToken cancellationToken = default);
    Task<CoverLetterResponse> GenerateCoverLetterAsync(string sessionId, string jobTitle, string companyName, string jobDescription, string language = "en", CancellationToken cancellationToken = default);
    CvSession? GetSession(string sessionId);
}

public class CvSession
{
    public required string Id { get; set; }
    public required string OriginalText { get; set; }
    public required ParsedCvData ParsedData { get; set; }
    public List<ChatMessage> ChatHistory { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;
}
