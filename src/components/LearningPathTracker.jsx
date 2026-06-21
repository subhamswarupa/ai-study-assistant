import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, Circle, ArrowRight, Trophy, Target } from 'lucide-react';
import { getLearningPath } from '../services/geminiService';

const PATH_KEY = 'ssos_learning_path';

const LearningPathTracker = ({ career, toast }) => {
  const [nodes, setNodes] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPath();
  }, []);

  const loadPath = async () => {
    setLoading(true);
    const saved = localStorage.getItem(PATH_KEY);

    if (saved) {
      try {
        const { nodes: n, completed: c } = JSON.parse(saved);
        setNodes(n);
        setCompleted(c || []);
        setLoading(false);
        return;
      } catch {}
    }

    const path = await getLearningPath(career);
    setNodes(path);
    localStorage.setItem(PATH_KEY, JSON.stringify({ nodes: path, completed: [] }));
    setLoading(false);
  };

  const toggleNode = (id) => {
    const newCompleted = completed.includes(id)
      ? completed.filter(c => c !== id)
      : [...completed, id];
    setCompleted(newCompleted);
    localStorage.setItem(PATH_KEY, JSON.stringify({ nodes, completed: newCompleted }));
  };

  const progress = nodes.length > 0 ? Math.round((completed.length / nodes.length) * 100) : 0;

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="animate-spin mx-auto mb-3 text-blue-400" size={24} />
        <p className="text-gray-400 text-sm">Building your learning path...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2"><Target size={16} className="text-blue-400" /> Learning Path</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{completed.length}/{nodes.length} completed</span>
          <div className="w-20 h-1.5 rounded-full bg-gray-700 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-700" />

        <div className="space-y-6">
          {nodes.map((node, i) => {
            const isCompleted = completed.includes(node.id);
            const isLocked = node.dependencies?.length > 0 && !node.dependencies.every(d => completed.includes(d));

            return (
              <motion.div key={node.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className={`relative flex items-start gap-4 ${isLocked && !isCompleted ? 'opacity-50' : ''}`}>
                <div className="relative z-10">
                  <button onClick={() => !isLocked && toggleNode(node.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted ? 'bg-green-500 border-green-500' :
                      isLocked ? 'bg-gray-800 border-gray-600 cursor-not-allowed' :
                      'bg-gray-800 border-blue-500 hover:bg-blue-500/20'
                    }`}>
                    {isCompleted ? <CheckCircle size={18} className="text-white" /> :
                     isLocked ? <Circle size={18} className="text-gray-500" /> :
                     <span className="text-sm font-bold text-blue-400">{i + 1}</span>}
                  </button>
                </div>

                <div className={`flex-1 p-4 rounded-xl border transition-all ${
                  isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-semibold text-sm ${isCompleted ? 'text-green-400' : 'text-white'}`}>{node.title}</h4>
                    <span className="text-xs text-gray-500">{node.estimatedWeeks} {node.estimatedWeeks === 1 ? 'week' : 'weeks'}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{node.description}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    node.type === 'skill' ? 'bg-blue-500/20 text-blue-400' :
                    node.type === 'project' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>{node.type}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {progress === 100 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-center">
          <Trophy size={24} className="mx-auto mb-2 text-yellow-400" />
          <p className="text-yellow-300 font-bold">All milestones complete! You are on track!</p>
        </motion.div>
      )}
    </div>
  );
};

export default LearningPathTracker;
