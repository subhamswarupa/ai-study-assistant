import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Loader2, Clock, CheckCircle, XCircle, Award, RefreshCw, Star } from 'lucide-react';
import { getSkillQuiz } from '../services/geminiService';

const SkillQuiz = ({ career, toast }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(30);
  const [quizActive, setQuizActive] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    setLoading(true);
    const qs = await getSkillQuiz(career);
    setQuestions(qs);
    setLoading(false);
  };

  useEffect(() => {
    if (!quizActive || showResult || finished) return;
    if (timer <= 0) {
      handleTimeout();
      return;
    }
    const t = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(t);
  }, [timer, quizActive, showResult, finished]);

  const handleTimeout = () => {
    setShowResult(true);
  };

  const startQuiz = () => {
    setQuizActive(true);
    setCurrentIdx(0);
    setScore(0);
    setFinished(false);
    setSelected(null);
    setShowResult(false);
    setTimer(30);
  };

  const handleAnswer = (option) => {
    setSelected(option);
    setShowResult(true);
    if (option === questions[currentIdx].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setShowResult(false);
      setTimer(30);
    } else {
      setFinished(true);
      if (toast) toast(`Quiz complete! Score: ${score}/${questions.length}`, 'success');
    }
  };

  const restart = () => {
    setCurrentIdx(0);
    setScore(0);
    setFinished(false);
    setQuizActive(false);
    setSelected(null);
    setShowResult(false);
    setTimer(30);
    loadQuiz();
  };

  const getBadge = () => {
    const pct = (score / questions.length) * 100;
    if (pct >= 80) return { label: 'Expert', color: 'text-yellow-400', icon: <Award size={24} className="text-yellow-400" /> };
    if (pct >= 50) return { label: 'Intermediate', color: 'text-blue-400', icon: <Star size={24} className="text-blue-400" /> };
    return { label: 'Beginner', color: 'text-green-400', icon: <BrainCircuit size={24} className="text-green-400" /> };
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="animate-spin mx-auto mb-4 text-blue-400" size={36} />
        <p className="text-gray-400">Generating quiz questions...</p>
      </div>
    );
  }

  if (finished) {
    const badge = getBadge();
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center space-y-6">
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">
          <div className="flex justify-center mb-4">{badge.icon}</div>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">{score}/{questions.length}</div>
          <p className={`text-lg font-bold ${badge.color}`}>{badge.label}</p>
          <p className="text-gray-400 text-sm mt-2">
            {score === questions.length ? 'Perfect score! You are a quiz champion!' :
             score >= questions.length * 0.8 ? 'Great job! Almost perfect!' :
             score >= questions.length * 0.5 ? 'Good effort! Keep learning.' :
             'Keep practicing, you will improve!'}
          </p>
        </div>
        <button onClick={restart} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition flex items-center justify-center gap-2">
          <RefreshCw size={16} /> Try Again with New Questions
        </button>
      </motion.div>
    );
  }

  if (!quizActive) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <BrainCircuit size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Skill Quiz</h2>
        <p className="text-gray-400 mb-2">Test your knowledge with {questions.length} AI-generated questions</p>
        <p className="text-gray-500 text-sm mb-6">You have 30 seconds per question. Get a badge based on your score!</p>
        <button onClick={startQuiz}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition">
          Start Quiz
        </button>
      </motion.div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Question {currentIdx + 1} of {questions.length}</span>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${timer <= 5 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-300'}`}>
          <Clock size={12} /> {timer}s
        </div>
      </div>

      <div className="w-full h-1 rounded-full bg-gray-700 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <p className="text-white font-medium mb-4">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const letter = opt.charAt(0);
            const isCorrect = showResult && letter === q.correctAnswer;
            const isWrong = showResult && selected === letter && letter !== q.correctAnswer;
            return (
              <button key={i} onClick={() => !showResult && handleAnswer(letter)}
                disabled={showResult}
                className={`w-full text-left p-3 rounded-lg border text-sm transition ${
                  isCorrect ? 'bg-green-500/20 border-green-500/40 text-green-300' :
                  isWrong ? 'bg-red-500/20 border-red-500/40 text-red-300' :
                  showResult && selected === letter ? 'bg-red-500/20 border-red-500/40 text-red-300' :
                  'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}>
                {opt}
                {isCorrect && <CheckCircle size={14} className="inline ml-2 text-green-400" />}
                {isWrong && <XCircle size={14} className="inline ml-2 text-red-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm text-gray-300 mb-3">{q.explanation}</p>
            <button onClick={nextQuestion} className="w-full py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition">
              {currentIdx < questions.length - 1 ? 'Next Question' : 'See Results'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillQuiz;
