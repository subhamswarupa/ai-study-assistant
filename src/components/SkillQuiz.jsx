import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Loader2, Clock, CheckCircle, XCircle, Award, RefreshCw, Star, Trophy, Zap, ArrowRight, ChevronLeft, Medal, Sparkles, Target } from 'lucide-react';
import { getQuizTopics, getSkillQuiz } from '../services/geminiService';

const DIFFICULTIES = [
  { id: 'Beginner', icon: '🟢', color: 'green' },
  { id: 'Intermediate', icon: '🟡', color: 'blue' },
  { id: 'Advanced', icon: '🔴', color: 'orange' },
  { id: 'Extreme', icon: '💀', color: 'red' },
];

const TOPIC_ICONS = {
  python: '🐍', javascript: '🟨', react: '⚛️', sql: '🗄️', git: '🔀',
  docker: '🐳', aws: '☁️', css: '🎨', html: '🌐', node: '💚',
  typescript: '🔷', mongodb: '🍃', 'machine learning': '🤖', 'deep learning': '🧠',
  'data structures': '📊', 'system design': '🏗️', algorithms: '🔢',
  statistics: '📈', nlp: '💬', 'computer vision': '👁️', tensorflow: '🧩',
  pytorch: '🔥', excel: '📊', tableau: '📋', linux: '🐧',
  kubernetes: '☸️', ci: '🔄', cicd: '🔄', api: '🔌', graphql: '◈',
  java: '☕', go: '🔵', rust: '🦀', cpp: '⚡', cplusplus: '⚡',
};

