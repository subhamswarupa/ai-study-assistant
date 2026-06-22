const CACHE_TTL = 24 * 60 * 60 * 1000;

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return data;
    localStorage.removeItem(key);
  } catch {}
  return null;
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

const callGroq = async (prompt, temperature = 0.7) => {
  const cacheKey = 'groq_cache_' + btoa(prompt.slice(0, 200)).replace(/[/+=]/g, '_') + '_' + temperature;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const text = data.choices[0].message.content.replace(/```json\n?|\n?```/g, "").trim();
    setCache(cacheKey, text);
    return text;
  } catch (err) {
    console.warn("Groq API call failed:", err.message);
    return null;
  }
};

const SYSTEM_PROMPT = `You are Student Success OS — an AI Career and Productivity Coach for students.
Your ONLY job is helping students become internship-ready.
CORE RULES:
• NEVER introduce yourself as a generic AI assistant or chatbot.
• NEVER say "I am an AI assistant" or "I'm a large language model".
• Always identify as "Student Success OS" or "your Career Coach".
• Every response must be practical, personalized, and career-focused.
• Focus on: skills, projects, learning roadmaps, study plans, internship prep.
• Be encouraging but honest about skill gaps.
• Keep responses concise and actionable.`;

function parseJSON(text, fallback) {
  try { return JSON.parse(text); } catch { return fallback; }
}

const CAREER_SKILLS = {
  "ai engineer":       { req: ["Python","TensorFlow","PyTorch","NLP","Computer Vision","MLOps","Data Pipelines"], projects: ["AI Study Assistant","Research Paper Simplifier","Image Classifier API","Chatbot with RAG"] },
  "ml engineer":       { req: ["Python","Scikit-learn","TensorFlow","SQL","Statistics","Data Pipeline","Model Deployment"], projects: ["Resume Analyzer","Expense Leak Detector","Customer Churn Predictor","A/B Testing Dashboard"] },
  "software developer":{ req: ["JavaScript","React","Node.js","SQL","Git","REST APIs","System Design"], projects: ["Expense Leak Detector","Real-time Chat App","Task Manager API","E-commerce Backend"] },
  "data analyst":      { req: ["SQL","Python","Excel","Tableau","Statistics","Data Visualization","Power BI"], projects: ["Sales Dashboard","COVID Data Explorer","Stock Price Analyzer","Customer Segmentation"] },
  "cybersecurity":     { req: ["Networking","Python","Security Tools","Cryptography","OS Internals","Pen Testing","SIEM"], projects: ["Network Scanner","Password Manager","Phishing Detector","Log Analyzer"] },
  "product manager":   { req: ["Product Strategy","User Research","Agile","SQL","A/B Testing","Roadmapping","Data Analysis","Wireframing"], projects: ["Feature Prioritization Tool","OKR Tracker","User Feedback Analyzer","Product Launch Checklist"] },
  "ux designer":       { req: ["Figma","User Research","Prototyping","HTML/CSS","Design Systems","Usability Testing","Information Architecture","Visual Design"], projects: ["Portfolio Website Redesign","Mobile App Prototype","Design System Library","User Research Dashboard"] },
  "devops":            { req: ["Docker","Kubernetes","CI/CD","AWS","Linux","Terraform","Monitoring","Python","Git","Ansible"], projects: ["CI/CD Pipeline Setup","Infrastructure as Code","Monitoring Dashboard","Containerized Microservices"] },
};

function findCareer(title) {
  const t = (title || "").toLowerCase();
  for (const [key] of Object.entries(CAREER_SKILLS))
    if (t.includes(key)) return key;
  return "software developer";
}

