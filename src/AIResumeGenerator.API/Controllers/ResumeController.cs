using Microsoft.AspNetCore.Mvc;
using AIResumeGenerator.API.Models;
using AIResumeGenerator.API.Services;

namespace AIResumeGenerator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResumeController : ControllerBase
{
    private readonly IResumeService _resumeService;
    private readonly ILogger<ResumeController> _logger;

    public ResumeController(IResumeService resumeService, ILogger<ResumeController> logger)
    {
        _resumeService = resumeService;
        _logger = logger;
    }

    [HttpPost("generate")]
    [ProducesResponseType<ResumeResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ResumeResponse>> GenerateResume(
        [FromBody] ResumeRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("Full name and email are required.");
        }

        try
        {
            _logger.LogInformation("Generating resume for {Name}", request.FullName);
            var result = await _resumeService.GenerateResumeAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate resume for {Name}", request.FullName);
            return StatusCode(500, "An error occurred while generating the resume.");
        }
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow });
    }
}
