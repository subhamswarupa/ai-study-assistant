import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, CheckCircle, XCircle, Loader2, AlertTriangle, Sparkles, BarChart3, Target, Award, File, FileImage, FileSearch, X, Lightbulb, BookOpen } from 'lucide-react';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true });

function extractFileType(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return { type: 'pdf', icon: 'pdf' };
  if (['doc', 'docx'].includes(ext)) return { type: 'docx', icon: 'doc' };
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return { type: 'image', icon: 'image' };
  if (ext === 'txt') return { type: 'txt', icon: 'txt' };
  return null;
}

const FileIcon = ({ fileType }) => {
  if (fileType === 'pdf' || fileType === 'doc') return <File size={20} className="text-blue-400" />;
  if (fileType === 'image') return <FileImage size={20} className="text-green-400" />;
  if (fileType === 'txt') return <FileSearch size={20} className="text-yellow-400" />;
  return <File size={20} className="text-gray-400" />;
};

const extractTextFromImage = async (file) => {
  const toBase64 = (f) => new Promise((resolve) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result.split(',')[1]);
    r.readAsDataURL(f);
  });

  const base64 = await toBase64(file);

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "This is a resume image. Extract ALL text from it. Return only the plain text, nothing else." },
          { type: "image_url", image_url: { url: `data:${file.type};base64,${base64}` } }
        ]
      }
    ],
    model: "llama-3.2-90b-vision-preview",
    max_tokens: 1024
  });

  return completion.choices[0].message.content;
};

async function extractTextFromFile(file) {
  const info = extractFileType(file.name);
  if (!info) return null;
  const type = info.type;

  if (type === 'txt') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  if (type === 'docx') {
    try {
      const buffer = await file.arrayBuffer();
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return result.value || null;
    } catch (e) {
      console.warn('DOCX extraction failed:', e);
      return null;
    }
  }

  if (type === 'pdf') {
    try {
      const buffer = await file.arrayBuffer();
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      return text;
    } catch (e) {
      console.warn('PDF extraction failed:', e);
      return null;
    }
  }

  if (type === 'image') {
    const text = await extractTextFromImage(file);
    return text || null;
  }

  return null;
}

async function analyzeResumeWithAI(resumeText, career) {
  const completion = await groq.chat.completions.create({
    messages: [{
      role: "user",
      content: `You are an expert ATS resume analyzer. Analyze this resume for a ${career} position.

Resume:
${resumeText}

Return ONLY valid JSON (no markdown, no backticks) with this structure:
{
  "atsScore": <0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "keywordsFound": ["keyword1", "keyword2", ...],
  "keywordsMissing": ["missing1", "missing2", ...],
  "sections": {
    "education": <0-100>,
    "skills": <0-100>,
    "experience": <0-100>,
    "projects": <0-100>
  },
  "rewriteSuggestion": "One specific rewrite suggestion to improve this resume"
}`
    }],
    model: "llama3-8b-8192",
    temperature: 0.7,
    max_tokens: 500
  });
  const rawText = completion.choices[0].message.content;
  const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
}