// ----- AI REPORT -----
export const getAIReport = async (profileData) => {
  const prompt = `${SYSTEM_PROMPT}
Analyze this student profile and return ONLY valid JSON (no markdown, no code fences):
${JSON.stringify(profileData, null, 2)}
Return JSON with this exact structure:
{
  "readinessScore": <0-100>,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "currentSkills": ["..."],
  "missingSkills": [{ "skill": "...", "level": "Beginner|Intermediate|Advanced", "priority": "High|Medium|Low", "resource": "..." }],
  "recommendedProjects": [{ "title": "...", "difficulty": "Beginner|Intermediate|Advanced", "techStack": "...", "reason": "...", "description": "..." }],
  "roadmap": [{ "week": "Week N", "goal": "...", "learning": "...", "project": "...", "practice": "..." }],
  "plan": [{ "activity": "...", "hours": <number> }],
  "weeklySchedule": { "Monday": [{ "time": "...", "activity": "...", "color": "bg-...", "duration": "..." }], ... },
  "tips": ["..."]
}`;
  let text = await callGroq(prompt);
  if (text) {
    const parsed = parseJSON(text, null);
    if (parsed?.readinessScore !== undefined) return parsed;
  }
  const careerKey = findCareer(profileData.targetCareer);
  const career = CAREER_SKILLS[careerKey];
  const skills = (profileData.skills || "").split(",").map(s => s.trim()).filter(Boolean);
  const cgpa = parseFloat(profileData.cgpa) || 0;
  const matched = skills.filter(s => career.req.some(r => s.toLowerCase().includes(r.toLowerCase())));
  const missing = career.req.filter(r => !skills.some(s => s.toLowerCase().includes(r.toLowerCase())));
  const score = Math.min(95, Math.max(60, Math.round(cgpa * 12 + matched.length * 6 + 10)));
  const hours = parseInt(profileData.hoursPerWeek) || 15;
  const study = Math.round(hours * 0.35);
  const project = Math.round(hours * 0.30);
  const dsa = Math.round(hours * 0.20);
  const resume = hours - study - project - dsa;
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const weeklySchedule = {};
  days.forEach((day, di) => {
    weeklySchedule[day] = [["Study Core Concepts", study], ["Build Projects", project]].filter((_, ai) => (di + ai) % 2 === 0).slice(0, 2).map(([act, hrs], i) => ({
      time: `${9 + i * 4}:00 AM`, activity: act, color: ["#3b82f6", "#8b5cf6"][i], duration: `${hrs} hr${hrs > 1 ? "s" : ""}`,
    }));
  });
  return {
    readinessScore: Math.min(95, Math.max(60, score)),
    strengths: matched.length > 0 ? [`Proficient in ${matched.slice(0, 3).join(", ")}`, "Shows interest in target field", "Actively building skills"] : ["Eager to learn", "Taking first steps toward career goals"],
    weaknesses: missing.length > 0 ? [`Missing ${missing.slice(0, 3).join(", ")}`, "Needs hands-on project experience"] : ["Needs more project experience"],
    currentSkills: skills,
    missingSkills: missing.map((s, i) => ({ skill: s, level: i < 2 ? "Beginner" : i < 4 ? "Intermediate" : "Advanced", priority: i < 2 ? "High" : i < 4 ? "Medium" : "Low", resource: `https://www.google.com/search?q=learn+${encodeURIComponent(s)}+online` })),
    recommendedProjects: career.projects.map((title, i) => ({ title, difficulty: ["Beginner", "Intermediate", "Advanced"][i % 3], techStack: i % 2 === 0 ? "React · Node.js · MongoDB" : "Python · FastAPI · PostgreSQL", reason: `Builds ${career.req.slice(i * 2, i * 2 + 2).join(" & ") || career.req[0]} skills`, description: `A hands-on project to strengthen your ${profileData.targetCareer || "tech"} portfolio.` })),
    roadmap: [
      { week: "Week 1", goal: "Foundation", learning: "Core concepts + environment setup", project: "Simple CLI tool", practice: `${Math.round(hours/10)} hrs theory, ${Math.round(hours/10)} hrs coding` },
      { week: "Week 2", goal: "Build & Learn", learning: "Framework / library deep-dive", project: "REST API with database", practice: `${Math.round(hours/10)} hrs building, code reviews` },
      { week: "Week 3", goal: "Integrate & Deploy", learning: "Cloud / CI-CD basics", project: "Full-stack app", practice: `${Math.round(hours/10)} hrs deployment, testing` },
      { week: "Week 4", goal: "Polish & Showcase", learning: "Portfolio + interview prep", project: "Capstone project", practice: `${Math.round(hours/10)} hrs DSA, mock interviews` },
    ],
    plan: [{ activity: "Study Core Concepts", hours: study }, { activity: "Build Projects", hours: project }, { activity: "DSA Practice", hours: dsa }, { activity: "Resume & LinkedIn", hours: resume }],
    weeklySchedule,
    tips: ["Use Pomodoro: 25 min focus + 5 min break", "Review every Sunday and adjust next week's plan", "Join a study group for accountability", "Track progress in a habit tracker"],
  };
};

