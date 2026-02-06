# Features & Implementation Details

Complete feature list and technical implementation notes for the AI Resume Generator.

## Table of Contents
- [Core Features](#core-features)
- [Job Posting URL Fetcher](#job-posting-url-fetcher)
- [Resume Editor](#resume-editor)
- [PDF Export](#pdf-export)
- [Language System](#language-system)
- [Testing](#testing)
- [Phone Number Formatting](#phone-number-formatting)

---

## Core Features

### 1. CV Upload & Parsing

**Supported Formats:**
- PDF (text-based, not scanned)
- DOCX (Microsoft Word)
- Plain text paste (LinkedIn profiles, etc.)

**Extraction:**
- Full name
- Contact information (email, phone, LinkedIn)
- Work experience (title, company, dates, responsibilities)
- Education (degree, institution, field, graduation year)
- Skills
- Professional summary

**Technology:**
- Backend: UglyToad.PdfPig for PDF extraction
- Backend: System.IO.Compression for DOCX
- Frontend: File upload with drag-and-drop

### 2. AI Processing

**Capabilities:**
- Professional summary generation
- Resume enhancement with action verbs
- Skill suggestions based on experience
- ATS keyword optimization
- Cover letter generation

**AI Providers:**
- **Ollama** (default): Free, local, privacy-first
  - Model: qwen2.5:14b (excellent quality, balanced performance)
  - Alternative: llama3.1:8b (faster), qwen2.5:32b (best quality)
  - No API key required
  - Data never leaves your machine
  - ~14GB VRAM required for 14b model
- **Claude API** (optional): Cloud-based alternative
  - Model: claude-sonnet-4
  - Requires API key
  - Comparable quality to qwen2.5:14b

**Configuration:**
```json
// appsettings.json
{
  "AI": {
    "Provider": "Ollama"  // or "Claude"
  },
  "Ollama": {
    "Model": "qwen2.5:14b"  // Default: balanced quality/performance
  }
}
```

**Model Selection:**
- `qwen2.5:14b` - **Recommended** (excellent quality, ~14GB VRAM)
- `llama3.1:8b` - Faster, lower VRAM (~8GB)
- `qwen2.5:32b` - Best quality, slower (~20GB VRAM)

---

## Job Posting URL Fetcher

**Automatic Job Details Extraction:** Paste a job posting URL and automatically extract job details to tailor your resume.

### How It Works

Instead of manually copying job title and description, simply:
1. **Paste URL** - Enter the link to any public job posting
2. **Fetch Details** - Click button to automatically extract information
3. **Auto-populate** - Job title and description fields are filled automatically
4. **Generate** - Create tailored resume based on the specific job

### Supported Sites

Works with **most public job boards**:
- ✅ LinkedIn Jobs
- ✅ Indeed
- ✅ Glassdoor
- ✅ Company career pages
- ✅ Monster, ZipRecruiter, etc.
- ✅ Any publicly accessible job posting

### Legal & Ethical Compliance

**Fully Compliant Scraping:**
- ✅ Only public job postings (no login required)
- ✅ Respects robots.txt rules
- ✅ Proper User-Agent identification
- ✅ Rate limiting (10s timeout)
- ✅ For personal use only (not republishing)
- ✅ Graceful error handling with manual fallback

**What We Extract:**
- Job title
- Company name
- Job description
- Requirements

**Privacy:**
- No data stored or cached
- Only fetched when you explicitly click "Fetch"
- Data used only to populate your fields

### Technical Implementation

**Backend Service:** [JobPostingFetcherService.cs](src/AIResumeGenerator.API/Services/JobPostingFetcherService.cs)

**Hybrid Extraction Strategy:**
1. **Try Static HTML First** (fast, ~2s)
   - Uses HtmlAgilityPack + HttpClient
   - Works for simple sites with server-rendered content
   - If description > 500 chars, success!

2. **Fallback to Puppeteer** (slower, ~10-15s, but thorough)
   - Launches headless Chrome
   - Renders JavaScript content
   - Waits for lazy-loaded sections
   - Extracts complete job description

**Technology:**
- **PuppeteerSharp** - Headless Chrome automation (free, open source)
- **HtmlAgilityPack** - HTML parsing library
- **HttpClient** - Initial static requests
- **Pattern matching** - Site-specific and generic selectors

**Extraction Logic:**
```csharp
// Hybrid approach
var staticResult = await TryStaticExtractionAsync(url);
if (staticResult.Description.Length > 500)
    return staticResult; // Fast path

// JavaScript-heavy sites need Puppeteer
return await TryPuppeteerExtractionAsync(url);
```

**Puppeteer Features:**
- Auto-downloads Chromium on first run (~150MB, one-time)
- Headless mode (no GUI)
- Network idle detection
- JavaScript execution
- Full page rendering

**Error Handling:**
- Invalid URL → User-friendly error message
- Timeout (>10s) → Suggest manual entry
- Parsing fails → Falls back to manual input
- Network error → Clear error feedback

**API Endpoint:**
```
POST /api/cv/fetch-job
Body: { "url": "https://example.com/jobs/12345" }
Response: {
  "isSuccess": true,
  "jobTitle": "Senior Software Engineer",
  "companyName": "Tech Corp",
  "description": "We are looking for...",
  "errorMessage": ""
}
```

### User Experience

**Workflow:**
```
Refine Step → Enter Job URL → Click "Fetch Details"
                                    ↓
                              Fields Auto-Fill
                                    ↓
                         (Or manually edit/enter)
                                    ↓
                            Generate Resume
```

**UI Components:**
- URL input field with validation
- "Fetch Details" button (disabled when empty)
- Loading state: "Fetching..."
- Success: Fields populate automatically
- Error: Friendly message with manual fallback
- Hint text: "Or manually enter job details below"

**Translations:**
- English: "🔗 Fetch from Job Posting URL"
- Danish: "🔗 Hent fra Jobopslag URL"

### Limitations

**Won't Work:**
- ❌ Login-required job postings (private/authenticated content)
- ❌ Sites with aggressive bot detection (CAPTCHA, cloudflare challenges)
- ❌ PDFs or non-HTML documents

**Now Works With Puppeteer:**
- ✅ JavaScript-rendered sites (Teamtailor, modern SPAs)
- ✅ Lazy-loaded content
- ✅ Dynamic job boards

**Performance:**
- Static sites: ~2 seconds
- JavaScript sites: ~10-15 seconds (includes browser launch + render)
- First run: +5s (Chromium download, one-time)

**Solution:** Always includes manual entry fallback

### Future Improvements

Possible enhancements:
- [ ] More site-specific extractors (LinkedIn, Indeed APIs)
- [ ] Salary information extraction
- [ ] Required skills detection
- [ ] Browser cache for faster subsequent requests

---

## Resume Editor

**Post-Generation Editing:** After AI generates your resume, you can edit all content before downloading.

### Editable Fields

**Contact Information:**
- Full Name
- Email
- Phone
- LinkedIn URL

**Professional Summary:**
- Multi-line text area
- Edit AI-generated summary
- Live preview updates

**Work Experience:**
For each job:
- Job Title
- Company
- Start Date / End Date
- Responsibilities (add/remove bullet points)

**Skills:**
- Existing Skills (from your CV)
- Suggested Skills (AI recommendations)
- Add/remove skills from either list
- Each list managed independently

### User Flow

```
Generate Resume → Click "✏️ Edit Resume" → Edit Form
                                              ↓
                                         Save Changes
                                              ↓
                                       Preview Updated
                                              ↓
                                      Download PDF
```

### Technical Implementation

**Component:** [ResumeEditor.tsx](client/src/components/ResumeEditor.tsx) (343 lines)

**State Management:**
```typescript
const [fullName, setFullName] = useState(cvData.fullName || '');
const [experiences, setExperiences] = useState<EnhancedWorkExperience[]>(
  resumeData.enhancedExperiences || []
);
// ... etc for all fields
```

**Data Flow:**
1. User clicks "Edit Resume"
2. `ResumeEditor` component receives current data as props
3. User modifies fields in controlled form
4. Click "Save Changes" triggers `onSave()` callback
5. Parent component (`App.tsx`) updates state
6. Preview refreshes with edited content
7. PDF export uses updated data

**Styling:** [ResumeEditor.css](client/src/components/ResumeEditor.css) (241 lines)
- Modern, responsive design
- Form controls with proper spacing
- Add/remove buttons for dynamic lists
- Mobile-friendly layout

---

## PDF Export

**Direct Download:** No print dialog required - downloads PDF directly to your computer.

### Implementation

**Technology:** jsPDF (programmatic PDF generation)

**Why jsPDF over Browser Print:**
| Feature | window.print() | jsPDF |
|---------|----------------|-------|
| User Action Required | ✅ Print dialog | ❌ None |
| Direct Download | ❌ No | ✅ Yes |
| Browser Headers/Footers | ✅ Yes (unwanted) | ❌ None |
| Full Content Control | ❌ Limited | ✅ Complete |
| Text-Based | ✅ Yes | ✅ Yes |

**File:** [pdfExport.ts](client/src/utils/pdfExport.ts) (197 lines)

**PDF Structure:**
```typescript
export const exportResumeToPdf = (options: PDFExportOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Add content programmatically:
  // 1. Name (22pt, bold)
  // 2. Contact info (10pt, gray)
  // 3. Professional Summary (with section header)
  // 4. Work Experience (with bullet points)
  // 5. Education
  // 6. Skills (comma-separated, all in black)

  doc.save(filename);
};
```

**Typography:**
| Element | Font Size | Style | Color |
|---------|-----------|-------|-------|
| Name | 22pt | Bold | #1a1a1a |
| Contact | 10pt | Normal | #666666 |
| Section Headers | 14pt | Bold | #4f46e5 |
| Job Titles | 11pt | Bold | #000000 |
| Body Text | 10pt | Normal | #000000 |
| Bullet Points | 9pt | Normal | #000000 |

**Features:**
- ✅ Automatic word wrapping
- ✅ Page breaks when needed
- ✅ Searchable, copyable text
- ✅ No UI elements (clean output)
- ✅ No browser headers/footers
- ✅ Skills in uniform black (no color issues)

**Cover Letter Export:**
```typescript
export const exportCoverLetterToPdf = (
  content: string,
  language: string,
  filename: string
) => {
  // Simple text layout with wrapping
  // Same jsPDF approach
}
```

---

## Language System

**Dual Language Support:** Independent control of UI language and CV output language.

### Architecture

**UI Language:** Changes interface text (buttons, labels, messages)
**CV Language:** Changes resume content headings and template text

**Example Use Case:**
- Danish user generating English CV
- UI in Dansk, CV output in English
- Sections: "Experience", "Education", "Skills" (not "Erfaring", "Uddannelse")

### Implementation

**File:** [translations.ts](client/src/translations.ts) (185 lines)

**Structure:**
```typescript
export interface Translations {
  header: { title, subtitle, startOver };
  upload: { stepTitle, stepDescription };
  refine: { ... };
  result: { ... };
  template: {
    professionalSummary: string;  // "Professional Summary" or "faglig profil"
    experience: string;            // "Experience" or "Erfaring"
    education: string;             // "Education" or "Uddannelse"
    skills: string;                // "Skills" or "Færdigheder"
    present: string;               // "Present" or "Nu"
  };
  fileUpload: { ... };
}
```

**Languages:**
- **English** (`en`): Full UI and template
- **Danish** (`da`): Complete translation

**Usage:**
```typescript
const t = getTranslation(uiLanguage);
<h3>{t.template.experience}</h3>
```

**Components Using Translations:**
- FileUpload (upload screen text)
- ResumeTemplates (section headings)
- DualLanguageSelector (language picker)
- All buttons and labels

**Testing:**
- ✅ Translation completeness verified
- ✅ All keys exist in both languages
- ✅ Structure consistency validated

---

## Testing

**Test Suite:** 40 tests, all passing

### Backend Tests (18 tests, 3m 22s)

**File:** [PhoneNumberFormatterTests.cs](src/AIResumeGenerator.API.Tests/Services/PhoneNumberFormatterTests.cs)

**Coverage:**
```csharp
[Theory]
[InlineData("87654321", "DK", "87 65 43 21")]  // Danish formatting
[InlineData("5551234567", "US", "(555) 123-4567")]  // US formatting
public void FormatPhoneNumber_FormatsCorrectly(
    string input, string countryCode, string expected)
{
    var result = _formatter.FormatPhoneNumber(input, countryCode);
    result.Should().Be(expected);
}
```

**File:** [OllamaCvSessionServiceTests.cs](src/AIResumeGenerator.API.Tests/Services/OllamaCvSessionServiceTests.cs)

**Coverage:**
- ✅ Valid CV processing
- ✅ Timeout scenarios (100s timeout)
- ✅ Slow responses (within timeout)
- ✅ Ollama not responding (connection errors)
- ✅ Different languages (English/Danish prompts)

**Technology:**
- xUnit
- Moq (HTTP client mocking)
- FluentAssertions

**Run:**
```bash
cd src/AIResumeGenerator.API.Tests
dotnet test
```

### Frontend Tests (22 tests, 3.1s)

**Files:**
- [App.test.tsx](client/src/App.test.tsx)
- [DualLanguageSelector.test.tsx](client/src/components/DualLanguageSelector.test.tsx)
- [translations.test.ts](client/src/translations.test.ts)

**Coverage:**
- ✅ Component rendering (header, upload, language selectors)
- ✅ Language selector independence (UI vs CV language)
- ✅ Translation completeness (all keys in both languages)
- ✅ Translation structure validation

**Technology:**
- Jest
- React Testing Library
- @testing-library/jest-dom

**Special Setup:** [setupTests.ts](client/src/setupTests.ts)
```typescript
// Polyfill for jsPDF dependencies
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
```

**Run:**
```bash
cd client
npm test -- --watchAll=false
```

### Test Independence

**No Services Required:**
- ❌ Backend API (mocked)
- ❌ Ollama (mocked HTTP responses)
- ❌ Frontend dev server (not needed)

Tests run standalone with mock dependencies.

---

## Phone Number Formatting

**Automatic Locale Formatting:** Formats phone numbers based on country code.

### Implementation

**File:** [PhoneNumberFormatter.cs](src/AIResumeGenerator.API/Services/PhoneNumberFormatter.cs)

**Library:** libphonenumber-csharp v8.13.50

**Logic:**
```csharp
public string FormatPhoneNumber(string phoneNumber, string countryCode = "DK")
{
    var number = _phoneUtil.Parse(phoneNumber, countryCode);

    // If input has country code prefix, use international format
    if (phoneNumber.Trim().StartsWith("+"))
    {
        return _phoneUtil.Format(number, PhoneNumberFormat.INTERNATIONAL);
    }

    // Otherwise use national format
    return _phoneUtil.Format(number, PhoneNumberFormat.NATIONAL);
}
```

### Formatting Examples

**Danish:**
- `"20123456"` → `"20 12 34 56"` (mobile)
- `"87654321"` → `"87 65 43 21"` (landline)
- `"+4520123456"` → `"+45 20 12 34 56"` (international)

**US:**
- `"2025551234"` → `"(202) 555-1234"`
- `"5551234567"` → `"(555) 123-4567"`
- `"+12025551234"` → `"+1 202-555-1234"`

**Behavior:**
- Valid numbers: Formatted according to locale
- Invalid/unrecognized: Returned unchanged
- Preserves international format if input has `+` prefix

---

## Security & Privacy

### Data Handling

**Local Processing:**
- All CV parsing happens on your machine
- Ollama runs locally (no external calls)
- No data sent to external servers

**No Storage:**
- Sessions exist only in memory
- No database or file persistence
- Generated PDFs saved locally only

**Git Security:**
```gitignore
# User generated content
pdf outputs/       # PDFs never committed
```

**API Key Management:**
- ❌ Never commit real keys to appsettings.json
- ✅ Use dotnet user-secrets for development
- ✅ Use environment variables for production

**Example:**
```bash
dotnet user-secrets set "Claude:ApiKey" "sk-ant-your-key"
```

### What's Committed to GitHub

**✅ Safe:**
- Source code
- Configuration with placeholders
- Documentation
- Tests

**❌ Never:**
- Generated PDFs
- Real API keys
- Build outputs
- Dependencies (node_modules)

---

## Bundle Size

**Frontend (gzipped):**
- Main JS: 210.28 KB
- CSS: 4.79 KB
- Total: ~215 KB

**Trade-offs:**
- jsPDF added ~128 KB (for direct PDF download)
- Worth it: Better UX, clean output, full control

---

## Browser Compatibility

**Tested:**
- ✅ Chrome 120+
- ✅ Firefox 121+
- ✅ Edge 120+
- ✅ Safari 17+

**Requirements:**
- ES2020 support
- TextEncoder/TextDecoder
- Modern CSS (Grid, Flexbox)

---

## Future Enhancements

**Possible Features:**
- [ ] Multiple resume templates
- [ ] Session persistence (save/load)
- [ ] Batch processing
- [ ] LinkedIn import via API
- [ ] ATS score calculator
- [ ] Export to other formats (DOCX, JSON)

**Not Planned:**
- Cloud storage (privacy-first design)
- User accounts (local-only)
- External integrations (data privacy)

---

*Last Updated: February 2026*
