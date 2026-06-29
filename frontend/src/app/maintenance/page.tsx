"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, Cog } from "lucide-react";

function MaintenanceContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "We are currently undergoing scheduled maintenance. Please check back shortly.";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-10 rounded-3xl bg-[#121212]/80 backdrop-blur-xl border border-white/5 flex flex-col items-center text-center relative z-10 shadow-2xl"
      >
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center opacity-20"
          >
            <Cog size={120} className="text-cyan-500" />
          </motion.div>
          
          <div className="w-24 h-24 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <ShieldAlert size={40} className="text-cyan-400" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight mb-4">
          System Maintenance
        </h1>
        
        <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8">
          {message}
        </p>

        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
          />
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-6">
          CareerHub Administration
        </p>
      </motion.div>
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <MaintenanceContent />
    </Suspense>
  );
}
