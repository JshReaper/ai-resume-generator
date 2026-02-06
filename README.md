# 🤖 AI Resume Generator

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-40%20passing-success)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

> AI-powered resume generator running 100% locally with Ollama. Privacy-first design with dual-language support (English/Danish), post-generation editor, and direct PDF export. Your data never leaves your machine.

## ✨ Features

### 🎯 Core Functionality
- **📄 Multi-Format Upload**: Drag & drop PDF/DOCX or paste text from LinkedIn
- **🤖 AI Analysis**: Automatic CV parsing and content extraction
- **✏️ Post-Generation Editor**: Edit all resume fields before downloading
- **🌍 Dual Language**: Independent UI and CV language (English/Danish)
- **📥 Direct PDF Export**: Download formatted PDFs without print dialog
- **✉️ Cover Letter Generator**: AI-generated cover letters for job applications
- **📱 Phone Formatting**: Automatic locale-specific number formatting

### 🔐 Privacy First
- ✅ **100% Local Processing** - No data sent to external servers
- ✅ **Ollama Integration** - Free, offline AI inference
- ✅ **No Tracking** - Zero telemetry or analytics
- ✅ **Optional Cloud** - Claude API support if preferred

### 🎨 User Experience
- **Resume Editor**: Modify name, contact, summary, experiences, and skills after generation
- **Template System**: Clean, professional resume layouts
- **Skills Management**: Add/remove existing and AI-suggested skills
- **Responsive Design**: Works on desktop and tablet

## 🏗️ Architecture

```
┌─────────────────────┐
│   React Frontend    │
│   (TypeScript)      │
│   • Upload UI       │
│   • Resume Editor   │
│   • PDF Export      │
└──────────┬──────────┘
           │ REST API
           ▼
┌─────────────────────┐
│    .NET 10 API      │
│   • CV Parsing      │
│   • AI Integration  │
│   • Phone Formatter │
└─────────┬───────────┘
          │
     ┌────┴────┐
     ▼         ▼
┌─────────┐ ┌──────────────┐
│ PdfPig  │ │   Ollama     │
│ DOCX    │ │ (Llama 3.1)  │
└─────────┘ └──────────────┘
```

