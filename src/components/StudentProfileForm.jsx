import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, GraduationCap, Code, Wrench, Clock, Camera, X, Code2, Link2, Building2, Globe } from 'lucide-react';

const fields = [
  { name: 'name', placeholder: 'Full Name', icon: User, type: 'text', colSpan: true },
  { name: 'email', placeholder: 'Email', icon: Globe, type: 'email', colSpan: false },
  { name: 'university', placeholder: 'University / College', icon: Building2, type: 'text', colSpan: false },
  { name: 'cgpa', placeholder: 'CGPA (e.g. 8.5)', icon: GraduationCap, type: 'number', colSpan: false },
  { name: 'skills', placeholder: 'Skills (comma separated)', icon: Code, type: 'text', colSpan: true },
  { name: 'targetCareer', placeholder: 'Target Career (e.g. Full-Stack Developer)', icon: Wrench, type: 'text', colSpan: true },
  { name: 'hoursPerWeek', placeholder: 'Hours Available / Week', icon: Clock, type: 'number', colSpan: false },
  { name: 'github', placeholder: 'GitHub Username (optional)', icon: Code2, type: 'text', colSpan: false },
  { name: 'linkedin', placeholder: 'LinkedIn URL (optional)', icon: Link2, type: 'text', colSpan: false },
];

const StudentProfileForm = ({ onFormSubmit }) => {
  const [formData, setFormData] = useState(
    Object.fromEntries(fields.map(f => [f.name, '']))
  );
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles size={28} className="text-white" />
        </motion.div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Complete Your Profile
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
          Our 5 AI agents will analyze your profile and create a personalized career roadmap.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); onFormSubmit({ ...formData, photo: photoPreview }); }}
        className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl"
      >
        {/* Photo Upload */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-400 transition ${photoPreview ? 'border-solid border-blue-400' : ''}`}
              onClick={() => fileInputRef.current?.click()}>
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <Camera size={24} className="text-gray-300 dark:text-gray-600" />
              )}
            </div>
            {photoPreview && (
              <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"><X size={11} /></button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ name, placeholder, icon: Icon, type, colSpan }) => (
            <div key={name} className={`relative ${colSpan ? 'sm:col-span-2' : ''}`}>
              <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={type}
                step={type === 'number' ? '0.1' : undefined}
                placeholder={placeholder}
                value={formData[name]}
                onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                className="w-full pl-9 pr-3.5 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                required={!['github', 'linkedin', 'email'].includes(name)}
              />
            </div>
          ))}
        </div>

        <button type="submit"
          className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
        >
          <Sparkles size={18} />
          Generate My Career Plan
        </button>
      </form>
    </motion.div>
  );
};

export default StudentProfileForm;