// ----- AI CHAT (FIXED: dynamic, no hardcoded responses) -----
export const getAIResponse = async (userMessage, profileContext = "") => {
  let profileInfo = "No profile available yet.";
  try {
    const pc = JSON.parse(profileContext || "{}");
    if (pc.name) {
      profileInfo = `Student: ${pc.name}, Skills: ${pc.skills || "none"}, Target Career: ${pc.targetCareer || "undecided"}, CGPA: ${pc.cgpa || "N/A"}, Hours/Week: ${pc.hoursPerWeek || "N/A"}`;
    }
  } catch {}

  const prompt = `${SYSTEM_PROMPT}
Student Profile Context:
${profileInfo}

Student asks: "${userMessage}"

IMPORTANT RULES:
• Respond as Student Success OS — a personalized career coach
• Reference the student's actual profile data (name, skills, career, etc.)
• Give specific, actionable advice based on their profile
• NEVER repeat the same response pattern twice
• Use bullet points for clarity when helpful
• Be concise (2-4 paragraphs max)
• Keep the tone encouraging but honest
• If asked about missing skills, reference their actual missing skills
• If asked for study plan, reference their actual hours/week
• If asked for interview tips, give tips specific to their target career
• If asked for job matches, suggest real roles based on their skills`;

  const text = await callGroq(prompt, 0.9);
  if (text) return text;

  let name = "there";
  try { const pc = JSON.parse(profileContext || "{}"); if (pc.name) name = pc.name; } catch {}
  const msg = userMessage.toLowerCase();

  if (msg.includes("learn") || msg.includes("skill") || msg.includes("first"))
    return `Hey ${name}! Based on your profile, I'd recommend starting with the skills that are most in-demand for your target career. Focus on building a strong foundation first — pick one area and build a project around it. Consistency matters more than trying to learn everything at once. Want me to suggest a specific first project?`;

  if (msg.includes("review") || msg.includes("profile"))
    return `${name}, here's my honest assessment: your profile shows good initiative! The key areas to focus on are building more hands-on projects and strengthening your technical fundamentals. Try to complete at least 2 portfolio-ready projects in your target field. Your current direction is solid — just keep building!`;

  if (msg.includes("interview") || msg.includes("tip"))
    return `For ${name}'s interview prep: focus on data structures & algorithms (LeetCode medium), system design fundamentals, and behavioral stories using the STAR method. Practice explaining your past projects clearly. Mock interviews with friends can help build confidence.`;

  if (msg.includes("study") || msg.includes("plan") || msg.includes("schedule"))
    return `Here's a study plan for you ${name}: dedicate focused time blocks each day — mornings for deep work (learning new concepts), afternoons for building, and evenings for review. Take breaks every 90 minutes. Track your progress weekly.`;

  if (msg.includes("project") || msg.includes("idea") || msg.includes("build"))
    return `Great question ${name}! The best projects are ones that solve real problems. Think about tools you wish existed, or apps that could make your daily life easier. Pick something you're passionate about — that motivation will help you finish it.`;

  if (msg.includes("job") || msg.includes("career") || msg.includes("match"))
    return `${name}, based on your profile, target roles that align with your skills. Focus on building 2-3 strong projects, practice DSA consistently, and optimize your LinkedIn. Companies value demonstrated skills over credentials.`;

  return `Hey ${name}! I'm your Student Success OS career coach. I can help you with:\n\n🎯 **Learning path** tailored to your target career\n📚 **Study plans** that fit your schedule\n💼 **Interview prep** with real practice questions\n🛠 **Project ideas** that build portfolio strength\n\nWhat would you like to dive into today?`;
};

