import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Building2, ExternalLink, Loader2, TrendingUp, CheckCircle, XCircle, MapPin, DollarSign, ChevronDown, ChevronUp, BookOpen, Play, Globe, Filter, SortAsc, Award, GraduationCap, Search, Bookmark, Sparkles, Star } from 'lucide-react';
import { getJobMatches, getInternships } from '../services/geminiService';

const SITE_COLORS = {
  linkedin: 'bg-[#0A66C2] hover:bg-[#004182]',
  naukri: 'bg-[#FF5722] hover:bg-[#E64A19]',
  internshala: 'bg-[#2E7D32] hover:bg-[#1B5E20]',
  indeed: 'bg-[#003D9E] hover:bg-[#002D7A]',
};

const JobMatchFinder = ({ profile, toast }) => {
  const [jobs, setJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('fulltime');
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('match');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [j, i] = await Promise.all([getJobMatches(profile), getInternships(profile)]);
    setJobs(j);
    setInternships(i);
    setLoading(false);
  };

  const filteredJobs = jobs.filter(j => {
    if (filter === 'all') return true;
    if (filter === 'high') return j.matchPercentage >= 70;
    if (filter === 'entry') return j.experience?.includes('0') || j.experience?.includes('1');
    return true;
  }).sort((a, b) => {
    if (sort === 'match') return b.matchPercentage - a.matchPercentage;
    return 0;
  });

  const readyCount = jobs.filter(j => j.matchPercentage >= 50).length;
  const topMissing = jobs.flatMap(j => j.missingSkills).reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const topSkillToLearn = Object.entries(topMissing).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="animate-spin mx-auto mb-4 text-blue-400" size={36} />
        <p className="text-gray-400">Finding best job matches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Briefcase size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Job Match Finder</h2>
        <p className="text-gray-400 text-sm">Real job matches tailored to your skills</p>
      </div>

      <div className="p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-center">
        <Award size={32} className="mx-auto mb-2 text-blue-400" />
        <p className="text-lg font-bold text-white">You are ready for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-2xl">{readyCount}</span> out of {jobs.length} jobs</p>
        <div className="w-full max-w-xs mx-auto h-2 rounded-full bg-gray-700 overflow-hidden mt-2">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${(readyCount / jobs.length) * 100}%` }} />
        </div>
        {topSkillToLearn !== 'N/A' && <p className="text-xs text-gray-400 mt-2">Top skill to unlock more jobs: <span className="text-blue-400 font-semibold">{topSkillToLearn}</span></p>}
      </div>

      <div className="flex gap-2 border-b border-gray-700 pb-3">
        {['fulltime', 'internship'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-gray-200'}`}>
            {t === 'fulltime' ? '💼 Full Time Jobs' : '🎓 Internships'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          {['all', 'high', 'entry'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-gray-300 bg-white/5'}`}>
              {f === 'all' ? 'All' : f === 'high' ? 'High Match' : 'Entry Level'}
            </button>
          ))}
        </div>
        <button onClick={() => setSort(sort === 'match' ? 'none' : 'match')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 bg-white/5 transition">
          <SortAsc size={12} /> Sort by Match
        </button>
      </div>

      {tab === 'fulltime' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job, i) => {
            const isExpanded = expanded === i;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    job.matchPercentage >= 70 ? 'bg-green-500/20 text-green-400' :
                    job.matchPercentage >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{job.matchPercentage}% Match</span>
                  <DollarSign size={14} className="text-gray-500" />
                </div>
                <h3 className="font-bold text-white mb-1">{job.title}</h3>
                <p className="text-xs text-gray-500 mb-1">⏱ {job.experience} experience</p>
                <p className="text-xs text-blue-400 mb-3">💰 INR {job.salaryINR} · USD {job.salaryUSD}</p>

                <p className="text-xs text-gray-500 mb-2">Skills:</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {job.skills?.map((s, j) => {
                    const has = job.studentSkills?.includes(s);
                    return (
                      <span key={j} className={`px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 ${
                        has ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {has ? <CheckCircle size={8} /> : <XCircle size={8} />} {s}
                      </span>
                    );
                  })}
                </div>

                <div className="w-full h-1.5 rounded-full bg-gray-700 overflow-hidden mb-3">
                  <div className={`h-full rounded-full transition-all ${job.matchPercentage >= 70 ? 'bg-green-500' : job.matchPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${job.matchPercentage}%` }} />
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <a href={job.links.linkedin} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] text-white font-medium ${SITE_COLORS.linkedin} transition`}>
                    LinkedIn ↗
                  </a>
                  <a href={job.links.naukri} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] text-white font-medium ${SITE_COLORS.naukri} transition`}>
                    Naukri ↗
                  </a>
                  <a href={job.links.internshala} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] text-white font-medium ${SITE_COLORS.internshala} transition`}>
                    Internshala ↗
                  </a>
                  <a href={job.links.indeed} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] text-white font-medium ${SITE_COLORS.indeed} transition`}>
                    Indeed ↗
                  </a>
                </div>

                <button onClick={() => setExpanded(isExpanded ? null : i)}
                  className="w-full flex items-center justify-center gap-1 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 bg-white/5 hover:bg-white/10 transition">
                  {isExpanded ? <>Hide Roadmap <ChevronUp size={14} /></> : <>Learning Roadmap <ChevronDown size={14} /></>}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-gray-500 mb-2">📚 What to learn:</p>
                      <div className="space-y-2 mb-3">
                        {job.learning?.map((l, k) => (
                          <div key={k} className="p-2 rounded-lg bg-white/5">
                            <p className="text-xs font-medium text-white">{l.skill}</p>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                              <span className="flex items-center gap-1"><Play size={10} className="text-red-400" />{l.youtube}</span>
                              <span className="flex items-center gap-1"><Globe size={10} className="text-blue-400" />{l.site}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">⏱ Estimated: <span className="text-blue-400 font-semibold">{job.estTime}</span></p>
                      <p className="text-xs text-gray-500">{job.whyMatch}</p>
                      <button className="w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium hover:shadow-lg transition flex items-center justify-center gap-1">
                        <BookOpen size={12} /> Start Learning
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {internships.map((job, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="p-5 rounded-xl bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 hover:border-green-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white text-sm">{job.title}</h3>
                <GraduationCap size={16} className="text-green-400" />
              </div>
              <p className="text-xs text-green-400 mb-1">💰 {job.stipendINR}</p>
              <p className="text-xs text-gray-500 mb-1">📅 {job.duration}</p>
              <p className="text-xs text-gray-500 mb-3">{job.type}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {job.skillsGained?.map((s, j) => (
                  <span key={j} className="px-2 py-0.5 rounded text-[10px] bg-green-500/15 text-green-400 border border-green-500/20">{s}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <a href={job.links.linkedin} target="_blank" rel="noopener noreferrer" className={`px-3 py-1.5 rounded-lg text-[10px] text-white font-medium ${SITE_COLORS.linkedin} transition`}>LinkedIn ↗</a>
                <a href={job.links.internshala} target="_blank" rel="noopener noreferrer" className={`px-3 py-1.5 rounded-lg text-[10px] text-white font-medium ${SITE_COLORS.internshala} transition`}>Internshala ↗</a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <button onClick={loadAll} className="w-full py-2.5 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition flex items-center justify-center gap-2">
        <Sparkles size={14} /> Refresh Matches
      </button>
    </div>
  );
};

export default JobMatchFinder;
