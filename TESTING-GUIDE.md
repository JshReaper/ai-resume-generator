# AI Resume Generator - Testing Guide

## ✅ What's Ready

Your hands-free CV upload application is complete with:

### Backend (.NET 10 API)
- ✅ PDF & DOCX CV parsing (UglyToad.PdfPig)
- ✅ Ollama integration for local AI (Llama 3.1 8B)
- ✅ Session-based CV improvement workflow
- ✅ Chat interface for iterative improvements
- ✅ ATS-optimized resume generation

### Frontend (React + TypeScript)
- ✅ Drag & drop file upload (PDF/DOCX)
- ✅ Text paste option (LinkedIn, raw CV)
- ✅ AI-powered CV parsing and analysis
- ✅ Interactive chat for refinements
- ✅ Target job customization
- ✅ Enhanced resume preview

## 🚀 How to Test

### Step 1: Start the Backend

Open a terminal and run:

```bash
cd e:/Projects/ai-resume-generator/src/AIResumeGenerator.API
dotnet run
```

You should see:
```
🦙 Using Ollama (Local LLM)
Now listening on: http://localhost:5260
```

### Step 2: Start the Frontend

Open another terminal and run:

```bash
cd e:/Projects/ai-resume-generator/client
npm start
```

This will open http://localhost:3000 in your browser.

### Step 3: Test the Hands-Free Workflow

#### Option A: Upload a CV File
1. Drag & drop a PDF or DOCX resume onto the upload area
2. Wait for AI analysis (10-30 seconds for first request)
3. Review the parsed information
4. Optionally add a target job title/description
5. Chat with AI to make improvements
6. Click "Generate Optimized Resume"

#### Option B: Paste CV Text
1. Click "Paste from LinkedIn or text"
2. Paste your resume content (LinkedIn profile works great!)
3. Click "Analyze Content"
4. Follow steps 3-6 from Option A

## 📝 Test Data Examples

### Sample Text to Paste

```
John Smith
Senior Software Engineer
john.smith@email.com | (555) 123-4567 | linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years building scalable web applications.

EXPERIENCE

Senior Software Engineer - Tech Corp (2020 - Present)
• Led development of microservices architecture serving 1M+ users
• Mentored team of 5 junior developers
• Reduced API response time by 40% through optimization

Software Developer - StartupCo (2018 - 2020)
• Built RESTful APIs using .NET Core and C#
• Implemented CI/CD pipeline with Azure DevOps

EDUCATION
BS Computer Science - State University (2018)

SKILLS
C#, .NET, React, TypeScript, Azure, Docker, SQL Server
```

### Sample Target Job

**Job Title:** Lead Software Engineer

**Job Description:**
```
We're looking for a Lead Software Engineer with 5+ years experience in .NET and cloud technologies.
Must have experience with microservices, Azure, and leading development teams.
Strong communication skills required.
```

## 🔧 Troubleshooting

### Backend Won't Start
- Make sure Ollama is running: `ollama list`
- Check if port 5260 is available
- Verify appsettings.json has correct Ollama settings

### Frontend Can't Connect
- Verify backend is running on http://localhost:5260
- Check browser console for CORS errors
- Ensure `REACT_APP_API_URL` is not set (defaults to localhost:5260)

### CV Upload Fails
- Supported formats: PDF, DOCX only
- File must contain text (not scanned images)
- Try the text paste option instead

### Ollama Takes Too Long
- First request loads the model into memory (10-30 seconds)
- Subsequent requests are much faster (2-5 seconds)
- Consider using a smaller model: `ollama pull qwen2.5:7b`

## 💡 Tips for Best Results

1. **Include Job Description**: Adding a target job description significantly improves ATS optimization
2. **Use Chat**: Ask AI to "add more metrics" or "make it more senior-level" for better results
3. **Iterate**: Generate resume → review → chat for improvements → regenerate
4. **Print to PDF**: Use browser's Print function (Ctrl+P) to save final resume

## 🎯 Expected Behavior

### Upload Stage
- Drag & drop works instantly
- Text extraction shows loading spinner
- AI analysis takes 10-30 seconds (first time)

### Refine Stage
- Parsed data displayed in left sidebar
- Chat suggestions appear
- Each chat response takes 3-10 seconds
- Target job fields optional but recommended

### Result Stage
- Enhanced resume displayed professionally
- Can go back to edit
- Print/Save as PDF available

## 📊 Performance Notes

With your specs (Ryzen 9 7900X, 32GB RAM, RX 9070 XT):
- Model loading: ~10-20 seconds (first request only)
- CV analysis: ~5-15 seconds
- Chat responses: ~2-5 seconds
- Resume generation: ~10-20 seconds

## 🔐 Privacy

All processing happens locally:
- ✅ Your CV never leaves your machine
- ✅ No external API calls (unless using Claude)
- ✅ Ollama runs 100% local
- ✅ No data storage or tracking
