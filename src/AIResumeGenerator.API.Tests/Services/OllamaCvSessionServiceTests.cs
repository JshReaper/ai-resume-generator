using AIResumeGenerator.API.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using System.Net;
using System.Text;
using System.Text.Json;
using Xunit;

namespace AIResumeGenerator.API.Tests.Services;

public class OllamaCvSessionServiceTests
{
    private readonly Mock<IConfiguration> _configMock;
    private readonly Mock<ILogger<OllamaCvSessionService>> _loggerMock;
    private readonly Mock<IPhoneNumberFormatter> _phoneFormatterMock;
    private readonly Mock<HttpMessageHandler> _httpMessageHandlerMock;
    private readonly HttpClient _httpClient;

    public OllamaCvSessionServiceTests()
    {
        _configMock = new Mock<IConfiguration>();
        _loggerMock = new Mock<ILogger<OllamaCvSessionService>>();
        _phoneFormatterMock = new Mock<IPhoneNumberFormatter>();
        _httpMessageHandlerMock = new Mock<HttpMessageHandler>();

        // Setup default configuration
        _configMock.Setup(c => c["Ollama:BaseUrl"]).Returns("http://localhost:11434");
        _configMock.Setup(c => c["Ollama:Model"]).Returns("llama3.1:8b");

        // Setup phone formatter to return formatted number
        _phoneFormatterMock
            .Setup(f => f.FormatPhoneNumber(It.IsAny<string>(), It.IsAny<string>()))
            .Returns((string number, string code) => $"formatted-{number}");

        _httpClient = new HttpClient(_httpMessageHandlerMock.Object)
        {
            BaseAddress = new Uri("http://localhost:11434")
        };
    }

    [Fact]
    public async Task ProcessUploadedCvAsync_ValidInput_ReturnsSuccessResponse()
    {
        // Arrange
        var cvText = "John Doe\nSoftware Engineer\njohn@example.com\n+45 12345678";
        var expectedResponse = new
        {
            response = JsonSerializer.Serialize(new
            {
                fullName = "John Doe",
                email = "john@example.com",
                phone = "+4512345678",
                linkedIn = (string?)null,
                summary = "Experienced software engineer",
                workExperiences = new[]
                {
                    new
                    {
                        jobTitle = "Software Engineer",
                        company = "Tech Corp",
                        startDate = "2020",
                        endDate = (string?)null,
                        isCurrent = true,
                        responsibilities = new[] { "Developed applications" }
                    }
                },
                educations = new object[] { },
                skills = new[] { "C#", "JavaScript" },
                aiSummary = "Strong software engineering background",
                suggestedImprovements = new[] { "Add more project details" }
            })
        };

        SetupHttpResponse(HttpStatusCode.OK, JsonSerializer.Serialize(expectedResponse));

        var httpClientFactory = CreateHttpClientFactory();
        var service = new OllamaCvSessionService(
            _configMock.Object,
            httpClientFactory,
            _loggerMock.Object,
            _phoneFormatterMock.Object
        );

        // Act
        var result = await service.ProcessUploadedCvAsync(cvText, "en", "DK");

        // Assert
        result.Should().NotBeNull();
        result.SessionId.Should().NotBeNullOrEmpty();
        result.ParsedData.FullName.Should().Be("John Doe");
        result.ParsedData.Email.Should().Be("john@example.com");
    }

    [Fact]
    public async Task ProcessUploadedCvAsync_Timeout_ThrowsTaskCanceledException()
    {
        // Arrange
        var cvText = "Test CV";
        var cancellationTokenSource = new CancellationTokenSource();
        cancellationTokenSource.CancelAfter(TimeSpan.FromMilliseconds(100));

        // Setup HTTP handler to delay response beyond timeout
        _httpMessageHandlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .Returns(async () =>
            {
                await Task.Delay(TimeSpan.FromSeconds(200)); // Simulate long response
                return new HttpResponseMessage(HttpStatusCode.OK);
            });

        var httpClientFactory = CreateHttpClientFactory();
        var service = new OllamaCvSessionService(
            _configMock.Object,
            httpClientFactory,
            _loggerMock.Object,
            _phoneFormatterMock.Object
        );

        // Act & Assert
        await Assert.ThrowsAsync<TaskCanceledException>(
            () => service.ProcessUploadedCvAsync(cvText, "en", "DK", cancellationTokenSource.Token)
        );
    }

