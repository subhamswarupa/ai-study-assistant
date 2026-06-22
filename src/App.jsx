import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import StudentProfileForm from './components/StudentProfileForm';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Confetti from './components/Confetti';
import { ToastProvider, useToast } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { getAIReport, getDailyTip } from './services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Chatbot = lazy(() => import('./components/Chatbot'));
const LandingHero = lazy(() => import('./components/LandingHero'));

const PageSkeleton = () => (
  <div className="flex items-center justify-center py-32">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

function AppContent() {
  const toast = useToast();
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ssos_session')); } catch { return null; }
  });
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ssos_profile')); } catch { return null; }
  });
  const [report, setReport] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ssos_report')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [dailyTip, setDailyTip] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem('ssos_session');
    if (session) {
      try {
        const u = JSON.parse(session);
        setUser(u);
        setPage('form');
      } catch {}
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', true);
  }, []);

  useEffect(() => {
    if (report?.readinessScore >= 80) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [report]);

  useEffect(() => {
    if (user && profile) {
      getDailyTip(profile).then(tip => setDailyTip(tip));
    }
  }, [user, profile]);

  const handleLogin = (u) => {
    setUser(u);
    setPage('form');
    toast(`Welcome back, ${u.name}!`, 'success');
  };

  const handleSignup = (u) => {
    setUser(u);
    setPage('form');
    toast(`Account created! Welcome, ${u.name}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('ssos_session');
    localStorage.removeItem('ssos_profile');
    localStorage.removeItem('ssos_report');
    setUser(null);
    setProfile(null);
    setReport(null);
    setPage('landing');
    toast('Logged out successfully', 'info');
  };

  const handleFormSubmit = async (data) => {
    setError(null);
    setLoading(true);
    setPage('dashboard');
    try {
      const result = await getAIReport(data);
      if (result?.readinessScore !== undefined) {
        setProfile(data);
        setReport(result);
        try { localStorage.setItem('ssos_report', JSON.stringify(result)); localStorage.setItem('ssos_profile', JSON.stringify(data)); } catch {}
        toast('Career plan generated successfully!', 'success');
      } else {
        setError("Could not generate your career plan. Please try again.");
        setPage('form');
        toast('Failed to generate plan', 'error');
      }
    } catch (err) {
      setError(err.message || "Something went wrong during analysis.");
      setPage('form');
      toast('Analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardBack = (action, entry) => {
    setProfile(null);
    setReport(null);
    setError(null);
    setPage('form');
  };

  const handleNavNavigate = (section) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showNav = user && (page === 'dashboard' || page === 'form');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1929] text-gray-900 dark:text-white grid-bg">
      <Confetti active={showConfetti} />

      {showNav && (
        <Navbar
          user={user}
          activeSection={activeSection}
          onNavigate={handleNavNavigate}
          onLogout={handleLogout}
          dailyTip={dailyTip}
        />
      )}

      <div className="flex">
        {page === 'dashboard' && showNav && (
          <Sidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <main className={`flex-1 min-h-screen ${page === 'dashboard' ? 'p-4 sm:p-6' : ''}`}>
          <AnimatePresence mode="wait">
            {page === 'landing' && (
              <Suspense fallback={<PageSkeleton />}>
                <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LandingHero onGetStarted={() => setPage('login')} />
                </motion.div>
              </Suspense>
            )}

            {page === 'login' && (
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoginPage onLogin={handleLogin} onSignup={handleSignup} goToLanding={() => setPage('landing')} />
              </motion.div>
            )}

            {page === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={showNav ? '' : 'pt-10'}>
                <StudentProfileForm onFormSubmit={handleFormSubmit} />
              </motion.div>
            )}

            {page === 'dashboard' && loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white/80 mb-2">Building your success plan...</h2>
                <p className="text-gray-500 dark:text-white/40 max-w-md text-center text-sm">Our 5 AI agents are analyzing your profile, skills, and career goals</p>
                <div className="flex gap-2 mt-6">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}

            {page === 'dashboard' && error && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-20">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white/80 mb-2">Analysis Failed</h2>
                <p className="text-red-500 mb-4 max-w-md mx-auto">{error}</p>
                <button onClick={() => { setError(null); setPage('form'); }}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition">
                  Try Again
                </button>
              </motion.div>
            )}

            {page === 'dashboard' && !loading && !error && report && (
              <Suspense fallback={<PageSkeleton />}>
                <motion.div key="dashboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Dashboard profileData={profile} report={report} onBack={handleDashboardBack} user={user} activeSection={activeSection} />
                </motion.div>
              </Suspense>
            )}
          </AnimatePresence>
        </main>
      </div>

      {page === 'dashboard' && !loading && !error && report && (
        <Suspense fallback={null}>
          <Chatbot context={JSON.stringify(profile)} />
        </Suspense>
      )}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;
