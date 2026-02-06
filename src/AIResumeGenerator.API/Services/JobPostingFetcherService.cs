using System.Text.RegularExpressions;
using HtmlAgilityPack;
using PuppeteerSharp;

namespace AIResumeGenerator.API.Services;

public class JobPostingFetcherService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<JobPostingFetcherService> _logger;

    public JobPostingFetcherService(HttpClient httpClient, ILogger<JobPostingFetcherService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        // Set user agent for polite scraping
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd(
            "Mozilla/5.0 (compatible; AIResumeGenerator/1.0; +Personal CV optimization tool)"
        );
        _httpClient.Timeout = TimeSpan.FromSeconds(10);
    }

    public async Task<JobPostingResult> FetchJobPostingAsync(string url)
    {
        try
        {
            _logger.LogInformation("Fetching job posting from URL: {Url}", url);

            // Validate URL
            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
                (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            {
                return JobPostingResult.Error("Invalid URL format");
            }

            // Try static HTML first (fast)
            _logger.LogInformation("Attempting static HTML extraction...");
            var staticResult = await TryStaticExtractionAsync(url);

            // If we got a good description (>500 chars), use it
            if (staticResult.IsSuccess && staticResult.Description.Length > 500)
            {
                _logger.LogInformation("Static extraction successful, got {Length} chars", staticResult.Description.Length);
                return staticResult;
            }

            // Otherwise, try Puppeteer for JavaScript-rendered content
            _logger.LogInformation("Static extraction insufficient, trying Puppeteer...");
            return await TryPuppeteerExtractionAsync(url);
        }
        catch (TaskCanceledException)
        {
            return JobPostingResult.Error("Request timed out. Please try again or enter details manually.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "HTTP error fetching job posting");
            return JobPostingResult.Error("Could not connect to the website. Please check the URL and try again.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching job posting from {Url}", url);
            return JobPostingResult.Error("An error occurred while fetching the job posting.");
        }
    }

    private async Task<JobPostingResult> TryStaticExtractionAsync(string url)
    {
        try
        {
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                return JobPostingResult.Error($"Failed to fetch page: {response.StatusCode}");
            }

            var html = await response.Content.ReadAsStringAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var jobTitle = ExtractJobTitle(doc);
            var companyName = ExtractCompanyName(doc);
            var description = ExtractDescription(doc);

            if (string.IsNullOrWhiteSpace(jobTitle) && string.IsNullOrWhiteSpace(description))
            {
                return JobPostingResult.Error("Static extraction failed");
            }

            return JobPostingResult.Success(jobTitle, companyName, description);
        }
        catch
        {
            return JobPostingResult.Error("Static extraction failed");
        }
    }

    private async Task<JobPostingResult> TryPuppeteerExtractionAsync(string url)
    {
        IBrowser? browser = null;
        try
        {
            // Download Chromium if not already present (first run only)
            var browserFetcher = new BrowserFetcher();
            await browserFetcher.DownloadAsync();

            // Launch headless browser
            browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true,
                Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
            });

            var page = await browser.NewPageAsync();

            // Set user agent
            await page.SetUserAgentAsync("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            // Navigate and wait for network to be idle
            await page.GoToAsync(url, new NavigationOptions
            {
                WaitUntil = new[] { WaitUntilNavigation.Networkidle2 },
                Timeout = 30000 // 30 seconds
            });

            // Wait a bit more for any lazy-loaded content
            await Task.Delay(2000);

            // Get the rendered HTML
            var html = await page.GetContentAsync();

            // Parse with HtmlAgilityPack
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // Remove cookie banners and navigation (they're now rendered)
            var cookieNodes = doc.DocumentNode.SelectNodes("//*[contains(@id, 'cookie') or contains(@class, 'cookie') or contains(@id, 'consent') or contains(@class, 'consent')]");
            if (cookieNodes != null)
            {
                foreach (var node in cookieNodes)
                    node.Remove();
            }

            var navNodes = doc.DocumentNode.SelectNodes("//nav | //header[@role='banner'] | //*[contains(@class, 'navigation')]");
            if (navNodes != null)
            {
                foreach (var node in navNodes)
                    node.Remove();
            }

            var jobTitle = ExtractJobTitle(doc);
            var companyName = ExtractCompanyName(doc);
            var description = ExtractDescriptionPuppeteer(doc);

            if (string.IsNullOrWhiteSpace(jobTitle) && string.IsNullOrWhiteSpace(description))
            {
                return JobPostingResult.Error("Could not extract job details from this page. Please enter details manually.");
            }

            _logger.LogInformation("Puppeteer extraction successful: {Title} at {Company}, {DescLength} chars",
                jobTitle, companyName, description.Length);

            return JobPostingResult.Success(jobTitle, companyName, description);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Puppeteer extraction failed");
            return JobPostingResult.Error("Could not extract job details. Please enter details manually.");
        }
        finally
        {
            if (browser != null)
            {
                await browser.CloseAsync();
            }
        }
    }

    private string ExtractJobTitle(HtmlDocument doc)
    {
        // Try meta tags first (most reliable)
        var metaTitle = doc.DocumentNode.SelectSingleNode("//meta[@property='og:title']/@content");
        if (metaTitle != null)
        {
            var text = CleanText(metaTitle.GetAttributeValue("content", ""));
            if (IsValidJobTitle(text))
                return text;
        }

        // Try site-specific selectors
        var selectors = new[]
        {
            // Teamtailor
            "//div[@data-controller='job-posting']//h1",
            "//h1[@class='text-4xl' or contains(@class, 'font-bold')]",

            // Generic job boards
            "//h1[contains(@class, 'job-title')]",
            "//h1[contains(@class, 'jobTitle')]",
            "//h1[contains(@class, 'posting-headline')]",
            "//h1[contains(@data-qa, 'job-title')]",

            // Last resort - first h1 that's not obviously wrong
            "//main//h1",
            "//article//h1",
            "//h1"
        };

        foreach (var selector in selectors)
        {
            var node = doc.DocumentNode.SelectSingleNode(selector);
            if (node != null)
            {
                var text = CleanText(node.InnerText);
                if (IsValidJobTitle(text))
                    return text;
            }
        }

        // Fallback to page title (remove site name)
        var titleNode = doc.DocumentNode.SelectSingleNode("//title");
        if (titleNode != null)
        {
            var text = CleanText(titleNode.InnerText);
            // Remove common suffixes like " - Company Name" or " | Indeed.com"
            text = Regex.Replace(text, @"\s*[-|]\s*.+$", "");
            if (IsValidJobTitle(text))
                return text;
        }

        return string.Empty;
    }

    private bool IsValidJobTitle(string text)
    {
        if (string.IsNullOrWhiteSpace(text) || text.Length < 5 || text.Length > 200)
            return false;

        // Filter out common non-job-title text
        var invalidPhrases = new[]
        {
            "cookie", "accept", "vælg", "choose", "privacy", "terms",
            "navigation", "menu", "skip to", "log in", "sign in"
        };

        var lowerText = text.ToLowerInvariant();
        return !invalidPhrases.Any(phrase => lowerText.Contains(phrase));
    }

    private string ExtractCompanyName(HtmlDocument doc)
    {
        // Try meta tags first
        var metaSiteName = doc.DocumentNode.SelectSingleNode("//meta[@property='og:site_name']/@content");
        if (metaSiteName != null)
        {
            var text = CleanText(metaSiteName.GetAttributeValue("content", ""));
            if (!string.IsNullOrWhiteSpace(text) && text.Length < 100)
                return text;
        }

        // Try site-specific selectors
        var selectors = new[]
        {
            // Teamtailor
            "//a[contains(@href, '/jobs')]//img/@alt",
            "//div[contains(@class, 'company-name')]",

            // Generic
            "//span[contains(@class, 'company')]",
            "//div[contains(@class, 'company')]",
            "//a[contains(@class, 'company')]",
            "//*[contains(@class, 'employer')]",
            "//*[contains(@data-qa, 'company')]"
        };

        foreach (var selector in selectors)
        {
            var node = doc.DocumentNode.SelectSingleNode(selector);
            if (node != null)
            {
                var text = selector.Contains("@")
                    ? node.GetAttributeValue(selector.Split('@')[1], "")
                    : node.InnerText;

                text = CleanText(text);
                if (!string.IsNullOrWhiteSpace(text) && text.Length < 100 && text.Length > 2)
                {
                    return text;
                }
            }
        }

        return string.Empty;
    }

    private string ExtractDescription(HtmlDocument doc)
    {
        // Remove cookie banners and navigation before extraction
        var cookieNodes = doc.DocumentNode.SelectNodes("//*[contains(@id, 'cookie') or contains(@class, 'cookie') or contains(@id, 'consent') or contains(@class, 'consent')]");
        if (cookieNodes != null)
        {
            foreach (var node in cookieNodes)
                node.Remove();
        }

        var navNodes = doc.DocumentNode.SelectNodes("//nav | //header[@role='banner'] | //*[contains(@class, 'navigation')]");
        if (navNodes != null)
        {
            foreach (var node in navNodes)
                node.Remove();
        }

        // Try site-specific selectors first
        var selectors = new[]
        {
            // Teamtailor
            "//div[@data-controller='job-posting']//div[contains(@class, 'user-content')]",
            "//div[contains(@class, 'job-details')]",

            // Generic job boards
            "//div[contains(@class, 'job-description')]",
            "//div[contains(@class, 'jobDescription')]",
            "//div[@id='job-description']",
            "//section[contains(@class, 'description')]",
            "//article[contains(@class, 'job')]",
            "//div[contains(@data-qa, 'job-description')]",

            // Broader fallbacks
            "//main//div[contains(@class, 'content')]",
            "//article",
            "//main",

            // Last resort - meta description
            "//meta[@name='description']/@content"
        };

        foreach (var selector in selectors)
        {
            var node = doc.DocumentNode.SelectSingleNode(selector);
            if (node != null)
            {
                var text = selector.Contains("@content")
                    ? node.GetAttributeValue("content", "")
                    : node.InnerText;

                text = CleanText(text);
                if (IsValidDescription(text))
                {
                    // Limit description length
                    return text.Length > 10000 ? text.Substring(0, 10000) + "..." : text;
                }
            }
        }

        return string.Empty;
    }

    private string ExtractDescriptionPuppeteer(HtmlDocument doc)
    {
        // For Puppeteer, we want to be more aggressive and get ALL content
        // Try multiple selectors and combine if needed
        var descriptions = new List<string>();

        var selectors = new[]
        {
            // Teamtailor specific - get all content sections
            "//div[@data-controller='job-posting']//div[contains(@class, 'user-content')]",
            "//div[contains(@class, 'job-description')]",
            "//div[@data-qa='job-description']",

            // Main content area
            "//main",
            "//article",
            "//div[@role='main']"
        };

        foreach (var selector in selectors)
        {
            var nodes = doc.DocumentNode.SelectNodes(selector);
            if (nodes != null)
            {
                foreach (var node in nodes)
                {
                    var text = CleanText(node.InnerText);
                    if (!string.IsNullOrWhiteSpace(text) && text.Length > 100)
                    {
                        descriptions.Add(text);
                    }
                }
            }
        }

        // Take the longest description (most complete)
        var bestDescription = descriptions.OrderByDescending(d => d.Length).FirstOrDefault() ?? string.Empty;

        // Limit length
        return bestDescription.Length > 10000 ? bestDescription.Substring(0, 10000) + "..." : bestDescription;
    }

    private bool IsValidDescription(string text)
    {
        if (string.IsNullOrWhiteSpace(text) || text.Length < 100)
            return false;

        // Filter out if it's mostly cookie/privacy text
        var lowerText = text.ToLowerInvariant();
        var cookieKeywords = new[] { "cookie", "consent", "privacy policy", "terms of service" };

        // If more than 2 cookie-related keywords in first 200 chars, it's probably a banner
        var firstPart = text.Substring(0, Math.Min(200, text.Length)).ToLowerInvariant();
        var cookieCountInStart = cookieKeywords.Count(keyword => firstPart.Contains(keyword));

        return cookieCountInStart < 2;
    }

    private string CleanText(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        // Decode HTML entities
        text = System.Net.WebUtility.HtmlDecode(text);

        // Remove multiple whitespaces and normalize line breaks
        text = Regex.Replace(text, @"\s+", " ");
        text = text.Trim();

        return text;
    }
}

public class JobPostingResult
{
    public bool IsSuccess { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;

    public static JobPostingResult Success(string jobTitle, string companyName, string description)
    {
        return new JobPostingResult
        {
            IsSuccess = true,
            JobTitle = jobTitle,
            CompanyName = companyName,
            Description = description
        };
    }

    public static JobPostingResult Error(string errorMessage)
    {
        return new JobPostingResult
        {
            IsSuccess = false,
            ErrorMessage = errorMessage
        };
    }
}
