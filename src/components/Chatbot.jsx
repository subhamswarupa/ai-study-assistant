import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, X, BrainCircuit, MessageCircle, Lightbulb, Code, BookOpen,
  Target, Briefcase, Sparkles, BarChart3, ListChecks, GraduationCap, Zap,
  Maximize2, Minimize2, Mic, Download, ChevronRight, History
} from 'lucide-react';
import { getAIResponse } from '../services/geminiService';
import { useToast } from './Toast';

const QUICK_QUESTIONS = [
  { icon: <Lightbulb size={14} />, text: "What should I learn first?" },
  { icon: <BarChart3 size={14} />, text: "Review my profile" },
  { icon: <GraduationCap size={14} />, text: "Give me interview tips" },
  { icon: <ListChecks size={14} />, text: "Create today's study plan" },
  { icon: <Code size={14} />, text: "Give me project ideas" },
  { icon: <Target size={14} />, text: "What jobs match me?" },
];

const CHAT_HISTORY_KEY = 'ssos_chat_history';

const Chatbot = ({ context }) => {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Welcome to **Student Success OS**! I'm your dedicated Career Coach.

Here's what I can help you with today:
• 🎯 **Skill Prioritization** — What to learn first
• 📊 **Profile Review** — Honest feedback on your readiness
• 💼 **Interview Tips** — Ace your technical rounds
• 📚 **Daily Study Plan** — Optimized for your schedule
• 🛠 **Project Ideas** — Portfolio builders that impress

What would you like to work on?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "Tell me more about that",
    "Can you give me an example?",
    "What should I do next?"
  ]);
  const chatRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setSuggestions([]);
    const response = await getAIResponse(msg, context);
    setMessages([...newMessages, { role: 'ai', content: response }]);
    setSuggestions([
      "Can you elaborate on that?",
      "Give me a step-by-step plan",
      "What resources should I use?"
    ]);
    setLoading(false);
  };

  const clearChat = () => {
    const initial = [{ role: 'ai', content: `Welcome back! How can I help you with your career journey today?` }];
    setMessages(initial);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(initial));
  };

  const exportChat = () => {
    const text = messages.map(m => `${m.role === 'user' ? 'You' : 'Coach'}: ${m.content}`).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `chat-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast('Speech recognition not supported in your browser', 'error'); return; }
    if (listening) { setListening(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  };

  const formatMessage = (text) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 hover:shadow-blue-500/25 transition-all duration-300 pulse-glow"
        aria-label="Open Career Coach"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 bg-slate-900/95 backdrop-blur-2xl shadow-2xl border-l border-white/10 z-50 flex flex-col ${
              fullscreen ? 'inset-0 w-full border-l-0' : 'h-full w-full sm:w-[420px]'
            }`}
          >
            <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <BrainCircuit size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Student Success OS</h2>
                    <p className="text-[10px] text-white/50 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      Career Coach · Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={exportChat} className="p-2 text-white/50 hover:text-white transition" title="Export chat">
                    <Download size={16} />
                  </button>
                  <button onClick={() => setFullscreen(!fullscreen)} className="p-2 text-white/50 hover:text-white transition" title={fullscreen ? 'Minimize' : 'Fullscreen'}>
                    {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button onClick={() => { setIsOpen(false); setFullscreen(false); }} className="p-2 text-white/50 hover:text-white transition">
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {showHistory && (
              <div className="p-4 bg-blue-500/10 border-b border-blue-500/20">
                <p className="text-xs text-blue-300 mb-2">Chat history is automatically saved. You can clear it anytime.</p>
                <button onClick={() => { clearChat(); setShowHistory(false); }} className="text-xs text-red-400 hover:text-red-300 transition">Clear chat history</button>
              </div>
            )}

            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Quick Actions</p>
                <button onClick={() => setShowHistory(!showHistory)} className="text-[10px] text-white/30 hover:text-white/50 transition flex items-center gap-1">
                  <History size={10} /> History
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q.text)} disabled={loading}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 border border-white/10 transition disabled:opacity-40">
                    {q.icon}{q.text}
                  </button>
                ))}
              </div>
            </div>

            <div ref={chatRef} className={`flex-1 overflow-y-auto p-4 space-y-4 ${fullscreen ? 'max-w-3xl mx-auto w-full' : ''}`}>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white/10 text-white/90 rounded-bl-md'
                  }`}>
                    {m.role === 'ai' ? formatMessage(m.content) : m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl rounded-bl-md p-4">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {!loading && suggestions.length > 0 && messages.length > 1 && (
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-xs text-blue-300 border border-blue-500/20 transition">
                      {s} <ChevronRight size={10} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <button onClick={startListening}
                  className={`p-2.5 rounded-xl border transition ${listening ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70'}`}
                  title={listening ? 'Listening...' : 'Voice input'}>
                  <Mic size={18} />
                </button>
                <input value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask your career coach..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition text-sm"
                />
                <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg disabled:opacity-50 transition">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
