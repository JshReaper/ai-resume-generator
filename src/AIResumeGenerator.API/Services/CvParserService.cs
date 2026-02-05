using System.IO.Compression;
using System.Text;
using System.Xml.Linq;
using UglyToad.PdfPig;

namespace AIResumeGenerator.API.Services;

public class CvParserService : ICvParserService
{
    private readonly ILogger<CvParserService> _logger;

    public CvParserService(ILogger<CvParserService> logger)
    {
        _logger = logger;
    }

    public Task<string> ExtractTextFromPdfAsync(Stream pdfStream)
    {
        try
        {
            using var document = PdfDocument.Open(pdfStream);
            var textBuilder = new StringBuilder();

            foreach (var page in document.GetPages())
            {
                textBuilder.AppendLine(page.Text);
            }

            return Task.FromResult(textBuilder.ToString());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to extract text from PDF");
            throw new InvalidOperationException("Failed to parse PDF file", ex);
        }
    }

    public Task<string> ExtractTextFromDocxAsync(Stream docxStream)
    {
        try
        {
            using var archive = new ZipArchive(docxStream, ZipArchiveMode.Read);
            var documentEntry = archive.GetEntry("word/document.xml");

            if (documentEntry == null)
            {
                throw new InvalidOperationException("Invalid DOCX file: document.xml not found");
            }

            using var stream = documentEntry.Open();
            var doc = XDocument.Load(stream);

            // Extract text from Word XML
            XNamespace w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
            var textElements = doc.Descendants(w + "t");
            var text = string.Join("", textElements.Select(t => t.Value));

            // Add proper spacing
            var paragraphs = doc.Descendants(w + "p");
            var result = new StringBuilder();

            foreach (var para in paragraphs)
            {
                var paraText = string.Join("", para.Descendants(w + "t").Select(t => t.Value));
                if (!string.IsNullOrWhiteSpace(paraText))
                {
                    result.AppendLine(paraText);
                }
            }

            return Task.FromResult(result.ToString());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to extract text from DOCX");
            throw new InvalidOperationException("Failed to parse DOCX file", ex);
        }
    }
}
