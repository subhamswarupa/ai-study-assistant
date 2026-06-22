import React, { useEffect, useState } from 'react';
import { GraduationCap, Bell, BellDot, LogOut, Menu, X, Flame, Target, Mic, FileText, Briefcase, LayoutDashboard, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'interview', label: 'Interview Prep', icon: Mic },
  { id: 'resume', label: 'Resume Check', icon: FileText },
  { id: 'interview-bank', label: 'Interview Bank', icon: BookOpen },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
];

const Navbar = ({ user, activeSection, onNavigate, onLogout, dailyTip }) => {
  const [showTip, setShowTip] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ssos_notifications');
    if (saved) {
      try { setNotifications(JSON.parse(saved)); } catch {}
    } else {
      const defaults = [
        { id: 1, text: 'Your learning roadmap is ready! Start with Week 1.', time: 'Just now', read: false, icon: '🚀' },
        { id: 2, text: dailyTip?.tip || 'Complete your daily challenge to keep your streak!', time: '2 hours ago', read: false, icon: '💡' },
      ];
      setNotifications(defaults);
      localStorage.setItem('ssos_notifications', JSON.stringify(defaults));
    }
  }, []);

  useEffect(() => {
    if (dailyTip && notifications.length > 0) {
      const updated = [...notifications];
      updated[1] = { ...(updated[1] || {}), text: dailyTip.tip || updated[1]?.text || '' };
      setNotifications(updated);
      localStorage.setItem('ssos_notifications', JSON.stringify(updated));
    }
  }, [dailyTip]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('ssos_notifications', JSON.stringify(updated));
  };

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <AnimatePresence>
        {dailyTip && showTip && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b border-blue-500/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">{dailyTip.icon || '💡'}</span>
                <span className="text-gray-600 dark:text-gray-300">{dailyTip.tip}</span>
              </div>
              <button onClick={() => setShowTip(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0 ml-4">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a1929]/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                {mobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
              <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('overview'); }} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <GraduationCap size={18} className="text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-lg hidden sm:block">Student Success OS</span>
              </a>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => { onNavigate(item.id); setMobileMenu(false); }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeSection === item.id
                        ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}>
                    <Icon size={16} /> {item.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={() => setShowNotif(!showNotif)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition relative">
                  {unreadCount > 0 ? <BellDot size={19} /> : <Bell size={19} />}
                  {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />}
                </button>
                <AnimatePresence>
                  {showNotif && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-80 py-2 rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                      <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notifications</p>
                      {notifications.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">No notifications</p>
                      ) : (
                        notifications.map(n => (
                          <button key={n.id} onClick={() => markRead(n.id)}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${n.read ? 'opacity-60' : ''}`}>
                            <span className="text-lg">{n.icon || '💡'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 dark:text-gray-300">{n.text}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                            </div>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {initials}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">{user?.name || 'User'}</span>
              </div>

              <button onClick={onLogout} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {mobileMenu && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-800 py-2 space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => { onNavigate(item.id); setMobileMenu(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      activeSection === item.id ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    <Icon size={16} /> {item.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
