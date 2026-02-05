using AIResumeGenerator.API.Models;

namespace AIResumeGenerator.API.Services;

public interface IResumeService
{
    Task<ResumeResponse> GenerateResumeAsync(ResumeRequest request, CancellationToken cancellationToken = default);
}