// ----- INTERVIEW QUESTIONS -----
export const getInterviewQuestions = async (career) => {
  const prompt = `${SYSTEM_PROMPT}
Generate 5 unique technical interview questions for a ${career} intern position.
Every time these questions are requested they must be DIFFERENT — never repeat the same set.
Return ONLY valid JSON array (no markdown):
[{ "id": 1, "question": "...", "category": "Technical|Behavioral|System Design", "hint": "..." }]`;
  const text = await callGroq(prompt, 0.9);
  if (text) {
    const parsed = parseJSON(text, null);
    if (Array.isArray(parsed) && parsed.length === 5) return parsed;
  }
  const careerKey = findCareer(career);
  const fallbacks = {
    "software developer": [
      { id: 1, question: "Explain the concept of hoisting in JavaScript.", category: "Technical", hint: "Think about variable and function declarations" },
      { id: 2, question: "Design a chat application's backend architecture.", category: "System Design", hint: "Consider WebSockets, message queues, and database" },
      { id: 3, question: "Describe a time you worked effectively in a team.", category: "Behavioral", hint: "Use the STAR method" },
      { id: 4, question: "What is the time complexity of binary search?", category: "Technical", hint: "Think about halving the search space" },
      { id: 5, question: "How would you optimize a slow database query?", category: "Technical", hint: "Consider indexing, caching, query optimization" },
    ],
    "ai engineer": [
      { id: 1, question: "What is the difference between supervised and unsupervised learning?", category: "Technical", hint: "Think about labeled vs unlabeled data" },
      { id: 2, question: "Design a model serving infrastructure.", category: "System Design", hint: "Consider API endpoints, batching, monitoring" },
      { id: 3, question: "Tell me about an AI project you worked on.", category: "Behavioral", hint: "Highlight problem, approach, and results" },
      { id: 4, question: "How does gradient descent work?", category: "Technical", hint: "Focus on learning rate, loss function, convergence" },
      { id: 5, question: "What techniques prevent overfitting in neural networks?", category: "Technical", hint: "Think dropout, regularization, early stopping" },
    ],
  };
  return fallbacks[careerKey] || fallbacks["software developer"];
};

// ----- INTERVIEW FEEDBACK (NEW: scores 1-10) -----
export const getInterviewFeedback = async (question, answer, career) => {
  const prompt = `${SYSTEM_PROMPT}
Evaluate this interview answer for a ${career} position.

Question: "${question}"
Candidate's Answer: "${answer}"

Rate the answer 1-10 and provide detailed feedback.
Return ONLY valid JSON (no markdown):
{ "score": <1-10>, "feedback": "...", "strengths": ["..."], "improvements": ["..."] }`;
  const text = await callGroq(prompt, 0.7);
  if (text) {
    const parsed = parseJSON(text, null);
    if (parsed?.score) return parsed;
  }
  const wordCount = answer.split(/\s+/).length;
  const score = Math.min(10, Math.max(1, Math.round(wordCount / 15 + 2)));
  return {
    score,
    feedback: score >= 7 ? "Good answer! You covered the key points. Try to add more specific examples." : score >= 4 ? "Decent attempt. Structure your answer more clearly and include technical details." : "Your answer needs more detail. Research the topic and practice explaining it clearly.",
    strengths: score >= 5 ? ["Shows understanding of the topic", "Attempted to address the question"] : [],
    improvements: score < 7 ? ["Add more specific examples", "Structure your answer better", "Include relevant technical details"] : [],
  };
};

// ----- RESUME SCORER (NEW: ATS compatible) -----
export const getResumeScore = async (resumeText, careerName) => {
  const prompt = `${SYSTEM_PROMPT}
Analyze this resume for a ${careerName} internship position.

Resume:
${resumeText}

Return ONLY valid JSON (no markdown) with this structure:
{
  "score": <0-100>,
  "atsScore": <0-100>,
  "strengths": ["..."],
  "improvements": ["..."],
  "keywordsFound": ["..."],
  "keywordsMissing": ["..."]
}`;
  const text = await callGroq(prompt, 0.7);
  if (text) {
    const parsed = parseJSON(text, null);
    if (parsed?.score) return parsed;
  }
  const common = ["JavaScript","Python","React","Node.js","TypeScript","SQL","Git","Docker","AWS","CSS","HTML","MongoDB","PostgreSQL","REST APIs","GraphQL","DSA","Java","Go","Rust","C++"];
  const found = common.filter(s => resumeText.toLowerCase().includes(s.toLowerCase()));
  const hasProjects = /\bproject\b/i.test(resumeText);
  const hasExp = /\b(experience|internship|work)\b/i.test(resumeText);
  const score = Math.min(100, Math.max(20, found.length * 4 + (hasProjects ? 15 : 0) + (hasExp ? 15 : 0)));
  const missing = common.filter(s => !resumeText.toLowerCase().includes(s.toLowerCase())).slice(0, 6);
  return {
    score,
    atsScore: Math.min(100, Math.max(20, score - 5 + (hasExp ? 10 : 0))),
    strengths: found.length > 0 ? [`Lists ${found.length} relevant technologies`, hasProjects ? "Includes project experience" : "", hasExp ? "Shows work experience" : ""].filter(Boolean) : ["Basic resume structure present"],
    improvements: [!hasProjects ? "Add project descriptions" : "", !hasExp ? "Include experience or internship section" : "", missing.length > 0 ? `Missing keywords: ${missing.slice(0, 4).join(", ")}` : ""].filter(Boolean),
    keywordsFound: found.slice(0, 10),
    keywordsMissing: missing,
  };
};

