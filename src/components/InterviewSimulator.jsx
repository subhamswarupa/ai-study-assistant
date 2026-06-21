import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Lightbulb, CheckCircle, Loader2, MessageSquare, ArrowLeft, Award, Star, RefreshCw } from 'lucide-react';
import { getInterviewQuestions, getInterviewFeedback } from '../services/geminiService';

const InterviewSimulator = ({ career, toast }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const qs = await getInterviewQuestions(career);
    setQuestions(qs);
    setLoading(false);
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    const q = questions[currentIdx];
    setSubmitting(true);
    const fb = await getInterviewFeedback(q.question, currentAnswer, career);
    setFeedbacks({ ...feedbacks, [currentIdx]: fb });
    setAnswers({ ...answers, [currentIdx]: currentAnswer });
    setCurrentAnswer('');
    setSubmitting(false);
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setFinished(true);
      if (toast) toast('Interview complete!', 'success');
    }
  };

  const restart = () => {
    setCurrentIdx(0);
    setAnswers({});
    setFeedbacks({});
    setFinished(false);
    setStarted(false);
    setCurrentAnswer('');
    loadQuestions();
  };

  const totalScore = Object.values(feedbacks).reduce((sum, f) => sum + (f.score || 0), 0);
  const maxScore = questions.length * 10;
  const avgScore = questions.length > 0 ? Math.round(totalScore / questions.length) : 0;

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="animate-spin mx-auto mb-4 text-blue-400" size={36} />
        <p className="text-gray-400">Preparing interview questions...</p>
      </div>
    );
  }

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Award size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Interview Complete!</h2>
          <p className="text-gray-400">You answered {questions.length} questions</p>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">{totalScore}/{maxScore}</div>
          <p className="text-gray-400">Overall Score</p>
          <div className="flex justify-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={20} className={s <= Math.round(avgScore / 2) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {avgScore >= 8 ? 'Excellent! You are well prepared.' : avgScore >= 5 ? 'Good effort! Keep practicing.' : 'Keep practicing to improve your answers.'}
          </p>
        </div>
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-gray-300 mb-2">Q{i + 1}: {q.question}</p>
              {feedbacks[i] && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-400 font-bold">{feedbacks[i].score}/10</span>
                  <span className="text-gray-400">{feedbacks[i].feedback}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <button onClick={restart} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition flex items-center justify-center gap-2">
          <RefreshCw size={16} /> Try Again with New Questions
        </button>
      </motion.div>
    );
  }

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Mic size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">AI Interview Simulator</h2>
        <p className="text-gray-400 mb-2">Practice with {questions.length} AI-generated questions for {career}</p>
        <p className="text-gray-500 text-sm mb-6">Type your answers and get scored 1-10 with detailed feedback</p>
        <button onClick={() => setStarted(true)}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition">
          Start Interview
        </button>
      </motion.div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Question {currentIdx + 1} of {questions.length}</span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i < currentIdx ? 'bg-blue-500' : i === currentIdx ? 'bg-blue-400' : 'bg-gray-600'}`} />
          ))}
        </div>
      </div>

      <div className="w-full h-1 rounded-full bg-gray-700 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-start gap-3 mb-4">
          <MessageSquare size={18} className="text-blue-400 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">{q.category}</span>
            <p className="text-white font-medium mt-2">{q.question}</p>
          </div>
        </div>
        {q.hint && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Lightbulb size={14} className="text-yellow-400 mt-0.5 shrink-0" />
            <span className="text-xs text-yellow-300">{q.hint}</span>
          </div>
        )}
      </div>

      {feedbacks[currentIdx] ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-black text-blue-400">{feedbacks[currentIdx].score}/10</div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className={s <= Math.round(feedbacks[currentIdx].score / 2) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-300">{feedbacks[currentIdx].feedback}</p>
          {feedbacks[currentIdx].strengths?.length > 0 && (
            <div><p className="text-xs text-green-400 font-semibold mb-1">Strengths:</p>
              {feedbacks[currentIdx].strengths.map((s, i) => <p key={i} className="text-xs text-gray-400">✓ {s}</p>)}
            </div>
          )}
          {feedbacks[currentIdx].improvements?.length > 0 && (
            <div><p className="text-xs text-orange-400 font-semibold mb-1">Improve:</p>
              {feedbacks[currentIdx].improvements.map((s, i) => <p key={i} className="text-xs text-gray-400">→ {s}</p>)}
            </div>
          )}
          <button onClick={nextQuestion} className="w-full py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition">
            {currentIdx < questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <textarea value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} rows={4}
            placeholder="Type your answer here..."
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-blue-500/50 transition text-sm resize-none"
          />
          <button onClick={handleSubmitAnswer} disabled={!currentAnswer.trim() || submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-2">
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Send size={16} /> Submit Answer</>}
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewSimulator;
