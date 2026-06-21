import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, CheckCircle, XCircle, TrendingUp, Loader2, AlertTriangle, Sparkles, BarChart3, Target, Award, File, FileImage, FileSearch, X } from 'lucide-react';
import { getResumeScore, extractTextFromImage } from '../services/geminiService';

function extractFileType(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return { type: 'pdf', icon: 'pdf' };
  if (['doc', 'docx'].includes(ext)) return { type: 'docx', icon: 'doc' };
  if (['jpg', 'jpeg', 'png'].includes(ext)) return { type: 'image', icon: 'image' };
  if (ext === 'txt') return { type: 'txt', icon: 'txt' };
  return null;
}

const FileIcon = ({ fileType }) => {
  if (fileType === 'pdf' || fileType === 'doc') return <File size={20} className="text-blue-400" />;
  if (fileType === 'image') return <FileImage size={20} className="text-green-400" />;
  if (fileType === 'txt') return <FileSearch size={20} className="text-yellow-400" />;
  return <File size={20} className="text-gray-400" />;
};

async function extractTextFromFile(file) {
  const info = extractFileType(file.name);
  if (!info) return null;
  const type = info.type;
  const buffer = await file.arrayBuffer();

  if (type === 'txt') {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  }

  if (type === 'pdf') {
    try {
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

  if (type === 'docx') {
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return result.value || null;
    } catch (e) {
      console.warn('DOCX extraction failed:', e);
      return null;
    }
  }

  if (type === 'image') {
    try {
      const text = await extractTextFromImage(file);
      return text || null;
    } catch (e) {
      console.warn('Image OCR failed:', e);
      return null;
    }
  }

  return null;
}

const ResumeScorer = ({ career, toast }) => {
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const [fileType, setFileType] = useState(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    const info = extractFileType(file.name);
    if (!info) {
      if (toast) toast('Please upload a PDF, DOCX, image (JPG/PNG), or TXT file', 'error');
      return;
    }
    setFileName(file.name);
    setFileType(info.icon);
    setUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(p => Math.min(90, p + Math.random() * 15));
    }, 300);

    const text = await extractTextFromFile(file);

    clearInterval(progressInterval);
    setUploadProgress(100);

    if (text && text.trim().length > 20) {
      setResumeText(text);
      if (toast) toast(`Extracted ${text.split(/\s+/).length} words from ${file.name}`, 'success');
    } else {
      if (toast) toast('Could not extract text. Try pasting manually.', 'error');
    }

    setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500);
  }, [toast]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    const res = await getResumeScore(resumeText, career);
    setResult(res);
    setLoading(false);
    if (toast) toast('Resume analyzed!', 'success');
  };

  const clearFile = () => {
    setFileName('');
    setResumeText('');
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <FileText size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">AI Resume Analyzer</h2>
        <p className="text-gray-400 text-sm">Upload your resume (PDF/DOCX) or paste content — get ATS score + feedback</p>
      </div>

      <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
        {uploading ? (
          <div className="p-6 text-center">
            <Loader2 className="animate-spin mx-auto mb-3 text-blue-400" size={28} />
            <p className="text-sm text-gray-400 mb-2">Extracting text from {fileName}...</p>
            <div className="w-full max-w-xs mx-auto h-1.5 rounded-full bg-gray-700 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : fileName ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <FileIcon fileType={fileType} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-300 truncate">{fileName}</p>
              <p className="text-xs text-gray-500">{resumeText.split(/\s+/).length} words extracted</p>
            </div>
            <button onClick={clearFile} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-gray-400 hover:text-white transition">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
              dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-500/50 hover:bg-white/5'
            }`}
          >
            <Upload size={36} className={`mx-auto mb-3 ${dragOver ? 'text-blue-400' : 'text-gray-500'}`} />
            <p className="text-sm text-gray-400 mb-1">Drag & drop your resume here</p>
            <p className="text-xs text-gray-500">Supports PDF, DOCX, JPG/PNG, TXT</p>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
          </div>
        )}

        {!fileName && !uploading && (
          <>
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
          </>
        )}

        <button onClick={handleAnalyze} disabled={!resumeText.trim() || loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-2">
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
