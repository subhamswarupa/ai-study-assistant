import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, Target, BookOpen, Clock, Award, ChevronDown, Star, Quote, GraduationCap, Code2, Link2, Mail, ArrowRight } from 'lucide-react';

const features = [
  { icon: BrainCircuit, title: "AI Career Analysis", desc: "Get your internship readiness score and personalized skill gap analysis" },
  { icon: Target, title: "Personalized Roadmap", desc: "Follow a 30-day plan tailored to your schedule and goals" },
  { icon: Clock, title: "Smart Study Planner", desc: "Optimize your time with AI-generated weekly schedules" },
];

const testimonials = [
  { name: "Priya Sharma", role: "Computer Science, Stanford", avatar: "PS", text: "Student Success OS helped me identify gaps I didn't know I had. Landed my dream internship at Google within 2 months!", rating: 5 },
  { name: "Alex Chen", role: "Information Systems, MIT", avatar: "AC", text: "The roadmap feature is incredible. It structured my entire semester and I finally feel prepared for interviews.", rating: 5 },
  { name: "Sarah Johnson", role: "Data Science, UC Berkeley", avatar: "SJ", text: "From skill gaps to project ideas, everything was personalized. The AI interview practice alone is worth it.", rating: 5 },
];

const LandingHero = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen grid-bg">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
          <Sparkles size={14} /> Powered by Gemini AI
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black text-center leading-tight mb-5 text-gray-900 dark:text-white">
          Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">AI-Powered</span><br />Career Coach
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 text-center max-w-2xl mx-auto mb-10">
          Get internship-ready with personalized learning roadmaps, skill gap analysis, interview practice, and an AI mentor that knows your goals.
        </motion.p>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onGetStarted}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-base shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            Get Started Free <ArrowRight size={18} />
          </button>
          <button className="px-8 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2">
            <GraduationCap size={18} /> Watch Demo
          </button>
        </motion.div>

        {/* Features */}
        <motion.div initial="hidden" animate="visible" transition={{ delay: 0.6, staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {features.map((f, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="p-6 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition">
                <f.icon size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
          {[
            { value: "10K+", label: "Students Helped" },
            { value: "92%", label: "Success Rate" },
            { value: "500+", label: "Paid Internships" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{s.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Loved by Students</h2>
            <p className="text-gray-500 dark:text-gray-400">Join thousands who transformed their career journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, si) => <Star key={si} size={16} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <Quote size={20} className="text-blue-400 mb-2 opacity-50" />
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Ready to launch your career?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Join thousands of students getting internship-ready with AI-powered guidance.</p>
          <button onClick={onGetStarted}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
            Get Started — It's Free
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <GraduationCap size={16} className="text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Student Success OS</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your AI-powered career coach for internship readiness.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "FAQ"] },
              { title: "Company", links: ["About", "Blog", "Careers"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l, li) => (
                    <li key={li}><a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 transition">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-400">© 2026 Student Success OS. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition"><Code2 size={18} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition"><Link2 size={18} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition"><Mail size={18} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingHero;
