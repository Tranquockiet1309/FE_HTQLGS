import React from 'react';
import { motion } from 'framer-motion';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-400/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px] animate-pulse-slow delay-700"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black italic tracking-tighter text-sky-500 mb-2">QuocKiet</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Premium Laundry Service</p>
        </div>

        <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/40 dark:border-slate-800/60 transition-all">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">{title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          </div>
          
          {children}
        </div>

        <p className="text-center mt-8 text-xs text-slate-400 font-medium">
          &copy; 2026 QuocKiet Laundry. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};
