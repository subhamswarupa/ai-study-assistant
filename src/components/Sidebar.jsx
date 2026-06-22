import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Target, BookOpen, Clock, Mic, FileText, Briefcase, Library } from 'lucide-react';

const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'skills', label: 'Skills', icon: Target },
  { id: 'projects', label: 'Projects', icon: BookOpen },
  { id: 'roadmap', label: 'Roadmap', icon: Clock },
  { id: 'interview', label: 'Interview Simulator', icon: Mic },
  { id: 'resume', label: 'Resume Score', icon: FileText },
  { id: 'interview-bank', label: 'Interview Bank', icon: Library },
  { id: 'jobs', label: 'Job Matches', icon: Briefcase },
];

const Sidebar = ({ activeSection, onSectionChange, open, onClose }) => {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={onClose} />}
      <motion.aside
        initial={false}
        animate={{ width: open ? 240 : 0, opacity: open ? 1 : 0 }}
        className={`${open ? 'fixed lg:sticky' : 'hidden lg:block'} top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-white dark:bg-[#0a1929] border-r border-gray-200 dark:border-gray-800 overflow-y-auto shrink-0`}
        style={open ? {} : { width: 0 }}
      >
        <div className="p-4 space-y-1 pt-6" style={{ minWidth: 240 }}>
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id}
                onClick={() => { onSectionChange(s.id); onClose && onClose(); }}
                className={`sidebar-link w-full ${activeSection === s.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