const ResumeScorer = ({ career, toast }) => {
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileType, setFileType] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    const info = extractFileType(file.name);
    if (!info) {
      if (toast) toast('Please upload a PDF, DOCX, image (JPG/PNG/WEBP), or TXT file', 'error');
      return;
    }
    setFileName(file.name);
    setFileType(info.icon);
    setResult(null);
    setStep('extracting');

    let text;
    try {
      text = await extractTextFromFile(file);
    } catch (e) {
      console.warn('Extraction error:', e);
      setStep(null);
      setFileName('');
      if (toast) toast(e.message || 'Could not read this file. Please try a clearer image or paste your resume text below.', 'error');
      return;
    }

    if (text && text.trim().length > 20) {
      setResumeText(text);
      if (toast) toast(`Extracted ${text.split(/\s+/).length} words from ${file.name}`, 'success');
      setStep('analyzing');
      setLoading(true);
      try {
        const analysis = await analyzeResumeWithAI(text, career);
        setResult(analysis);
        if (toast) toast('Resume analyzed!', 'success');
      } catch (e) {
        console.warn('Analysis failed:', e);
        if (toast) toast('Analysis failed. Please try again.', 'error');
      }
      setLoading(false);
      setStep(null);
    } else {
      if (toast) toast('Could not read this file. Please try a clearer image or paste your resume text below.', 'error');
      setStep(null);
    }
  }, [career, toast]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleAnalyzeFromText = async () => {
    if (!resumeText.trim()) return;
    setStep('analyzing');
    setLoading(true);
    setResult(null);
    try {
      const analysis = await analyzeResumeWithAI(resumeText, career);
      setResult(analysis);
      if (toast) toast('Resume analyzed!', 'success');
    } catch (e) {
      console.warn('Analysis failed:', e);
      if (toast) toast('Analysis failed. Please try again.', 'error');
    }
    setLoading(false);
    setStep(null);
  };

  const clearFile = () => {
    setFileName('');
    setResumeText('');
    setResult(null);
    setStep(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <FileText size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">AI Resume Analyzer</h2>
        <p className="text-gray-400 text-sm">Upload your resume (PDF/DOCX/JPG/PNG/WEBP/TXT) — get ATS score + feedback</p>
      </div>

      <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
        {step === 'extracting' && (
          <div className="p-6 text-center">
            <Loader2 className="animate-spin mx-auto mb-3 text-blue-400" size={28} />
            <p className="text-sm text-gray-400">Extracting text from {fileName}...</p>
          </div>
        )}

        {step !== 'extracting' && (
          <>
            {fileName ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <FileIcon fileType={fileType} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blue-300 truncate">{fileName}</p>
                  <p className="text-xs text-gray-500">{resumeText.split(/\s+/).length} words extracted</p>
                </div>
                {step !== 'analyzing' && (
                  <button onClick={clearFile} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-gray-400 hover:text-white transition">
                    <X size={16} />
                  </button>
                )}
              </div>
            ) : (
              <div
                onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-500/50 hover:bg-white/5'
                }`}>
                <Upload size={36} className={`mx-auto mb-3 ${dragOver ? 'text-blue-400' : 'text-gray-500'}`} />
                <p className="text-sm text-gray-400 mb-1">Drag & drop your resume here</p>
                <p className="text-xs text-gray-500">Supports PDF, DOCX, JPG/PNG/WEBP, TXT</p>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-xs text-gray-500">or paste manually</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
            <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here..."
              rows={5}
              className="w-full p-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-blue-500/50 transition text-sm resize-none font-mono"
            />

            {step === 'analyzing' ? (
              <div className="p-3 text-center">
                <Loader2 className="animate-spin mx-auto mb-2 text-blue-400" size={22} />
                <p className="text-sm text-gray-400">Analyzing your resume...</p>
              </div>
            ) : (
              <button onClick={handleAnalyzeFromText} disabled={!resumeText.trim() || loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} /> Analyze Resume</>}
              </button>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                <Award size={24} className="mx-auto mb-2 text-blue-400" />
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{result.atsScore}/100</div>
                <p className="text-gray-400 text-sm mt-1">ATS Score</p>
              </div>
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                <BarChart3 size={24} className="mx-auto mb-2 text-green-400" />
                <div className="text-3xl font-black text-green-400">{result.atsScore}/100</div>
                <p className="text-gray-400 text-sm mt-1">Overall Rating</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2"><CheckCircle size={14} /> Strengths</h4>
                <ul className="space-y-2">
                  {(result.strengths || []).slice(0, 3).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />{s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2"><AlertTriangle size={14} /> Improvements</h4>
                <ul className="space-y-2">
                  {(result.improvements || []).slice(0, 3).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            {result.sections && (
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2"><BookOpen size={14} /> Section Scores</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(result.sections).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-lg bg-white/5 text-center">
                      <div className="text-lg font-bold text-blue-300">{val}/100</div>
                      <div className="text-xs text-gray-500 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2"><Target size={14} /> Keywords Analysis</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Found ({(result.keywordsFound || []).length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.keywordsFound || []).map((k, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-green-500/15 text-green-400 text-xs border border-green-500/20">{k}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Missing ({(result.keywordsMissing || []).length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.keywordsMissing || []).map((k, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-red-500/15 text-red-400 text-xs border border-red-500/20">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {result.rewriteSuggestion && (
              <div className="p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2"><Lightbulb size={14} /> Rewrite Suggestion</h4>
                <p className="text-sm text-gray-300">{result.rewriteSuggestion}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeScorer;
