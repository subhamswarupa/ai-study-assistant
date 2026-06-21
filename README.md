# Student Success OS

An AI-powered Career & Productivity Coach that helps students become internship-ready by analyzing their profile, identifying skill gaps, recommending projects, generating learning roadmaps, and creating personalized productivity plans.

## Features

### 1. Student Profile Analysis
- Name, CGPA, Skills, Interests, Target Career, Hours Available Per Week
- Clean glassmorphism form with real-time input

### 2. AI Agent System (5 Specialized Agents)

| Agent | Function |
|-------|----------|
| **Profile Analyzer** | Calculates internship readiness score (0-100) based on CGPA, skills match, and career alignment |
| **Skill Gap Detector** | Compares current skills against target career requirements for 5 career paths |
| **Project Mentor** | Recommends 3 personalized projects with difficulty, tech stack, and reasoning |
| **Roadmap Generator** | Creates a 4-week learning roadmap with weekly goals, learning tasks, projects, and practice |
| **Productivity Coach** | Generates a weekly hour breakdown and schedule based on available hours |

### 3. Dashboard (7 Sections)
1. **Internship Readiness Score** — animated circular progress indicator
2. **Strengths & Improvement Areas** — green/orange color-coded lists
3. **Current Skills** — skill badges display
4. **Missing Skills** — priority badges with clickable learning resources
5. **Recommended Projects** — cards with difficulty badges, tech stack, and reasoning
6. **30-Day Learning Roadmap** — 4-week timeline card layout
7. **Weekly Productivity Plan** — hour breakdown chart + schedule table

### 4. AI Mentor Chatbot
- Sliding panel with Student Success OS persona (not a generic chatbot)
- Pre-loaded with student profile context
- Career-focused Q&A (projects, AWS, study plans, job matching)
- Suggested quick-question chips
- Typing indicator during responses

### 5. Save & Load Reports
- Automatically saves last 10 reports to localStorage
- History drawer accessible from dashboard
- Load or delete previous reports

### 6. PDF Export
- "Download Success Plan" button exports the full dashboard as a professional PDF

### 7. Dark Mode
- Toggle between light and dark themes
- Persistent via class-based switching

## Tech Stack

- **React 19** — UI framework
- **Vite 8** — Build tool
- **Tailwind CSS v4** — Utility-first styling
- **Framer Motion** — Animations
- **Google Gemini 2.0 Flash** — AI engine
- **jsPDF + html2canvas** — PDF export
- **Lucide React** — Icons

## Project Structure

```
src/
├── components/
│   ├── StudentProfileForm.jsx   # Profile input form
│   ├── Dashboard.jsx            # 7-section dashboard + save/load + PDF
│   └── Chatbot.jsx              # Student Success OS chatbot panel
├── services/
│   └── geminiService.js         # 5 AI agents + chat with system persona
├── App.jsx                      # Main app with state management
├── index.css                    # Tailwind v4 imports + dark variant
└── main.jsx                     # React entry point
```

## Getting Started

### Prerequisites
- Node.js 18+
- Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone / navigate to the project
cd student-success-os

# Install dependencies
npm install

# Create environment file
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env
```

### Run Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | Yes | Your Google Gemini API key |

## Career Paths Supported

The Skill Gap Detector includes built-in knowledge for:
- AI Engineer
- ML Engineer
- Software Developer
- Data Analyst
- Cybersecurity Engineer

Additional career paths are handled by the Gemini AI model dynamically.

## How It Works

1. **Fill out the profile form** — name, CGPA, skills, interests, target career, hours
2. **Click "Generate My Career Plan"** — 5 AI agents analyze your profile in parallel
3. **View your dashboard** — readiness score, strengths/weaknesses, skill gaps, projects, roadmap, schedule
4. **Chat with your Career Coach** — ask about projects, study plans, AWS, career matching
5. **Save & export** — reports auto-save, export as PDF anytime

## PDF Export

The "Download Success Plan" button captures the entire dashboard and generates a multi-page PDF with a title page and all sections.
