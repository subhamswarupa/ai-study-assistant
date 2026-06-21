import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Globe, ArrowRight, User } from 'lucide-react';

const LoginPage = ({ onLogin, onSignup, goToLanding }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (isSignup && !name) { setError('Please enter your name'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    if (isSignup) {
      const users = JSON.parse(localStorage.getItem('ssos_users') || '[]');
      if (users.find(u => u.email === email)) { setError('Email already registered'); return; }
      const newUser = { id: Date.now().toString(), name, email, password };
      users.push(newUser);
      localStorage.setItem('ssos_users', JSON.stringify(users));
      localStorage.setItem('ssos_session', JSON.stringify(newUser));
      onSignup(newUser);
    } else {
      const users = JSON.parse(localStorage.getItem('ssos_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) { setError('Invalid email or password'); return; }
      localStorage.setItem('ssos_session', JSON.stringify(user));
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <button onClick={goToLanding} className="inline-flex items-center gap-2 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap size={22} className="text-white" />
            </div>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isSignup ? 'Start your AI-powered career journey' : 'Continue your career journey'}
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700/50">
          <button
            onClick={() => {}}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition mb-6"
          >
            <Globe size={20} />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-11 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSignup ? 'Create Account' : 'Sign In'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsSignup(!isSignup); setError(''); }} className="text-blue-500 hover:text-blue-600 font-medium">
            {isSignup ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