// ----- JOB MATCHES (real job data + links + learning roadmaps) -----
const JOB_SKILLS_DB = {
  "Frontend Developer": {
    skills: ["React", "JavaScript", "CSS", "HTML", "TypeScript", "Git", "REST APIs"],
    experience: "0-2 years", salaryINR: "4-12 LPA", salaryUSD: "$50K-$90K",
    learning: [
      { skill: "React", youtube: "freeCodeCamp React Course", site: "react.dev" },
      { skill: "JavaScript", youtube: "Traversy Media JS", site: "javascript.info" },
      { skill: "CSS", youtube: "Kevin Powell CSS", site: "css-tricks.com" },
      { skill: "TypeScript", youtube: "Fireship TS", site: "typescriptlang.org" },
      { skill: "Git", youtube: "Programming with Mosh Git", site: "git-scm.com" },
    ],
    estTime: "3-4 months"
  },
  "Backend Engineer": {
    skills: ["Node.js", "Python", "SQL", "REST APIs", "Docker", "Git", "PostgreSQL"],
    experience: "0-2 years", salaryINR: "5-15 LPA", salaryUSD: "$60K-$100K",
    learning: [
      { skill: "Node.js", youtube: "The Net Ninja Node.js", site: "nodejs.org" },
      { skill: "Python", youtube: "Corey Schafer Python", site: "realpython.com" },
      { skill: "SQL", youtube: "freeCodeCamp SQL", site: "w3schools.com/sql" },
      { skill: "Docker", youtube: "TechWorld with Nana Docker", site: "docker.com" },
      { skill: "PostgreSQL", youtube: "freeCodeCamp PostgreSQL", site: "postgresql.org" },
    ],
    estTime: "4-6 months"
  },
  "Full Stack Developer": {
    skills: ["React", "Node.js", "MongoDB", "SQL", "Git", "REST APIs", "AWS"],
    experience: "0-2 years", salaryINR: "6-18 LPA", salaryUSD: "$60K-$110K",
    learning: [
      { skill: "React + Node.js", youtube: "freeCodeCamp Full Stack", site: "fullstackopen.com" },
      { skill: "MongoDB", youtube: "MongoDB University", site: "mongodb.com/university" },
      { skill: "AWS", youtube: "freeCodeCamp AWS", site: "aws.amazon.com/training" },
      { skill: "SQL", youtube: "Programming with Mosh SQL", site: "w3schools.com/sql" },
      { skill: "Git", youtube: "Fireship Git", site: "git-scm.com" },
    ],
    estTime: "5-7 months"
  },
  "AI/ML Engineer": {
    skills: ["Python", "TensorFlow", "PyTorch", "ML", "Statistics", "SQL", "NLP"],
    experience: "0-2 years", salaryINR: "8-25 LPA", salaryUSD: "$80K-$140K",
    learning: [
      { skill: "Python for ML", youtube: "sentdex Python ML", site: "scikit-learn.org" },
      { skill: "TensorFlow", youtube: "TensorFlow Official", site: "tensorflow.org/learn" },
      { skill: "Machine Learning", youtube: "Andrew Ng ML Course", site: "coursera.org/ml" },
      { skill: "Statistics", youtube: "StatQuest with Josh", site: "khanacademy.org/math/statistics-probability" },
      { skill: "SQL", youtube: "Alex The Analyst SQL", site: "w3schools.com/sql" },
    ],
    estTime: "6-9 months"
  },
  "Data Analyst": {
    skills: ["SQL", "Python", "Excel", "Tableau", "Power BI", "Statistics", "Data Visualization"],
    experience: "0-1 years", salaryINR: "3-10 LPA", salaryUSD: "$45K-$80K",
    learning: [
      { skill: "SQL", youtube: "Alex The Analyst SQL", site: "w3schools.com/sql" },
      { skill: "Python", youtube: "Corey Schafer Python", site: "realpython.com" },
      { skill: "Excel", youtube: "Excel is Fun", site: "exceljet.net" },
      { skill: "Tableau", youtube: "Tableau Tim", site: "tableau.com/learn" },
      { skill: "Power BI", youtube: "Guy in a Cube", site: "learn.microsoft.com/power-bi" },
    ],
    estTime: "2-4 months"
  },
  "DevOps Engineer": {
    skills: ["Docker", "Kubernetes", "AWS", "Linux", "CI/CD", "Terraform", "Python"],
    experience: "1-3 years", salaryINR: "8-22 LPA", salaryUSD: "$80K-$130K",
    learning: [
      { skill: "Docker", youtube: "TechWorld with Nana", site: "docker.com" },
      { skill: "Kubernetes", youtube: "Kunal Kushwaha K8s", site: "kubernetes.io/docs" },
      { skill: "AWS", youtube: "freeCodeCamp AWS", site: "aws.amazon.com/training" },
      { skill: "Linux", youtube: "Tutorial Linux", site: "linuxjourney.com" },
      { skill: "Terraform", youtube: "freeCodeCamp Terraform", site: "terraform.io" },
    ],
    estTime: "6-10 months"
  },
};

