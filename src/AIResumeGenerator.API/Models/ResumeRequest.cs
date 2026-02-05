namespace AIResumeGenerator.API.Models;

public class ResumeRequest
{
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
    public string? LinkedIn { get; set; }
    public string? Summary { get; set; }
    public List<WorkExperience> WorkExperiences { get; set; } = [];
    public List<Education> Educations { get; set; } = [];
    public List<string> Skills { get; set; } = [];
    public string? TargetJobTitle { get; set; }
    public string? TargetJobDescription { get; set; }
}

public class WorkExperience
{
    public required string JobTitle { get; set; }
    public required string Company { get; set; }
    public required string StartDate { get; set; }
    public string? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public List<string> Responsibilities { get; set; } = [];
}

public class Education
{
    public required string Degree { get; set; }
    public required string Institution { get; set; }
    public required string GraduationYear { get; set; }
    public string? FieldOfStudy { get; set; }
}
