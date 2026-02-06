# Setup Instructions

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 18+](https://nodejs.org/)
- [Ollama](https://ollama.ai/) (for local AI)

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ai-resume-generator
```

### 2. Backend Setup

```bash
cd src/AIResumeGenerator.API

# Restore dependencies
dotnet restore

# (Optional) If using Claude API instead of Ollama
dotnet user-secrets init
dotnet user-secrets set "Claude:ApiKey" "your-actual-api-key-here"
```

### 3. Frontend Setup

```bash
cd ../../client
npm install
```

### 4. Start Ollama

```bash
# Download the model (one-time, ~8GB download)
ollama pull qwen2.5:14b

# Ollama runs as a service on localhost:11434
# First load takes 15-30s to load model into VRAM
```

## Running the Application

### Terminal 1 - Backend
```bash
cd src/AIResumeGenerator.API
dotnet run
```
Backend runs on: `https://localhost:7070`

### Terminal 2 - Frontend
```bash
cd client
npm start
```
Frontend runs on: `http://localhost:3000`

## Configuration

### Using Ollama (Default - No API Key Needed)
The app uses Ollama by default (free, runs locally). No configuration needed!

### Using Claude API (Optional)
To use Anthropic's Claude API instead:

1. Get an API key from [console.anthropic.com](https://console.anthropic.com/)
2. Set it using **one** of these methods:

   **Option A: User Secrets (Recommended)**
   ```bash
   cd src/AIResumeGenerator.API
   dotnet user-secrets set "Claude:ApiKey" "sk-ant-your-key-here"
   ```

   **Option B: Environment Variable**
   ```bash
   export Claude__ApiKey="sk-ant-your-key-here"
   ```

   **Option C: appsettings.Development.json** (create this file, it's gitignored)
   ```json
   {
     "Claude": {
       "ApiKey": "sk-ant-your-key-here"
     }
   }
   ```

3. Update `appsettings.json`:
   ```json
   "AI": {
     "Provider": "Claude"  // Change from "Ollama" to "Claude"
   }
   ```

## Testing

### Backend Tests
```bash
cd src/AIResumeGenerator.API.Tests
dotnet test
```

### Frontend Tests
```bash
cd client
npm test
```

## Security Notes

⚠️ **Never commit real API keys to Git!**

- Use User Secrets, environment variables, or `appsettings.Development.json` (gitignored)
- `appsettings.json` should only contain placeholders
- Generated PDFs (in `pdf outputs/`) are automatically excluded from Git

## Troubleshooting

### Ollama Connection Issues
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama service if needed
```

### Backend Won't Start
```bash
# Check if port 7070 is in use
netstat -ano | findstr :7070  # Windows
lsof -i :7070                  # macOS/Linux

# Try a different port in launchSettings.json
```

### Frontend Build Errors
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
```

## License

[Your License Here]

## Contributing

[Contribution guidelines]
