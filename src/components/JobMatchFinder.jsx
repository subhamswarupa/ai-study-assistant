import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Building2, ExternalLink, Loader2, TrendingUp, CheckCircle, XCircle, MapPin, DollarSign } from 'lucide-react';
import { getJobMatches } from '../services/geminiService';

const JobMatchFinder = ({ profile, toast }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    const res = await getJobMatches(profile);
    setJobs(res);
    setLoading(false);
  };

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
        <p className="text-gray-400 text-sm">AI-matched roles based on your skills and profile</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                job.matchPercentage >= 80 ? 'bg-green-500/20 text-green-400' :
                job.matchPercentage >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>{job.matchPercentage}% Match</span>
              <DollarSign size={14} className="text-gray-500" />
            </div>
            <h3 className="font-bold text-white mb-1">{job.title}</h3>
            <p className="text-sm text-gray-400 mb-2 flex items-center gap-1"><Building2 size={12} /> {job.company}</p>
            {job.salaryRange && <p className="text-xs text-blue-400 mb-3">💰 {job.salaryRange}</p>}
            <p className="text-xs text-gray-500 mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {job.requiredSkills?.map((s, j) => {
                const has = job.studentSkills?.includes(s);
                return (
                  <span key={j} className={`px-2 py-0.5 rounded text-xs border flex items-center gap-1 ${
                    has ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {has ? <CheckCircle size={10} /> : <XCircle size={10} />} {s}
                  </span>
                );
              })}
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-700 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${
                job.matchPercentage >= 80 ? 'bg-green-500' :
                job.matchPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`} style={{ width: `${job.matchPercentage}%` }} />
            </div>
          </motion.div>
        ))}
      </div>

      <button onClick={loadJobs} className="w-full py-2.5 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition">
        Refresh Matches
      </button>
    </div>
  );
};

export default JobMatchFinder;