## 🚀 Quick Start

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 18+](https://nodejs.org/)
- [Ollama](https://ollama.com/download)

### Installation

**1. Install Ollama and pull the model:**
```bash
ollama pull llama3.1:8b
```

**2. Clone and setup:**
```bash
git clone https://github.com/JshReaper/ai-resume-generator.git
cd ai-resume-generator
```

**3. Start the backend:**
```bash
cd src/AIResumeGenerator.API
dotnet restore
dotnet run
```
Backend runs on: `https://localhost:7070`

**4. Start the frontend:**
```bash
cd client
npm install
npm start
```
Frontend opens: `http://localhost:3000`

**5. Upload your CV and generate!** 🎉

See [SETUP.md](SETUP.md) for detailed installation instructions.

## 📖 Usage

### Workflow

```
Upload CV → Refine → Generate → Edit → Download PDF
                  ↓
          Cover Letter (optional)
```

**Step 1: Upload**
- Drag & drop CV (PDF/DOCX)
- Or paste LinkedIn profile text
- AI automatically extracts all information

**Step 2: Refine (Optional)**
- Add target job title/description for ATS optimization
- Chat with AI to improve sections
- Review parsed information

**Step 3: Generate**
- Click "Generate Resume"
- AI rewrites with action verbs and keywords
- Professional summary generated
- Skills suggestions added

**Step 4: Edit**
- Click "✏️ Edit Resume"
- Modify any field (contact, summary, experiences, skills)
- Add/remove responsibilities and skills
- Save changes to update preview

**Step 5: Download**
- Click "📄 Download PDF"
- Direct download (no print dialog)
- Text-based, searchable PDF

**Bonus: Cover Letter**
- Click "✉️ Generate Cover Letter"
- Enter job details
- AI writes tailored cover letter
- Download as separate PDF

## 🌍 Language Support

### Dual Language System

**UI Language** (Interface):
- 🇬🇧 English
- 🇩🇰 Dansk

**CV Output Language** (Resume content):
- 🇬🇧 English
- 🇩🇰 Dansk

**Independent Control:**
- Danish user can generate English CV
- English user can generate Danish CV
- All labels, buttons, and messages translated

## ⚙️ Configuration

### Backend (appsettings.json)

**Using Ollama (Default - Free):**
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

**Using Claude API (Optional):**
```bash
# Set API key via user secrets (not in appsettings.json!)
dotnet user-secrets set "Claude:ApiKey" "sk-ant-your-key"
```

```json
{
  "AI": {
    "Provider": "Claude"
  },
  "Claude": {
    "Model": "claude-sonnet-4-20250514"
  }
}
```

### Alternative Ollama Models

```bash
# Faster (smaller)
ollama pull llama3.1:7b

# Better quality (needs more VRAM)
ollama pull qwen2.5:14b

# Update appsettings.json
"Model": "qwen2.5:14b"
```

## 🧪 Testing

### Backend Tests (18 tests)
```bash
cd src/AIResumeGenerator.API.Tests
dotnet test
```

**Coverage:**
- ✅ Phone number formatting (Danish/US)
- ✅ Timeout handling
- ✅ Language support
- ✅ Error scenarios
- ✅ Service integration

### Frontend Tests (22 tests)
```bash
cd client
npm test
```

**Coverage:**
- ✅ Component rendering
- ✅ Translation completeness
- ✅ Language selector behavior
- ✅ File upload UI

**All tests run standalone - no services needed!**

## 🛠️ Tech Stack

### Backend
- **.NET 10** - Modern C# API with minimal APIs
- **UglyToad.PdfPig** - PDF text extraction
- **libphonenumber-csharp** - International phone formatting
- **Ollama** - Local LLM inference
- **xUnit + Moq + FluentAssertions** - Testing

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **jsPDF** - Direct PDF generation
- **Axios** - HTTP client
- **Jest + React Testing Library** - Testing

## 📊 Performance

With recommended specs (Ryzen 9, 32GB RAM, modern GPU):
- Model loading: 10-20s (first request only)
- CV analysis: 5-15s
- Resume generation: 10-20s
- PDF export: <1s (instant)

## 🐛 Troubleshooting

**Backend won't start:**
```bash
# Check Ollama is running
ollama list

# Check port 7070 is free
netstat -ano | findstr :7070  # Windows
lsof -i :7070                  # macOS/Linux
```

**Frontend can't connect:**
- Verify backend is running on `https://localhost:7070`
- Check CORS settings in backend

**Upload fails:**
- Ensure PDF has text (not scanned image)
- Check file size < 10MB
- Verify file format is PDF or DOCX

**Tests fail:**
- Restore packages: `dotnet restore` / `npm install`
- Clear caches: `dotnet clean` / `rm -rf node_modules`

## 📁 Project Structure

```
ai-resume-generator/
├── src/
│   ├── AIResumeGenerator.API/           # .NET backend
│   │   ├── Controllers/                 # API endpoints
│   │   ├── Services/                    # Business logic
│   │   └── appsettings.json            # Configuration
│   └── AIResumeGenerator.API.Tests/     # Backend tests
├── client/                              # React frontend
│   ├── src/
│   │   ├── components/                  # React components
│   │   │   ├── FileUpload.tsx          # CV upload
│   │   │   ├── ResumeEditor.tsx        # Post-gen editor
│   │   │   └── CoverLetter.tsx         # Cover letter gen
│   │   ├── utils/
│   │   │   └── pdfExport.ts            # PDF generation
│   │   └── translations.ts              # i18n strings
│   └── package.json
├── SETUP.md                             # Installation guide
└── README.md                            # This file
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## 📄 License

MIT License - Free for personal and commercial use.

## 🙏 Acknowledgments

- **Ollama** - For making local LLM inference accessible
- **PdfPig** - For excellent PDF parsing
- **Anthropic** - For Claude AI (optional integration)
- **libphonenumber** - For international phone formatting

## 🔗 Links

- **Repository**: https://github.com/JshReaper/ai-resume-generator
- **Issues**: https://github.com/JshReaper/ai-resume-generator/issues
- **Ollama**: https://ollama.com
- **Anthropic Claude**: https://claude.ai

---

**Built with ❤️ for job seekers who want control over their data**

*Privacy-first • Open Source • 100% Local*