    [Fact]
    public async Task ProcessUploadedCvAsync_SlowResponse_CompletesWithinTimeout()
    {
        // Arrange
        var cvText = "John Doe\njohn@example.com";
        var expectedResponse = new
        {
            response = JsonSerializer.Serialize(new
            {
                fullName = "John Doe",
                email = "john@example.com",
                phone = (string?)null,
                linkedIn = (string?)null,
                summary = (string?)null,
                workExperiences = new object[] { },
                educations = new object[] { },
                skills = new string[] { },
                aiSummary = "Test summary",
                suggestedImprovements = new string[] { }
            })
        };

        // Setup HTTP handler to delay response but within acceptable range
        _httpMessageHandlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .Returns(async () =>
            {
                await Task.Delay(TimeSpan.FromSeconds(2)); // Simulate 2-second response
                var response = new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(
                        JsonSerializer.Serialize(expectedResponse),
                        Encoding.UTF8,
                        "application/json"
                    )
                };
                return response;
            });

        var httpClientFactory = CreateHttpClientFactory();
        var service = new OllamaCvSessionService(
            _configMock.Object,
            httpClientFactory,
            _loggerMock.Object,
            _phoneFormatterMock.Object
        );

        // Act
        var result = await service.ProcessUploadedCvAsync(cvText, "en", "DK");

        // Assert
        result.Should().NotBeNull();
        result.ParsedData.FullName.Should().Be("John Doe");
    }

    [Theory]
    [InlineData("en")]
    [InlineData("da")]
    public async Task ProcessUploadedCvAsync_DifferentLanguages_RequestsCorrectLanguage(string language)
    {
        // Arrange
        var cvText = "Test CV";
        var expectedResponse = CreateMinimalValidResponse();

        HttpRequestMessage? capturedRequest = null;
        _httpMessageHandlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .Callback<HttpRequestMessage, CancellationToken>((req, ct) => capturedRequest = req)
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(expectedResponse),
                    Encoding.UTF8,
                    "application/json"
                )
            });

        var httpClientFactory = CreateHttpClientFactory();
        var service = new OllamaCvSessionService(
            _configMock.Object,
            httpClientFactory,
            _loggerMock.Object,
            _phoneFormatterMock.Object
        );

        // Act
        await service.ProcessUploadedCvAsync(cvText, language, "DK");

        // Assert
        capturedRequest.Should().NotBeNull();
        var content = await capturedRequest!.Content!.ReadAsStringAsync();

        if (language == "da")
        {
            content.Should().Contain("Danish");
        }
        else
        {
            content.Should().Contain("English");
        }
    }

    [Fact]
    public async Task ProcessUploadedCvAsync_OllamaNotResponding_ThrowsHttpRequestException()
    {
        // Arrange
        var cvText = "Test CV";

        _httpMessageHandlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ThrowsAsync(new HttpRequestException("Connection refused"));

        var httpClientFactory = CreateHttpClientFactory();
        var service = new OllamaCvSessionService(
            _configMock.Object,
            httpClientFactory,
            _loggerMock.Object,
            _phoneFormatterMock.Object
        );

        // Act & Assert
        await Assert.ThrowsAsync<HttpRequestException>(
            () => service.ProcessUploadedCvAsync(cvText, "en", "DK")
        );
    }

    private void SetupHttpResponse(HttpStatusCode statusCode, string content)
    {
        _httpMessageHandlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(new HttpResponseMessage(statusCode)
            {
                Content = new StringContent(content, Encoding.UTF8, "application/json")
            });
    }

    private IHttpClientFactory CreateHttpClientFactory()
    {
        var factoryMock = new Mock<IHttpClientFactory>();
        factoryMock.Setup(f => f.CreateClient("Ollama")).Returns(_httpClient);
        return factoryMock.Object;
    }

    private object CreateMinimalValidResponse()
    {
        return new
        {
            response = JsonSerializer.Serialize(new
            {
                fullName = "Test User",
                email = "test@example.com",
                phone = (string?)null,
                linkedIn = (string?)null,
                summary = (string?)null,
                workExperiences = new object[] { },
                educations = new object[] { },
                skills = new string[] { },
                aiSummary = "Test",
                suggestedImprovements = new string[] { }
            })
        };
    }
}