const getTopicIcon = (topic) => {
  const key = topic.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [k, v] of Object.entries(TOPIC_ICONS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return '📚';
};

const getBadge = (score) => {
  if (score >= 81) return { label: 'Expert', emoji: '🏆', color: 'text-yellow-400', bg: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30' };
  if (score >= 61) return { label: 'Advanced', emoji: '🥇', color: 'text-orange-400', bg: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30' };
  if (score >= 41) return { label: 'Intermediate', emoji: '🥈', color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' };
  return { label: 'Beginner', emoji: '🥉', color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' };
};

const SkillQuiz = ({ career, profile, toast, onComplete }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Beginner');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [timer, setTimer] = useState(30);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const confettiCanvas = useRef(null);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (!quizStarted || showResult || finished || !questions.length) return;
    if (timer <= 0) { handleTimeout(); return; }
    const t = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(t);
  }, [timer, quizStarted, showResult, finished, questions]);

  const loadTopics = async () => {
    setLoading(true);
    const profileData = profile || { skills: career, targetCareer: career };
    const t = await getQuizTopics(profileData);
    setTopics(t.length >= 4 ? t : ['Python', 'JavaScript', 'Data Structures', 'SQL', 'React', 'System Design', 'Git', 'Algorithms']);
    setLoading(false);
  };

  const startQuizForTopic = async (topic, difficulty) => {
    setSelectedTopic(topic);
    setSelectedDifficulty(difficulty);
    setQuestionLoading(true);
    setQuizStarted(false);
    const qs = await getSkillQuiz(topic, difficulty, career);
    setQuestions(qs);
    setCurrentIdx(0);
    setSelected(null);
    setShowResult(false);
    setFinished(false);
    setScore(0);
    setBonus(0);
    setStreak(0);
    setMaxStreak(0);
    setAnswers([]);
    setTimer(30);
    setStartTime(Date.now());
    setShowConfetti(false);
    setQuestionLoading(false);
    setQuizStarted(true);
  };

  const handleTimeout = () => {
    setShowResult(true);
    setStreak(0);
  };

  const handleAnswer = (idx) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    const isCorrect = idx === questions[currentIdx].correct;
    const timeBonus = timer >= 20 ? 5 : 0;
    const newStreak = isCorrect ? streak + 1 : 0;
    const streakBonus = newStreak === 3 ? 15 : 0;

    let points = 0;
    if (isCorrect) {
      points = 10 + timeBonus + (newStreak === 3 ? 15 : 0);
      setBonus(b => b + timeBonus + (newStreak === 3 ? 15 : 0));
    }
    setScore(s => s + points);
    setStreak(newStreak);
    setMaxStreak(Math.max(maxStreak, isCorrect ? newStreak : 0));
    setAnswers([...answers, {
      question: questions[currentIdx].question,
      selected: idx,
      correct: questions[currentIdx].correct,
      isCorrect,
      explanation: questions[currentIdx].explanation,
    }]);
    if (newStreak === 3) setStreak(0);
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setShowResult(false);
      setTimer(30);
    } else {
      setFinished(true);
      const finalScore = Math.min(100, Math.round(((score) / (questions.length * 10)) * 100));
      if (finalScore >= 80) setShowConfetti(true);
      if (toast) toast(`Quiz complete! Score: ${finalScore}%`, 'success');
      if (onComplete) onComplete(finalScore);
    }
  };

  const goBack = () => { setSelectedTopic(null); setQuizStarted(false); setFinished(false); };

  const tryHarder = () => {
    const diffs = DIFFICULTIES.map(d => d.id);
    const idx = diffs.indexOf(selectedDifficulty);
    const next = idx < diffs.length - 1 ? diffs[idx + 1] : diffs[idx];
    startQuizForTopic(selectedTopic, next);
  };

  const finalScore = Math.min(100, Math.round(questions.length > 0 ? (score / (questions.length * 10)) * 100 : 0));
  const badge = getBadge(finalScore);
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="animate-spin mx-auto mb-4 text-blue-400" size={36} />
        <p className="text-gray-400">Preparing quiz topics...</p>
      </div>
    );
  }

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
        {showConfetti && (
          <canvas ref={confettiCanvas} className="fixed inset-0 pointer-events-none z-50" width={window.innerWidth} height={window.innerHeight} />
        )}
        <div className={`p-8 rounded-2xl bg-gradient-to-br ${badge.bg} border ${badge.border} text-center`}>
          <div className="text-5xl mb-4">{badge.emoji}</div>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-1">{finalScore}%</div>
          <p className={`text-xl font-bold ${badge.color} mb-4`}>{badge.label}</p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <div className="p-3 rounded-xl bg-white/5"><div className="text-lg font-bold text-green-400">{correctCount}</div><div className="text-xs text-gray-500">Correct</div></div>
            <div className="p-3 rounded-xl bg-white/5"><div className="text-lg font-bold text-red-400">{questions.length - correctCount}</div><div className="text-xs text-gray-500">Wrong</div></div>
            <div className="p-3 rounded-xl bg-white/5"><div className="text-lg font-bold text-blue-400">{maxStreak}</div><div className="text-xs text-gray-500">Streak</div></div>
          </div>
          {totalTime > 0 && <p className="text-sm text-gray-500 mt-4">Time: {Math.floor(totalTime / 60)}m {totalTime % 60}s</p>}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-300">Question Review</h4>
          {answers.map((a, i) => (
            <div key={i} className={`p-4 rounded-xl border ${a.isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5">{a.isCorrect ? '✅' : '❌'}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-300 mb-1">Q{i + 1}: {a.question || a.options?.[0]}</p>
                  <p className="text-xs text-gray-500">Your answer: {a.selected !== null ? a.options?.[a.selected] : a.selected}</p>
                  <p className="text-xs text-gray-500">Correct: {a.options?.[a.correct]}</p>
                  {a.explanation && <p className="text-xs text-gray-500 mt-1">{a.explanation}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={goBack} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 text-sm font-medium hover:bg-white/5 transition flex items-center justify-center gap-2">
            <ChevronLeft size={16} /> Change Topic
          </button>
          <button onClick={() => startQuizForTopic(selectedTopic, selectedDifficulty)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg transition flex items-center justify-center gap-2">
            <RefreshCw size={16} /> Try Again
          </button>
          {DIFFICULTIES.findIndex(d => d.id === selectedDifficulty) < 3 && (
            <button onClick={tryHarder} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium hover:shadow-lg transition flex items-center justify-center gap-2">
              <Zap size={16} /> Try Harder
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  if (questionLoading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="animate-spin mx-auto mb-4 text-blue-400" size={36} />
        <p className="text-gray-400">Generating {selectedDifficulty} questions about {selectedTopic}...</p>
      </div>
    );
  }

  if (quizStarted && questions.length > 0) {
    const q = questions[currentIdx];
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={goBack} className="text-xs text-gray-500 hover:text-gray-300 transition flex items-center gap-1">
            <ChevronLeft size={14} /> Quit
          </button>
          <span className="text-sm text-gray-400">Question {currentIdx + 1}/{questions.length}</span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-300">
            <Star size={12} className="text-yellow-400" /> {score}
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
        </div>

        <div className={`w-full h-1.5 rounded-full bg-gray-700 overflow-hidden ${timer <= 10 ? 'animate-pulse' : ''}`}>
          <div className={`h-full rounded-full transition-all ${timer <= 5 ? 'bg-red-500' : timer <= 10 ? 'bg-yellow-500' : 'bg-blue-500'}`}
            style={{ width: `${(timer / 30) * 100}%` }} />
        </div>

        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${timer <= 5 ? 'bg-red-500/20 text-red-400 animate-pulse' : timer <= 10 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-gray-300'}`}>
            <Clock size={14} /> {timer}s
          </div>
          {streak >= 2 && <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold animate-pulse">🔥 {streak} streak!</div>}
        </div>

        <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-xl bg-white/5 border border-white/10">
          <p className="text-lg font-medium text-white mb-5">{q.question}</p>
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isCorrect = showResult && i === q.correct;
              const isWrong = showResult && selected === i && i !== q.correct;
              const isSelected = selected === i;
              return (
                <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => handleAnswer(i)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    isCorrect ? 'bg-green-500/20 border-green-500 text-green-300 shadow-lg shadow-green-500/10' :
                    isWrong ? 'bg-red-500/20 border-red-500 text-red-300' :
                    isSelected && showResult ? 'bg-red-500/20 border-red-500/50 text-red-300' :
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
                {timer >= 20 && selected === q.correct && <span className="text-xs text-yellow-400">+5 speed bonus!</span>}
                {streak === 3 && <span className="text-xs text-orange-400">🔥 +15 streak bonus!</span>}
              </div>
              <p className="text-sm text-gray-400 mb-3">{q.explanation}</p>
              <button onClick={nextQuestion}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition">
                {currentIdx < questions.length - 1 ? 'Next Question →' : 'See Results'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

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
        {topics.map((topic, i) => (
          <motion.div key={topic} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{getTopicIcon(topic)}</span>
              <h3 className="font-bold text-white text-sm">{topic}</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">10 questions</p>
            <div className="space-y-1.5 mb-4">
              {DIFFICULTIES.map(d => (
                <button key={d.id} onClick={() => startQuizForTopic(topic, d.id)}
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
};

export default SkillQuiz;
