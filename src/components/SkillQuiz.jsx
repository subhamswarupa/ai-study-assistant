import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Loader2, Clock, CheckCircle, XCircle, Award, RefreshCw, Star, Zap, ArrowRight, ChevronLeft, AlertTriangle } from 'lucide-react';

const TOPICS = [
  { name: 'Python', icon: '🐍' },
  { name: 'Java', icon: '☕' },
  { name: 'HTML & CSS', icon: '🌐' },
  { name: 'JavaScript', icon: '⚡' },
  { name: 'React', icon: '⚛️' },
  { name: 'SQL', icon: '🗄️' },
  { name: 'Machine Learning', icon: '🤖' },
  { name: 'Data Structures', icon: '🔧' },
  { name: 'Cloud & AWS', icon: '☁️' },
  { name: 'Cybersecurity', icon: '🔒' },
  { name: 'Android Development', icon: '📱' },
  { name: 'DevOps & Docker', icon: '🐳' },
];

const DIFFICULTIES = [
  { id: 'Easy', icon: '🟢', color: 'green' },
  { id: 'Medium', icon: '🟡', color: 'blue' },
  { id: 'Hard', icon: '🔴', color: 'orange' },
  { id: 'Extreme', icon: '💀', color: 'red' },
];

const getBadge = (score) => {
  if (score >= 81) return { label: 'Expert', emoji: '🏆', color: 'text-yellow-400' };
  if (score >= 61) return { label: 'Advanced', emoji: '🥇', color: 'text-orange-400' };
  if (score >= 41) return { label: 'Intermediate', emoji: '🥈', color: 'text-blue-400' };
  return { label: 'Beginner', emoji: '🥉', color: 'text-green-400' };
};

