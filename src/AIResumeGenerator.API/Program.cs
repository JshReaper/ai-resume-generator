using AIResumeGenerator.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Configure HttpClient for Ollama with extended timeout (5 minutes)
// LLM inference can be slow, especially on first request when model loads
builder.Services.AddHttpClient("Ollama", client =>
{
    client.Timeout = TimeSpan.FromMinutes(5); // 300 seconds
});

// Configure HttpClient for job posting fetcher with shorter timeout
builder.Services.AddHttpClient<JobPostingFetcherService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(10); // Quick timeout for web scraping
});

// Register CV parsing service
builder.Services.AddScoped<ICvParserService, CvParserService>();
builder.Services.AddSingleton<IPhoneNumberFormatter, PhoneNumberFormatter>();

// Register AI services based on configuration
// Options: "Ollama" (default, free local), "Claude" (paid API)
var aiProvider = builder.Configuration["AI:Provider"] ?? "Ollama";

if (aiProvider.Equals("Claude", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddScoped<IResumeService, ResumeService>();
    // TODO: Add Claude CV session service
    Console.WriteLine("📡 Using Claude AI (Anthropic API)");
}
else
{
    builder.Services.AddScoped<IResumeService, OllamaResumeService>();
    builder.Services.AddSingleton<ICvSessionService, OllamaCvSessionService>();
    Console.WriteLine("🦙 Using Ollama (Local LLM)");
}

// Configure CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();
