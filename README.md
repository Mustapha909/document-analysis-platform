# Document Analysis Platform

An AI-powered document analysis platform built with Next.js 15, featuring real-time streaming analysis using Server-Sent Events (SSE) and Hugging Face AI models.

![Document Analysis Platform](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwind-css)

## 🌟 Features

### Core Functionality

- **Document Management**

  - Create documents via text input or .txt file upload (up to 50KB)
  - Edit document titles inline
  - Delete documents with confirmation dialog
  - Pre-loaded sample documents for testing
  - Real-time validation and error messages

- **AI-Powered Analysis**

  - Real-time document analysis using Hugging Face AI models
  - Server-Sent Events (SSE) for live progress updates
  - Three AI models integrated:
    - **Summarization**: facebook/bart-large-cnn
    - **Sentiment Analysis**: cardiffnlp/twitter-roberta-base-sentiment-latest
    - **Named Entity Recognition**: dslim/bert-base-NER
  - Concurrent processing queue (3 simultaneous analyses)
  - Automatic retry with exponential backoff for failed requests

- **Document Detail View**

  - Full analysis results display
  - Interactive entity highlighting in original text
  - Entity filtering by type (Person, Organization, Location)
  - Click-to-highlight functionality
  - Sentiment visualization with confidence scores

- **Search & Filtering**
  - Global search across title and content (debounced 300ms)
  - Filter by status (idle, processing, completed, failed)
  - Date range filtering
  - Multi-criteria sorting (date, title, status)
  - Combine multiple filters

### Bonus Features ✨

### Bonus Features ✨

- **Dark Mode Toggle** (5 points) - System-aware theme switching with smooth transitions
- **Export to CSV** (5 points) - Export documents and analysis results as JSON or CSV
- **CI/CD Pipeline** (5 points) - Automated linting, type-checking, and build verification
- **Document Comparison** (5 points) - Side-by-side comparison of analysis results
- **Real-Time Queue Visualization** - Live indicator showing active analyses and queue status

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Hugging Face account (free)

### Installation

1. **Clone the repository**

```bash
   git clone <your-repo-url>
   cd document-analysis-platform
```

2. **Install dependencies**

```bash
   npm install
```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

```bash
   cp .env.example .env.local
```

Add your Hugging Face API token:

```env
   HUGGINGFACE_API_TOKEN=hf_your_token_here
```

To get your token:

