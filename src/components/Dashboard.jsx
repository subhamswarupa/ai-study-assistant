import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit, Target, BookOpen, Clock, Lightbulb, Award, TrendingUp,
  CheckSquare, Star, Sparkles, BarChart3, Zap, User, Flame, Trophy,
  Medal, CheckCircle, HelpCircle, ChevronRight, Code, Loader2, X
} from 'lucide-react';
import { useToast } from './Toast';
import DailyChallenge from './DailyChallenge';
import LearningPathTracker from './LearningPathTracker';

const InterviewSimulator = lazy(() => import('./InterviewSimulator'));
const ResumeScorer = lazy(() => import('./ResumeScorer'));
const JobMatchFinder = lazy(() => import('./JobMatchFinder'));
const InterviewBank = lazy(() => import('./InterviewBank'));

const GlassCard = ({ title, icon: Icon, children, className = "", delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.08, duration: 0.4, ease: 'easeOut' }}
    className={`pro-card p-6 ${className}`}>
    <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
      {Icon && <Icon size={18} className="text-blue-500" />} {title}
    </h3>
    {children}
  </motion.div>
);

const BADGE_KEY = 'ssos_badges';

const ACHIEVEMENTS = [
  { id: 'profile', label: 'Profile Complete', icon: <User size={20} />, desc: 'Filled all form fields' },
  { id: 'analysis', label: 'First Analysis', icon: <BrainCircuit size={20} />, desc: 'Ran first AI analysis' },
  { id: 'interview', label: 'Interview Ready', icon: <Star size={20} />, desc: 'Completed interview simulator' },
  { id: 'resume', label: 'Resume Master', icon: <BookOpen size={20} />, desc: 'Analyzed a resume' },
  { id: 'quiz', label: 'Quiz Champion', icon: <Trophy size={20} />, desc: 'Scored 100% on skill quiz' },
  { id: 'streak', label: 'Week Warrior', icon: <Flame size={20} />, desc: '7 day streak' },
];

