namespace AIResumeGenerator.API.Models;

public class ResumeResponse
{
    public required string GeneratedSummary { get; set; }
    public List<EnhancedWorkExperience> EnhancedExperiences { get; set; } = [];
    public List<string> ExistingSkills { get; set; } = []; // Skills from original CV
    public List<string> SuggestedSkills { get; set; } = []; // New skills AI recommends
    public List<string> Keywords { get; set; } = [];
    public string? FormattedResume { get; set; }
    public string Template { get; set; } = "modern";
}

public class EnhancedWorkExperience
{
    public required string JobTitle { get; set; }
    public required string Company { get; set; }
    public required string StartDate { get; set; }
    public string? EndDate { get; set; }
    public List<string> EnhancedResponsibilities { get; set; } = [];
}