const SkillQuiz = ({ career, profile, toast, onComplete }) => {
  const [screen, setScreen] = useState('topics');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [answers, setAnswers] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiCanvas = useRef(null);

  const generateQuestions = async (topic, difficulty) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key first 10 chars:', apiKey?.substring(0, 10));
    if (!apiKey) throw new Error('API key not found');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create 10 multiple choice questions about ${topic} at ${difficulty} level.
IMPORTANT: Return ONLY a JSON array. No markdown. No explanation. Just JSON.
Format:
[{"question":"question text?","options":["option1","option2","option3","option4"],"correct":0,"explanation":"why correct"}]
correct is 0,1,2,3 index of correct answer.`
            }]
          }]
        })
      }
    );

    clearTimeout(timeoutId);
    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  };

  const startQuiz = async (topic, difficulty) => {
    setSelectedTopic(topic);
    setSelectedDifficulty(difficulty);
    setScreen('loading');
    setErrorMsg(null);
    try {
      const qs = await generateQuestions(topic, difficulty);
      setQuestions(qs);
      setCurrentIdx(0);
      setSelected(null);
      setShowResult(false);
      setScore(0);
      setAnswers([]);
      setTimer(30);
      setShowConfetti(false);
      setScreen('quiz');
    } catch (e) {
      setErrorMsg(e.message || 'Could not generate questions');
      setScreen('error');
    }
  };

  useEffect(() => {
    if (screen !== 'quiz' || showResult) return;
    if (timer <= 0) { setShowResult(true); return; }
    const t = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(t);
  }, [timer, screen, showResult]);

  const handleAnswer = (idx) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    const isCorrect = idx === questions[currentIdx].correct;
    const timeBonus = timer >= 15 ? 5 : 0;
    let points = 0;
    if (isCorrect) points = 10 + timeBonus;
    setScore(s => s + points);
    setAnswers([...answers, {
      question: questions[currentIdx].question,
      selected: idx,
      correct: questions[currentIdx].correct,
      isCorrect,
      explanation: questions[currentIdx].explanation,
    }]);
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setShowResult(false);
      setTimer(30);
    } else {
      const finalScore = Math.min(100, Math.round((score / (questions.length * 10)) * 100));
      if (finalScore > 70) setShowConfetti(true);
      if (toast) toast(`Quiz complete! Score: ${finalScore}%`, 'success');
      if (onComplete) onComplete(finalScore);
      setScreen('results');
    }
  };

  const goBack = () => { setScreen('topics'); setQuestions([]); setAnswers([]); };

  const finalScore = Math.min(100, Math.round(questions.length > 0 ? (score / (questions.length * 10)) * 100 : 0));
  const badge = getBadge(finalScore);
  const correctCount = answers.filter(a => a.isCorrect).length;

  if (screen === 'topics') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <BrainCircuit size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Skill Quiz</h2>
          <p className="text-gray-400 text-sm">Pick a topic and difficulty to test your knowledge</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map((topic, i) => (
            <motion.div key={topic.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{topic.icon}</span>
                <h3 className="font-bold text-white text-sm">{topic.name}</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">10 questions</p>
              <div className="space-y-1.5">
                {DIFFICULTIES.map(d => (
                  <button key={d.id} onClick={() => startQuiz(topic.name, d.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      d.color === 'green' ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' :
                      d.color === 'blue' ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' :
                      d.color === 'orange' ? 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10' :
                      'border-red-500/30 text-red-400 hover:bg-red-500/10'
                    }`}>
                    <span>{d.icon}</span>
                    {d.id}
                    <ArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (screen === 'loading') {
    return (
      <div className="text-center py-16">
        <Loader2 className="animate-spin mx-auto mb-4 text-blue-400" size={36} />
        <p className="text-gray-400">Generating {selectedDifficulty} questions about {selectedTopic}...</p>
      </div>
    );
  }

  if (screen === 'error') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <p className="text-gray-300 font-medium mb-2">Question generation failed</p>
        <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
        <button onClick={() => startQuiz(selectedTopic, selectedDifficulty)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition flex items-center gap-2 mx-auto">
          <RefreshCw size={16} /> Try Again
        </button>
      </motion.div>
    );
  }

  if (screen === 'results') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
        {showConfetti && (
          <canvas ref={confettiCanvas} className="fixed inset-0 pointer-events-none z-50" width={window.innerWidth} height={window.innerHeight} />
        )}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 text-center">
          <div className="text-5xl mb-4">{badge.emoji}</div>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-1">{finalScore}%</div>
          <p className={`text-xl font-bold ${badge.color} mb-4`}>{badge.label}</p>
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="p-3 rounded-xl bg-white/5"><div className="text-lg font-bold text-green-400">{correctCount}</div><div className="text-xs text-gray-500">Correct</div></div>
            <div className="p-3 rounded-xl bg-white/5"><div className="text-lg font-bold text-red-400">{questions.length - correctCount}</div><div className="text-xs text-gray-500">Wrong</div></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={goBack} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 text-sm font-medium hover:bg-white/5 transition flex items-center justify-center gap-2">
            <ChevronLeft size={16} /> Change Topic
          </button>
          <button onClick={() => startQuiz(selectedTopic, selectedDifficulty)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg transition flex items-center justify-center gap-2">
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  if (screen === 'quiz') {
    const q = questions[currentIdx];
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={goBack} className="text-xs text-gray-500 hover:text-gray-300 transition flex items-center gap-1">
            <ChevronLeft size={14} /> Quit
          </button>
          <span className="text-sm text-gray-400">Question {currentIdx + 1}/10</span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-300">
            <Star size={12} className="text-yellow-400" /> {score}
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${((currentIdx + 1) / 10) * 100}%` }} />
        </div>

        <div className={`w-full h-1.5 rounded-full bg-gray-700 overflow-hidden ${timer <= 10 ? 'animate-pulse' : ''}`}>
          <div className={`h-full rounded-full transition-all ${timer <= 5 ? 'bg-red-500' : timer <= 10 ? 'bg-yellow-500' : 'bg-blue-500'}`}
            style={{ width: `${(timer / 30) * 100}%` }} />
        </div>

        <div className="flex items-center">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${timer <= 5 ? 'bg-red-500/20 text-red-400 animate-pulse' : timer <= 10 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-gray-300'}`}>
            <Clock size={14} /> {timer}s
          </div>
        </div>

        <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-xl bg-white/5 border border-white/10">
          <p className="text-lg font-medium text-white mb-5">{q.question}</p>
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isCorrect = showResult && i === q.correct;
              const isWrong = showResult && selected === i && i !== q.correct;
              return (
                <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => handleAnswer(i)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    isCorrect ? 'bg-green-500/20 border-green-500 text-green-300 shadow-lg shadow-green-500/10' :
                    isWrong ? 'bg-red-500/20 border-red-500 text-red-300' :
                    'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-blue-500/30'
                  }`}>
                  <span className="font-bold mr-3">{['A', 'B', 'C', 'D'][i]}.</span>
                  {opt.replace(/^[A-D]\)\s*/, '').replace(/^[A-D]\.\s*/, '')}
                  {isCorrect && <CheckCircle size={16} className="inline ml-2 text-green-400" />}
                  {isWrong && <XCircle size={16} className="inline ml-2 text-red-400" />}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence>
          {showResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                {selected === q.correct ? <span className="text-2xl">🎉</span> : <span className="text-2xl">💪</span>}
                <span className={`text-sm font-bold ${selected === q.correct ? 'text-green-400' : 'text-red-400'}`}>
                  {selected === q.correct ? 'Correct!' : 'Wrong!'}
                </span>
                {timer >= 15 && selected === q.correct && <span className="text-xs text-yellow-400">+5 speed bonus!</span>}
              </div>
              <p className="text-sm text-gray-400 mb-3">{q.explanation}</p>
              <button onClick={nextQuestion}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition">
                {currentIdx < 9 ? 'Next Question →' : 'See Results'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};

export default SkillQuiz;