const Dashboard = ({ profileData, report, onBack, user, activeSection }) => {
  const toast = useToast();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [roadmapChecks, setRoadmapChecks] = useState((report?.roadmap || []).map(() => false));
  const [badges, setBadges] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BADGE_KEY) || '{}'); } catch { return {}; }
  });
  const roadmapRef = useRef(null);
  const scheduleRef = useRef(null);

  useEffect(() => { setRoadmapChecks((report?.roadmap || []).map(() => false)); }, [report]);

  const finalScore = report?.readinessScore ?? 0;
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const step = 16;
    const increment = (finalScore / duration) * step;
    const timer = setInterval(() => {
      start += increment;
      if (start >= finalScore) { setAnimatedScore(finalScore); clearInterval(timer); }
      else setAnimatedScore(Math.round(start));
    }, step);
    return () => clearInterval(timer);
  }, [finalScore]);

  // Unlock profile badge on mount
  useEffect(() => {
    if (profileData) unlockBadge('profile');
  }, [profileData]);

  // Unlock analysis badge when report comes in
  useEffect(() => {
    if (report) unlockBadge('analysis');
  }, [report]);

  const unlockBadge = (id) => {
    if (badges[id]) return;
    const updated = { ...badges, [id]: true };
    setBadges(updated);
    localStorage.setItem(BADGE_KEY, JSON.stringify(updated));
    if (toast) toast(`Achievement unlocked: ${ACHIEVEMENTS.find(a => a.id === id)?.label}!`, 'success');
  };

  const initials = (profileData?.name || "ST").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const circumference = 314;
  const offset = circumference - (animatedScore / 100) * circumference;
  const checkedCount = roadmapChecks.filter(Boolean).length;
  const unlockedCount = Object.keys(badges).filter(k => badges[k]).length;

  const sectionContent = {
    overview: (
      <div className="space-y-6" id="dashboard-overview">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard title="Readiness Score" icon={Award} delay={1} className="text-center">
            <div className="relative w-36 h-36 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset}
                  className="transition-all duration-100 ease-out" />
                <defs><linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-gray-900 dark:text-white">{animatedScore}%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {animatedScore >= 80 ? "Excellent" : animatedScore >= 70 ? "Good" : "Fair"}
                </span>
              </div>
            </div>
          </GlassCard>
          <GlassCard title="Strengths & Improvements" icon={BrainCircuit} delay={2} className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2"><Star size={14} /> Strengths</h4>
                <ul className="space-y-2">{(report?.strengths || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" /> {s}</li>
                ))}</ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-3 flex items-center gap-2"><Zap size={14} /> Improvements</h4>
                <ul className="space-y-2">{(report?.weaknesses || []).map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" /> {w}</li>
                ))}</ul>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard title="Daily Challenge" icon={Zap} delay={3}>
            <DailyChallenge profile={profileData} toast={toast} />
          </GlassCard>
          <GlassCard title="Learning Path" icon={Target} delay={4}>
            <LearningPathTracker career={profileData?.targetCareer} toast={toast} />
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard title="Current Skills" icon={Code} delay={5}>
            <div className="flex flex-wrap gap-2">{(report?.currentSkills || []).length > 0 ? (report?.currentSkills || []).map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-500/20">{s}</span>
            )) : <p className="text-gray-400 text-sm">No skills listed yet.</p>}</div>
          </GlassCard>
          <GlassCard title="Achievement Badges" icon={Trophy} delay={6}>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = badges[a.id];
                return (
                  <div key={a.id} className={`p-3 rounded-xl text-center border transition-all ${
                    unlocked ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-gray-800/50 border-gray-700'
                  }`} title={a.desc}>
                    <div className={`flex justify-center mb-1 ${unlocked ? 'text-yellow-400' : 'text-gray-600'}`}>{a.icon}</div>
                    <p className={`text-[10px] font-semibold ${unlocked ? 'text-yellow-300' : 'text-gray-500'}`}>{a.label}</p>
                    {unlocked && <CheckCircle size={10} className="mx-auto mt-1 text-green-400" />}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">{unlockedCount}/{ACHIEVEMENTS.length} badges unlocked</p>
          </GlassCard>
        </div>

        <GlassCard title="Peer Comparison" icon={BarChart3} delay={7}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'CGPA', your: parseFloat(profileData?.cgpa) || 0, avg: 7.8, unit: '' },
              { label: 'Skills Count', your: (report?.currentSkills?.length || 0), avg: 6, unit: '' },
              { label: 'Readiness', your: finalScore, avg: 68, unit: '%' },
            ].map((m, i) => {
              const pct = m.avg > 0 ? Math.min(100, (m.your / m.avg) * 100) : 0;
              return (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">{m.label}</p>
                  <div className="flex items-end gap-3 mb-2">
                    <div><span className="text-2xl font-bold text-white">{m.your}{m.unit}</span><span className="text-xs text-gray-500 ml-1">You</span></div>
                    <div><span className="text-lg font-semibold text-gray-500">{m.avg}{m.unit}</span><span className="text-xs text-gray-500 ml-1">Avg</span></div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden flex">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <p className={`text-xs mt-1 ${pct >= 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {pct >= 100 ? 'Above average!' : pct >= 70 ? 'On track' : 'Room to grow'}
                  </p>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard title="Recommended Projects" icon={BookOpen} delay={8}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{(report?.recommendedProjects || []).map((p, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2"><span className="font-semibold text-gray-900 dark:text-white text-sm">{p.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.difficulty === "Beginner" ? "bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400" : p.difficulty === "Intermediate" ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400" : "bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400"}`}>{p.difficulty}</span>
              </div>
              <div className="text-xs text-gray-400 mb-2 font-mono">{p.techStack || "Various"}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{p.description}</p>
              <div className="text-xs text-blue-500 flex items-center gap-1"><Lightbulb size={12} /> {p.reason || "Portfolio builder"}</div>
            </motion.div>
          ))}</div>
        </GlassCard>

        <GlassCard title="30-Day Learning Roadmap" icon={Clock} delay={9}>
          <div ref={roadmapRef} className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-5">
            <span>Progress: {checkedCount}/{report?.roadmap?.length || 0}</span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 max-w-xs">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${(checkedCount / (report?.roadmap?.length || 1)) * 100}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{(report?.roadmap || []).map((item, i) => (
            <motion.div key={i} whileHover={{ y: -4 }}
              className={`p-4 rounded-xl border transition-all ${roadmapChecks[i] ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-start gap-2 mb-2">
                <button onClick={() => { const n = [...roadmapChecks]; n[i] = !n[i]; setRoadmapChecks(n); }}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${roadmapChecks[i] ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}>
                  {roadmapChecks[i] && <CheckSquare size={14} className="text-white" />}
                </button>
                <div>
                  <div className="text-xs font-bold text-blue-500 mb-1">{item.week}</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{item.goal}</div>
                  <div className="space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                    <p>📚 {item.learning}</p><p>🛠 {item.project}</p><p>⏱ {item.practice}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}</div>
        </GlassCard>

        <GlassCard title="Weekly Schedule" icon={Clock} delay={10}>
          <div ref={scheduleRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Hour Breakdown</h4>
              {(report?.plan || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">{item.activity}</span><span className="font-semibold text-gray-900 dark:text-white">{item.hours}h</span></div>
              ))}
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex">{(report?.plan || []).map((item, i) => (
                <div key={i} className={`h-full ${["bg-blue-500","bg-purple-500","bg-green-500","bg-orange-500"][i]}`} style={{ width: `${(item.hours / Math.max(...(report?.plan || []).map(p => p.hours))) * 100}%` }} />
              ))}</div>
              <p className="text-xs text-gray-400">Total: {report?.plan?.reduce((a, b) => a + (b.hours || 0), 0) || 0}h/week</p>
            </div>
            <div className="lg:col-span-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr>{Object.keys(report?.weeklySchedule || {}).map(day => <th key={day} className="p-2 text-left font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 text-xs">{day.slice(0, 3)}</th>)}</tr></thead>
                <tbody>{[0, 1].map(rowIdx => (<tr key={rowIdx}>{Object.entries(report?.weeklySchedule || {}).map(([day, slots]) => (
                  <td key={day} className="p-1.5 border-b border-gray-100 dark:border-gray-800 align-top">
                    {slots[rowIdx] ? <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-2 border-blue-500">
                      <div className="text-[10px] text-gray-400">{slots[rowIdx].time}</div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">{slots[rowIdx].activity}</div>
                      <div className="text-[10px] text-gray-400">{slots[rowIdx].duration}</div>
                    </div> : <div className="p-2 text-[10px] text-gray-300 dark:text-gray-600">—</div>}
                  </td>
                ))}</tr>))}</tbody>
              </table>
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Tips & Insights" icon={Lightbulb} delay={11}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{(report?.tips || []).map((tip, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }} className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 border border-blue-200 dark:border-blue-500/20">
              <div className="flex items-start gap-3"><Sparkles size={16} className="text-yellow-500 mt-0.5 shrink-0" /><span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span></div>
            </motion.div>
          ))}</div>
        </GlassCard>
      </div>
    ),
    interview: (
      <Suspense fallback={<div className="text-center py-12"><Loader2 className="animate-spin mx-auto mb-2 text-blue-400" size={32} /><p className="text-gray-400 text-sm">Loading interview simulator...</p></div>}>
        <InterviewSimulator career={profileData?.targetCareer} toast={toast} onComplete={() => unlockBadge('interview')} />
      </Suspense>
    ),
    resume: (
      <Suspense fallback={<div className="text-center py-12"><Loader2 className="animate-spin mx-auto mb-2 text-blue-400" size={32} /><p className="text-gray-400 text-sm">Loading resume analyzer...</p></div>}>
        <ResumeScorer career={profileData?.targetCareer} toast={toast} onComplete={() => unlockBadge('resume')} />
      </Suspense>
    ),
    'interview-bank': (
      <Suspense fallback={<div className="text-center py-12"><Loader2 className="animate-spin mx-auto mb-2 text-blue-400" size={32} /><p className="text-gray-400 text-sm">Loading interview bank...</p></div>}>
        <InterviewBank toast={toast} />
      </Suspense>
    ),
    jobs: (
      <Suspense fallback={<div className="text-center py-12"><Loader2 className="animate-spin mx-auto mb-2 text-blue-400" size={32} /><p className="text-gray-400 text-sm">Finding job matches...</p></div>}>
        <JobMatchFinder profile={profileData} toast={toast} />
      </Suspense>
    ),
  };

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Data Available</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Please submit your profile to generate a career plan.</p>
        <button onClick={() => onBack()} className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">← Back to Profile</button>
      </div>
    );
  }

  return (
    <div>
      <div className="breadcrumb mb-4"><span>Dashboard</span><ChevronRight size={12} /><span className="text-blue-500">{profileData?.name || "Report"}</span></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {profileData?.photo ? <img src={profileData.photo} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-blue-500/30" /> :
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold shadow-md text-white">{initials}</div>}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profileData?.name || "Student"}</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-semibold">Internship Track</span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 text-xs font-semibold">
                <Flame size={12} /> {Object.keys(badges).filter(k => badges[k]).length} badges
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🎯 {profileData?.targetCareer} <span className="mx-2">·</span> ⏱ {profileData?.hoursPerWeek}h/week
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onBack()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm">
            Back to Profile
          </button>
        </div>
      </div>

      <div id="report-body" className="space-y-6">
        {sectionContent[activeSection] || sectionContent.overview}
      </div>
    </div>
  );
};

export default Dashboard;