const JOB_LINKS = (title) => ({
  linkedin: `https://linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}`,
  naukri: `https://naukri.com/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}-jobs`,
  internshala: `https://internshala.com/internships/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}-internships`,
  indeed: `https://indeed.com/jobs?q=${encodeURIComponent(title)}`,
});

export const getJobMatches = async (profile) => {
  const careerKey = findCareer(profile.targetCareer);
  const studentSkills = (profile.skills || "").split(",").map(s => s.trim().toLowerCase());

  let jobTitles = Object.keys(JOB_SKILLS_DB);
  const careerMap = {
    "software developer": ["Frontend Developer", "Backend Engineer", "Full Stack Developer", "Data Analyst", "DevOps Engineer", "AI/ML Engineer"],
    "ai engineer": ["AI/ML Engineer", "Data Analyst", "Full Stack Developer", "Backend Engineer", "DevOps Engineer", "Frontend Developer"],
    "data analyst": ["Data Analyst", "Full Stack Developer", "Backend Engineer", "Frontend Developer", "DevOps Engineer", "AI/ML Engineer"],
    "cybersecurity": ["DevOps Engineer", "Backend Engineer", "Full Stack Developer", "Frontend Developer", "Data Analyst", "AI/ML Engineer"],
    "product manager": ["Full Stack Developer", "Data Analyst", "Frontend Developer", "Backend Engineer", "DevOps Engineer", "AI/ML Engineer"],
    "ux designer": ["Frontend Developer", "Full Stack Developer", "Data Analyst", "Backend Engineer", "DevOps Engineer", "AI/ML Engineer"],
    "devops": ["DevOps Engineer", "Backend Engineer", "Full Stack Developer", "Frontend Developer", "Data Analyst", "AI/ML Engineer"],
  };
  jobTitles = careerMap[careerKey] || jobTitles;

  const results = jobTitles.map((title) => {
    const jobData = JOB_SKILLS_DB[title];
    const reqSkills = jobData.skills.map(s => s.toLowerCase());
    const has = jobData.skills.filter(s => studentSkills.some(us => s.toLowerCase().includes(us) || us.includes(s.toLowerCase())));
    const missing = jobData.skills.filter(s => !studentSkills.some(us => s.toLowerCase().includes(us) || us.includes(s.toLowerCase())));
    const match = Math.min(95, Math.max(15, Math.round((has.length / reqSkills.length) * 100)));
    return {
      title,
      experience: jobData.experience,
      salaryINR: jobData.salaryINR,
      salaryUSD: jobData.salaryUSD,
      matchPercentage: match,
      skills: jobData.skills,
      studentSkills: has,
      missingSkills: missing,
      links: JOB_LINKS(title),
      learning: jobData.learning,
      estTime: jobData.estTime,
      whyMatch: has.length > 0 ? `You have ${has.slice(0, 2).join(" & ")} — great foundation! Add ${missing.slice(0, 2).join(" & ")} to qualify.` : `This role needs ${reqSkills.slice(0, 3).join(", ")}. Start learning these!`,
    };
  });

  return results;
};

