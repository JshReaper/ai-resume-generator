namespace AIResumeGenerator.API.Services;

public interface ICvParserService
{
    Task<string> ExtractTextFromPdfAsync(Stream pdfStream);
    Task<string> ExtractTextFromDocxAsync(Stream docxStream);
}
