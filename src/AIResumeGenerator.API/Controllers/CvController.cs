using Microsoft.AspNetCore.Mvc;
using AIResumeGenerator.API.Models;
using AIResumeGenerator.API.Services;

namespace AIResumeGenerator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CvController : ControllerBase
{
    private readonly ICvParserService _parserService;
    private readonly ICvSessionService _sessionService;
    private readonly ILogger<CvController> _logger;

    public CvController(
        ICvParserService parserService,
        ICvSessionService sessionService,
        ILogger<CvController> logger)
    {
        _parserService = parserService;
        _sessionService = sessionService;
        _logger = logger;
    }

    /// <summary>
    /// Upload a CV/Resume file (PDF or DOCX) for AI analysis
    /// </summary>
    [HttpPost("upload")]
    [ProducesResponseType<CvUploadResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CvUploadResponse>> UploadCv(
        IFormFile file,
        [FromQuery] string language = "en",
        [FromQuery] string countryCode = "DK",
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension != ".pdf" && extension != ".docx")
        {
            return BadRequest("Only PDF and DOCX files are supported");
        }

        try
        {
            _logger.LogInformation("Processing uploaded CV: {FileName} ({Size} bytes)", file.FileName, file.Length);

            string extractedText;
            using var stream = file.OpenReadStream();

            if (extension == ".pdf")
            {
                extractedText = await _parserService.ExtractTextFromPdfAsync(stream);
            }
            else
            {
                extractedText = await _parserService.ExtractTextFromDocxAsync(stream);
            }

            if (string.IsNullOrWhiteSpace(extractedText))
            {
                return BadRequest("Could not extract text from the file. The file might be image-based or corrupted.");
            }

            var result = await _sessionService.ProcessUploadedCvAsync(extractedText, language, countryCode, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process CV upload");
            return StatusCode(500, "Failed to process CV. Please try again.");
        }
    }

    /// <summary>
    /// Upload raw text (e.g., copied from LinkedIn)
    /// </summary>
    [HttpPost("upload-text")]
    [ProducesResponseType<CvUploadResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CvUploadResponse>> UploadText(
        [FromBody] TextUploadRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
        {
            return BadRequest("No text provided");
        }

        try
        {
            _logger.LogInformation("Processing uploaded text ({Length} chars)", request.Text.Length);
            var result = await _sessionService.ProcessUploadedCvAsync(
                request.Text,
                request.Language ?? "en",
                request.CountryCode ?? "DK",
                cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process text upload");
            return StatusCode(500, "Failed to process text. Please try again.");
        }
    }

    /// <summary>
    /// Chat with AI to improve the CV
    /// </summary>
    [HttpPost("chat")]
    [ProducesResponseType<ChatResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ChatResponse>> Chat(
        [FromBody] ChatRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.SessionId) || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest("Session ID and message are required");
        }

        try
        {
            var result = await _sessionService.ChatAsync(
                request.SessionId,
                request.Message,
                request.TargetJobTitle,
                request.TargetJobDescription,
                request.Language,
                cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process chat message");
            return StatusCode(500, "Failed to process message. Please try again.");
        }
    }

    /// <summary>
    /// Generate the final optimized resume
    /// </summary>
    [HttpPost("generate")]
    [ProducesResponseType<ResumeResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ResumeResponse>> GenerateResume(
        [FromBody] GenerateFromSessionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.SessionId))
        {
            return BadRequest("Session ID is required");
        }

        try
        {
            var result = await _sessionService.GenerateOptimizedResumeAsync(
                request.SessionId,
                request.TargetJobTitle,
                request.TargetJobDescription,
                request.AdditionalInstructions,
                request.Language,
                request.CountryCode,
                request.Template,
                cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate resume");
            return StatusCode(500, "Failed to generate resume. Please try again.");
        }
    }

    /// <summary>
    /// Generate a cover letter for a job application
    /// </summary>
    [HttpPost("cover-letter")]
    [ProducesResponseType<CoverLetterResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CoverLetterResponse>> GenerateCoverLetter(
        [FromBody] CoverLetterRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.SessionId) ||
            string.IsNullOrWhiteSpace(request.JobTitle) ||
            string.IsNullOrWhiteSpace(request.CompanyName))
        {
            return BadRequest("Session ID, job title, and company name are required");
        }

        try
        {
            var result = await _sessionService.GenerateCoverLetterAsync(
                request.SessionId,
                request.JobTitle,
                request.CompanyName,
                request.JobDescription,
                request.Language,
                cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate cover letter");
            return StatusCode(500, "Failed to generate cover letter. Please try again.");
        }
    }

    /// <summary>
    /// Get session data
    /// </summary>
    [HttpGet("session/{sessionId}")]
    [ProducesResponseType<CvSession>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<CvSession> GetSession(string sessionId)
    {
        var session = _sessionService.GetSession(sessionId);
        if (session == null)
        {
            return NotFound("Session not found");
        }
        return Ok(session);
    }
}

public class TextUploadRequest
{
    public required string Text { get; set; }
    public string? Language { get; set; }
    public string? CountryCode { get; set; }
}