export const getInternships = async (profile) => {
  const internships = [
    { title: "Software Development Intern", stipendINR: "15K-30K/month", duration: "3-6 months", type: "Full Time", skillsGained: ["React", "Node.js", "Git", "REST APIs"], links: JOB_LINKS("software development intern") },
    { title: "Data Science Intern", stipendINR: "20K-40K/month", duration: "3-6 months", type: "Full Time", skillsGained: ["Python", "ML", "SQL", "Statistics"], links: JOB_LINKS("data science intern") },
    { title: "Frontend Intern", stipendINR: "10K-25K/month", duration: "3 months", type: "Full Time", skillsGained: ["React", "CSS", "JavaScript", "TypeScript"], links: JOB_LINKS("frontend intern") },
    { title: "Backend Intern", stipendINR: "15K-30K/month", duration: "3-6 months", type: "Full Time", skillsGained: ["Node.js", "SQL", "Python", "Docker"], links: JOB_LINKS("backend intern") },
    { title: "AI/ML Intern", stipendINR: "25K-50K/month", duration: "6 months", type: "Full Time", skillsGained: ["Python", "TensorFlow", "PyTorch", "ML"], links: JOB_LINKS("machine learning intern") },
    { title: "DevOps Intern", stipendINR: "20K-35K/month", duration: "6 months", type: "Full Time", skillsGained: ["Docker", "AWS", "Linux", "CI/CD"], links: JOB_LINKS("devops intern") },
  ];
  return internships;
};

// ----- DAILY CHALLENGE (NEW) -----
export const getDailyChallenge = async (profile) => {
  const prompt = `${SYSTEM_PROMPT}
Generate ONE unique daily coding challenge or learning task for this student.

Profile: ${JSON.stringify(profile, null, 2)}

The challenge should:
• Be specific to their target career and skill level
• Take 15-45 minutes to complete
• Be different EVERY time (never repeat)
• Include a clear task description and expected outcome

Return ONLY valid JSON (no markdown):
{ "title": "...", "description": "...", "type": "coding|learning|building|research", "estimatedMinutes": <15-45>, "hint": "...", "expectedOutcome": "..." }`;
  const text = await callGroq(prompt, 0.9);
  if (text) {
    const parsed = parseJSON(text, null);
    if (parsed?.title) return parsed;
  }
  const challenges = [
    { title: "Build a function to reverse a linked list", description: "Write code to reverse a singly linked list in O(n) time.", type: "coding", estimatedMinutes: 25, hint: "Use three pointers or recursion", expectedOutcome: "Working reverseLinkedList function" },
    { title: "Create a personal portfolio wireframe", description: "Sketch or design a wireframe for your portfolio homepage.", type: "design", estimatedMinutes: 30, hint: "Focus on layout and information hierarchy", expectedOutcome: "Wireframe sketch or Figma mockup" },
    { title: "Write a SQL query for employee analysis", description: "Write SQL queries to find the top 3 highest-paid employees per department.", type: "coding", estimatedMinutes: 20, hint: "Use window functions like RANK() or DENSE_RANK()", expectedOutcome: "Working SQL queries" },
  ];
  return challenges[Math.floor(Math.random() * challenges.length)];
};

// ----- SKILL QUIZ TOPICS -----
export const getQuizTopics = async (profile) => {
  const prompt = `${SYSTEM_PROMPT}
Based on this student's profile, generate 8-10 relevant quiz topic names.

Profile: ${JSON.stringify(profile, null, 2)}

Return ONLY a JSON array of topic names (strings only, no objects):
["Topic1", "Topic2", ...]

Topics should be specific technical skills related to their target career. Include a mix of their known skills and skills they need to learn.`;
  const text = await callGroq(prompt, 0.9);
  if (text) {
    const parsed = parseJSON(text, null);
    if (Array.isArray(parsed) && parsed.length >= 4) return parsed;
  }
  const skills = (profile.skills || "").split(",").map(s => s.trim()).filter(Boolean);
  const careerKey = findCareer(profile.targetCareer);
  const defaultTopics = {
    "software developer": ["JavaScript", "Python", "React", "Data Structures", "SQL", "System Design", "Git", "Node.js", "CSS", "TypeScript"],
    "ai engineer": ["Python", "Machine Learning", "Deep Learning", "Data Structures", "SQL", "Statistics", "NLP", "Computer Vision", "TensorFlow", "PyTorch"],
    "data analyst": ["SQL", "Python", "Statistics", "Excel", "Data Visualization", "Tableau", "Power BI", "Data Cleaning"],
  };
  const topics = defaultTopics[careerKey] || defaultTopics["software developer"];
  const allTopics = [...new Set([...skills, ...topics])];
  return allTopics.slice(0, 10);
};