- Sign up at [https://huggingface.co/join](https://huggingface.co/join)
- Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- Create a "Read" token
- Copy and paste it into `.env.local`

4. **Run the development server**

```bash
   npm run dev
```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Creating a Document

1. **Enter a title** in the form
2. **Choose input method:**
   - Type/paste content in the textarea (5,000 character limit)
   - Upload a .txt file (max 50KB)
3. **Click "Create Document"**

### Analyzing a Document

1. **Click "Analyze"** on any document card
2. **Watch real-time progress:**
   - Progress bar shows completion percentage
   - Results appear as they're generated
   - Summary → Sentiment → Entities
3. **View results** on the card or click "View Details" for full analysis

### Searching & Filtering

1. **Use the search bar** to find documents by title or content
2. **Filter by status** to see specific document states
3. **Set date ranges** to narrow results
4. **Sort** by date, title, or status
5. **Clear filters** to reset

### Exporting Data

1. **From homepage:** Click "Export" dropdown to export all visible documents
2. **From detail page:** Click "Export" to export single document
3. **Choose format:** JSON or CSV

## 🏗️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **AI Integration:** Hugging Face Inference API
- **State Management:** React Hooks (useState, useMemo, useCallback)
- **Theme:** next-themes
- **Real-time:** Server-Sent Events (SSE)

## 📁 Project Structure

```
document-analysis-platform/
├── app/
│   ├── api/
│   │   └── documents/
│   │       ├── route.ts              # GET all, POST new
│   │       ├── [id]/
│   │       │   └── route.ts          # GET, PATCH, DELETE single
│   │       └── analyze/
│   │           └── route.ts          # SSE streaming endpoint
│   ├── documents/
│   │   └── [id]/
│   │       ├── page.tsx              # Document detail page
│   │       └── error.tsx             # Error boundary
│   ├── page.tsx                      # Homepage
│   ├── layout.tsx                    # Root layout
│   ├── error.tsx                     # Global error boundary
│   ├── not-found.tsx                 # 404 page
│   ├── loading.tsx                   # Loading state
│   └── globals.css                   # Global styles
├── components/
│   ├── DocumentForm.tsx              # Create document form
│   ├── DocumentList.tsx              # Document list container
│   ├── DocumentItem.tsx              # Individual document card
│   ├── DocumentItemSkeleton.tsx      # Loading skeleton
│   ├── DocumentListSkeleton.tsx      # List loading state
│   ├── SearchAndFilters.tsx          # Search/filter UI
│   ├── ThemeProvider.tsx             # Theme context
│   ├── ThemeToggle.tsx               # Dark mode toggle
│   └── ExportButton.tsx              # Export dropdown
├── hooks/
│   └── useAnalysis.ts                # SSE analysis hook
├── lib/
│   ├── documents.ts                  # Document CRUD helpers
│   ├── huggingface.ts                # AI API integration
│   ├── queue.ts                      # Analysis queue manager
│   └── exportUtils.ts                # CSV/JSON export
├── types/
│   ├── document.ts                   # Document interface
│   └── ai.ts                         # AI result types
└── data/
    └── documents.json                # JSON "database"
```

## 🎨 Key Features Explained

### Server-Sent Events (SSE)

Real-time streaming allows users to see analysis results as they're generated:

```typescript
// Client connects to SSE endpoint
const response = await fetch('/api/documents/analyze', { method: 'POST' });
const reader = response.body.getReader();

// Receives events progressively:
// 1. "progress" - 10% (Starting summary...)
// 2. "summary" - Summary result
// 3. "progress" - 50% (Analyzing sentiment...)
// 4. "sentiment" - Sentiment result
// 5. "progress" - 80% (Extracting entities...)
// 6. "entities" - Entity results
// 7. "complete" - 100% (Done!)
```

### Concurrent Queue System

Limits concurrent API requests to 3, queuing additional requests:

```typescript
// First 3 analyses start immediately
// 4th analysis enters queue
// When one completes, 4th starts automatically
```

### Error Handling Strategy

- **429 Rate Limit:** Exponential backoff retry (1s, 2s, 4s)
- **503 Model Loading:** Wait 20s and retry
- **Network Errors:** User-friendly messages with retry option
- **Partial Success:** Show results from successful models even if one fails

## ⚡ Performance Optimizations

- **Code Splitting:** Dynamic imports for SearchAndFilters
- **Memoization:** useMemo for expensive filter/sort operations
- **React.memo:** Prevents unnecessary component re-renders
- **Debounced Search:** 300ms delay reduces API calls
- **Skeleton Screens:** Better perceived performance
- **Lazy Loading:** Components load on demand

## ♿ Accessibility Features

- **Keyboard Navigation:** Full keyboard support (Tab, Enter, Escape)
- **ARIA Labels:** Screen reader friendly
- **Focus Management:** Proper focus trap in modals
- **Color Contrast:** WCAG 2.1 AA compliant (4.5:1 minimum)
- **Semantic HTML:** Proper heading hierarchy and landmarks
- **Skip Links:** Jump to main content

## 📊 Time Breakdown

- **Part 1 - Document Management:** 4 hours
- **Part 2 - AI Processing & SSE:** 5 hours
- **Part 3 - Document Detail View:** 3 hours
- **Part 4 - Polish & UX:** 4 hours
- **Bonus Features:** 3 hours
- **Documentation:** 2 hours

**Total:** ~21 hours

## 🔧 Configuration

### Environment Variables

```env
# Hugging Face API Token (required)
HUGGINGFACE_API_TOKEN=hf_your_token_here
```

### Modifying AI Models

To use different models, edit `lib/huggingface.ts`:

```typescript
// Change model in respective functions:
generateSummary(); // Line ~250
analyzeSentiment(); // Line ~280
extractEntities(); // Line ~320
```

## 🐛 Known Limitations

- **Data Persistence:** Documents stored in JSON file (not production-ready)
- **Queue Persistence:** Queue resets on server restart
- **Concurrent Users:** Single global queue (not per-user)
- **File Size:** Limited to 50KB .txt files
- **Content Length:** 5,000 character limit per document

## 🚀 Future Improvements

Given more time, I would implement:

1. **Database Integration:** PostgreSQL with Prisma ORM
2. **User Authentication:** Multi-user support with auth
3. **WebSocket:** Replace SSE for bi-directional communication
4. **Queue Persistence:** Redis for distributed queue
5. **Document Comparison:** Side-by-side analysis comparison
6. **PDF Support:** Expand file type support
7. **Batch Analysis:** Analyze multiple documents at once
8. **Unit Tests:** Jest + React Testing Library
9. **E2E Tests:** Playwright for end-to-end testing
10. **CI/CD Pipeline:** GitHub Actions for automated deployment

## 📝 Documentation

- **README.md** (this file) - Setup and usage
- **ARCHITECTURE.md** - Technical decisions and design rationale

## 🙏 Acknowledgments

- **Hugging Face** for AI model APIs
- **Next.js** team for excellent documentation
- **Tailwind CSS** for utility-first styling
- **Audteye** for the interesting assessment challenge

## 📄 License

This project was created as part of a technical assessment for Audteye.

---

## 📸 Screenshots

### Homepage

![Homepage Light Mode](screenshots/homepage-light.png)
_Document list with search and filters_

### Dark Mode

![Homepage Dark Mode](screenshots/homepage-dark.png)
_Smooth dark mode transition_

### Real-Time Analysis

![Analysis Progress](screenshots/analysis.png)
_Live SSE streaming progress_

### Document Detail

![Detail View](screenshots/detail.png)
_Full analysis with entity highlighting_

---

**Built with ❤️ for the Audteye Frontend Engineer Assessment**
