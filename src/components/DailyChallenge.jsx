import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle, Loader2, Flame, Zap, RefreshCw, Trophy } from 'lucide-react';
import { getDailyChallenge } from '../services/geminiService';

const STREAK_KEY = 'ssos_streak';
const CHALLENGE_KEY = 'ssos_challenge';

const DailyChallenge = ({ profile, toast }) => {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadStreak();
    loadChallenge();
  }, []);

  const loadStreak = () => {
    const saved = localStorage.getItem(STREAK_KEY);
    if (saved) {
      const { date, count } = JSON.parse(saved);
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (date === today) setStreak(count);
      else if (date === yesterday) setStreak(count);
      else setStreak(0);
    }
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(STREAK_KEY);
    let count = 1;
    if (saved) {
      const { date, count: c } = JSON.parse(saved);
      if (date === today) { count = c; return; }
      if (date === new Date(Date.now() - 86400000).toDateString()) count = c + 1;
    }
    setStreak(count);
    localStorage.setItem(STREAK_KEY, JSON.stringify({ date: today, count }));
  };

  const loadChallenge = async () => {
    setLoading(true);
    setCompleted(false);
    const cached = localStorage.getItem(CHALLENGE_KEY);
    const today = new Date().toDateString();

    if (cached) {
      try {
        const { date, data, done } = JSON.parse(cached);
        if (date === today) {
          setChallenge(data);
          setCompleted(done);
          setLoading(false);
          return;
        }
      } catch {}
    }

    const ch = await getDailyChallenge(profile);
    setChallenge(ch);
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify({ date: today, data: ch, done: false }));
    setLoading(false);
  };

  const handleComplete = () => {
    setCompleted(true);
    updateStreak();
    let cached = {};
    try { cached = JSON.parse(localStorage.getItem(CHALLENGE_KEY) || '{}'); } catch {};
    cached.done = true;
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(cached));
    if (toast) toast('Challenge completed! Keep the streak going!', 'success');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="animate-spin mx-auto mb-3 text-blue-400" size={24} />
        <p className="text-gray-400 text-sm">Loading today's challenge...</p>
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2"><Target size={16} className="text-blue-400" /> Daily Challenge</h3>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 text-xs font-semibold">
          <Flame size={14} /> Streak: {streak} day{streak !== 1 ? 's' : ''}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-xl border transition-all ${completed ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${completed ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
            {completed ? <Trophy size={20} className="text-green-400" /> : <Zap size={20} className="text-blue-400" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-white text-sm">{challenge.title}</h4>
              <span className="text-xs text-gray-500">{challenge.estimatedMinutes} min</span>
            </div>
            <p className="text-sm text-gray-400 mb-2">{challenge.description}</p>
            {challenge.hint && (
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-3">
                <p className="text-xs text-yellow-300">💡 {challenge.hint}</p>
              </div>
            )}
            {challenge.expectedOutcome && (
              <p className="text-xs text-gray-500 mb-3">🎯 {challenge.expectedOutcome}</p>
            )}
            {!completed ? (
              <button onClick={handleComplete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium hover:shadow-lg transition">
                <CheckCircle size={14} /> Mark as Complete
              </button>
            ) : (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle size={16} /> Completed!
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DailyChallenge;