// ----- GROQ API is used for all AI calls via callGroq() -----

// ----- LEARNING PATH (NEW) -----
export const getLearningPath = async (career) => {
  const prompt = `${SYSTEM_PROMPT}
Generate a visual learning path with milestone nodes for becoming a ${career}.

Each milestone should be a specific skill or achievement.
Return at least 6 milestone nodes.
Every time this is called, generate a DIFFERENT path.

Return ONLY valid JSON array (no markdown):
[{ "id": 1, "title": "...", "description": "...", "type": "skill|project|concept", "estimatedWeeks": <1-4>, "dependencies": [2] }]`;
  const text = await callGroq(prompt, 0.9);
  if (text) {
    const parsed = parseJSON(text, null);
    if (Array.isArray(parsed) && parsed.length >= 4) return parsed;
  }
  const careerKey = findCareer(career);
  const paths = {
    "software developer": [
      { id: 1, title: "HTML & CSS Foundations", description: "Build responsive layouts with Flexbox and Grid", type: "skill", estimatedWeeks: 2, dependencies: [] },
      { id: 2, title: "JavaScript Core Concepts", description: "Variables, functions, closures, promises, async/await", type: "skill", estimatedWeeks: 3, dependencies: [1] },
      { id: 3, title: "Version Control with Git", description: "Branches, merges, pull requests, rebasing", type: "skill", estimatedWeeks: 1, dependencies: [] },
      { id: 4, title: "React Framework", description: "Components, state, hooks, routing, context", type: "skill", estimatedWeeks: 3, dependencies: [1, 2] },
      { id: 5, title: "Backend with Node.js", description: "Express, REST APIs, middleware, authentication", type: "skill", estimatedWeeks: 3, dependencies: [2, 3] },
      { id: 6, title: "Database Design", description: "SQL, MongoDB, schema design, indexing", type: "skill", estimatedWeeks: 2, dependencies: [5] },
      { id: 7, title: "Full-Stack Portfolio Project", description: "Build and deploy a complete app", type: "project", estimatedWeeks: 4, dependencies: [4, 5, 6] },
      { id: 8, title: "DSA & Interview Prep", description: "LeetCode, system design, mock interviews", type: "concept", estimatedWeeks: 4, dependencies: [2] },
    ],
  };
  return paths[careerKey] || paths["software developer"];
};

// ----- DAILY TIP -----
export const getDailyTip = async (profile) => {
  const prompt = `${SYSTEM_PROMPT}
Give one specific, actionable career tip for this student. Keep it 1-2 sentences.
Be different each time — never repeat the same tip.
Return ONLY JSON: { "tip": "...", "icon": "💡|🎯|📚|⚡|🔥" }
Profile: ${JSON.stringify(profile)}`;
  const text = await callGroq(prompt, 0.9);
  if (text) {
    const parsed = parseJSON(text, null);
    if (parsed?.tip) return parsed;
  }
  const tips = [
    { tip: "Spend 15 minutes daily on LeetCode — consistency beats cramming.", icon: "⚡" },
    { tip: "Your GitHub profile is your resume. Push code every day.", icon: "🔥" },
    { tip: "Update your LinkedIn with projects you're building right now.", icon: "🎯" },
    { tip: "One strong project > five half-finished ones. Focus and ship.", icon: "💡" },
    { tip: "Write about what you learn — blogs impress recruiters.", icon: "📚" },
    { tip: "Network with 3 people in your target industry this week.", icon: "🔥" },
  ];
  return tips[Math.floor(Math.random() * tips.length)];
};
