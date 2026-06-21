import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, CheckCircle, XCircle, TrendingUp, Loader2, AlertTriangle, Sparkles, BarChart3, Target, Award } from 'lucide-react';
import { getResumeScore } from '../services/geminiService';

const ResumeScorer = ({ career, toast }) => {
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    const res = await getResumeScore(resumeText, career);
    setResult(res);
    setLoading(false);
    if (toast) toast('Resume analyzed!', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <FileText size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">AI Resume Analyzer</h2>
        <p className="text-gray-400 text-sm">Paste your resume and get an ATS score with actionable feedback</p>
      </div>

      <div className="p-5 rounded-xl bg-white/5 border border-white/10">
        <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)}
          placeholder={`Paste your resume content here...

Example:
Education: B.Tech in Computer Science, XYZ University
Skills: Python, JavaScript, React, Node.js
Projects: Built a full-stack e-commerce app...
Experience: Intern at ABC Corp...`}
          rows={8}
          className="w-full p-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-blue-500/50 transition text-sm resize-none font-mono"
        />
        <button onClick={handleAnalyze} disabled={!resumeText.trim() || loading}
          className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} /> Analyze Resume</>}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                <Award size={24} className="mx-auto mb-2 text-blue-400" />
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{result.score}/100</div>
                <p className="text-gray-400 text-sm mt-1">Resume Score</p>
              </div>
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                <BarChart3 size={24} className="mx-auto mb-2 text-green-400" />
                <div className="text-3xl font-black text-green-400">{result.atsScore}/100</div>
                <p className="text-gray-400 text-sm mt-1">ATS Compatibility</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2"><CheckCircle size={14} /> Strengths</h4>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />{s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2"><AlertTriangle size={14} /> Improvements</h4>
                <ul className="space-y-2">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2"><Target size={14} /> Keywords Analysis</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Found ({result.keywordsFound.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywordsFound.map((k, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-green-500/15 text-green-400 text-xs border border-green-500/20">{k}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Missing ({result.keywordsMissing.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywordsMissing.map((k, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-red-500/15 text-red-400 text-xs border border-red-500/20">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeScorer;
