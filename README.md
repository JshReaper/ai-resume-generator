# 🤖 AI Resume Generator

An intelligent, hands-free CV enhancement tool powered by local AI. Upload your resume, chat with AI to improve it, and generate an ATS-optimized version—all running 100% locally on your machine.

![Built with .NET 10, React, TypeScript, and Ollama](https://img.shields.io/badge/stack-.NET%2010%20%7C%20React%20%7C%20Ollama-blueviolet)

## ✨ Features

### 🎯 Hands-Free Experience
- **Drag & Drop Upload**: Just drop your PDF or DOCX resume
- **LinkedIn Paste**: Copy your LinkedIn profile and paste it
- **AI Parsing**: Automatically extracts all your information
- **Smart Analysis**: AI provides immediate feedback and suggestions

### 💬 Interactive Refinement
- **Chat Interface**: Talk to AI to improve your resume
- **Suggested Prompts**: Quick actions like "make it sound more senior"
- **Target Job Optimization**: Add job description for ATS keywords
- **Iterative Improvements**: Refine until perfect

### 🎨 Professional Output
- **Enhanced Resume**: AI rewrites with action verbs and metrics
- **ATS Keywords**: Optimized for applicant tracking systems
- **Skill Suggestions**: AI recommends relevant skills to add
- **Print to PDF**: One-click save to PDF

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │
│  (TypeScript)   │
└────────┬────────┘
         │ HTTP/JSON
         ▼
┌─────────────────┐
│  .NET 10 API    │
│  (Controllers)  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────────┐
│ PdfPig │ │ Ollama       │
│ Parser │ │ (Llama 3.1)  │
└────────┘ └──────────────┘
```

## 🚀 Quick Start

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [Ollama](https://ollama.com/download)

### Installation

1. **Install Ollama and pull the model:**
   ```bash
   ollama pull llama3.1:8b
   ```

2. **Start the backend:**
   ```bash
   cd src/AIResumeGenerator.API
   dotnet run
   # Should show: 🦙 Using Ollama (Local LLM)
   # Listening on: http://localhost:5260
   ```

3. **Start the frontend:**
   ```bash
   cd client
   npm install
   npm start
   # Opens http://localhost:3000
   ```

4. **Upload your CV and let AI do the work!**

## 📖 Usage

### Step 1: Upload
- Drag & drop your CV (PDF/DOCX)
- **OR** paste text from LinkedIn/resume

### Step 2: Refine
- Review AI-parsed information
- Add target job title/description (optional but recommended)
- Chat with AI to improve specific sections
- Use suggested prompts for quick improvements

### Step 3: Generate
- Click "Generate Optimized Resume"
- Review enhanced version
- Print to PDF or go back to refine more

## 🎨 Screenshots

### Upload Screen
```
┌─────────────────────────────────────┐
│  📄 Drop your CV here               │
│     or click to browse              │
│                                     │
│  Supports PDF & DOCX                │
└─────────────────────────────────────┘
           or
┌─────────────────────────────────────┐
│  📋 Paste from LinkedIn or text     │
└─────────────────────────────────────┘
```

### Refine Screen
```
┌──────────────┬─────────────────────────┐
│ CV Summary   │ 💬 Chat with AI         │
│              │                         │
│ 🤖 AI: "Your│ Suggested prompts:      │
│ resume is    │ • Make it more senior   │
│ strong but   │ • Add technical keywords│
│ could use    │ • Quantify achievements │
│ more metrics"│                         │
│              │ Your message: _         │
│ 3 Jobs       │                         │
│ 2 Education  │ ✨ Generate Resume      │
│ 12 Skills    │                         │
└──────────────┴─────────────────────────┘
```

## ⚙️ Configuration

### Backend (appsettings.json)
```json
{
  "AI": {
    "Provider": "Ollama"
  },
  "Ollama": {
    "BaseUrl": "http://localhost:11434",
    "Model": "llama3.1:8b"
  }
}
```

### Alternative Models
```bash
# Smaller/faster (7B model)
ollama pull qwen2.5:7b

# Better quality (14B model, needs ~10GB VRAM)
ollama pull qwen2.5:14b

# Update appsettings.json to use it
"Model": "qwen2.5:14b"
```

## 🔐 Privacy & Security

- ✅ **100% Local Processing**: Your CV never leaves your machine
- ✅ **No External APIs**: Everything runs on localhost (when using Ollama)
- ✅ **No Data Storage**: Sessions exist only in memory
- ✅ **No Tracking**: Zero telemetry or analytics

## 🛠️ Tech Stack

### Backend
- **.NET 10** - Modern C# API
- **UglyToad.PdfPig** - PDF text extraction
- **Ollama** - Local LLM inference
- **System.IO.Compression** - DOCX parsing

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **CSS3** - Modern styling

## 📊 Performance

With recommended specs (Ryzen 9, 32GB RAM, modern GPU):
- Model loading: 10-20 sec (first request only)
- CV analysis: 5-15 sec
- Chat responses: 2-5 sec
- Resume generation: 10-20 sec

## 🐛 Troubleshooting

See [TESTING-GUIDE.md](TESTING-GUIDE.md) for detailed troubleshooting.

**Quick fixes:**
- Backend won't start: `ollama list` to verify Ollama is running
- Frontend can't connect: Check backend is on http://localhost:5260
- Upload fails: Ensure PDF has text (not scanned image)

## 🚧 Roadmap

- [ ] PDF export (not just print)
- [ ] Multiple resume templates
- [ ] Session persistence (save/load)
- [ ] Cover letter generation
- [ ] LinkedIn profile import via API
- [ ] Batch processing for multiple versions

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Open an issue to discuss ideas.

## 📄 License

MIT License - feel free to use for personal or commercial purposes.

## 🙏 Acknowledgments

- **Ollama** - For making local LLM inference accessible
- **PdfPig** - For excellent PDF parsing
- **Anthropic** - For Claude AI inspiration (optional integration)

---

**Built with ❤️ for job seekers who want control over their data**
