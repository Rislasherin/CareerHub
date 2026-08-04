'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Users,
  Zap,
  BarChart3,
  Settings,
  Globe,
  Briefcase,
  GraduationCap,
  Building2,
  ChevronRight,
  Star,
  Sparkles,
  Calendar,
  BrainCircuit,
  FileText,
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const Logo = ({ white = false }: { white?: boolean }) => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30 overflow-hidden group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] group-hover:bg-transparent transition-all duration-300"></div>
      <Briefcase className="text-white z-10 w-5 h-5 relative right-[-2px] bottom-[-2px]" />
      <GraduationCap className="text-white/90 z-10 w-5 h-5 absolute top-1.5 left-1.5 -rotate-12" />
    </div>
    <span className={`text-2xl font-black tracking-tight transition-colors duration-300 ${white ? 'text-white' : 'text-slate-900'}`}>
      CareerHub
    </span>
  </div>
);

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const floatAnimation: any = {
  y: [-8, 8, -8],
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
};

const floatAnimationAlt: any = {
  y: [8, -8, 8],
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
};

const roles = [
  { id: 'recruiter', label: 'Recruiters' },
  { id: 'student', label: 'Students' },
  { id: 'college', label: 'Colleges' },
];

export default function LandingPage() {
  const [activeRole, setActiveRole] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveRole((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden selection:bg-violet-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/15 blur-[150px]"
        ></motion.div>
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/12 blur-[150px]"
        ></motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-between items-center py-4 px-[5%] lg:px-[10%] fixed top-0 w-full z-[1000] bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm"
      >
        <Link href="/">
          <Logo />
        </Link>
        <div className="hidden md:flex gap-8 items-center bg-white/50 px-6 py-2 rounded-full border border-slate-200/50 shadow-inner">
          <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors">Features</a>
          <a href="#process" className="text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors">Process</a>
          <a href="#pricing" className="text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors">Pricing</a>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-bold text-slate-900 hover:text-violet-600 transition-colors hidden sm:block">Log in</Link>
          <Link href="/register-selection" className="group relative px-6 py-2.5 rounded-full font-bold text-white overflow-hidden bg-slate-900 hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10 flex items-center gap-2">Get Started <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-[5%] lg:px-[10%] z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50/80 border border-violet-100 text-violet-700 font-semibold text-xs mb-6 backdrop-blur-sm shadow-sm">
              <Sparkles size={14} className="text-violet-600" />
              <span>✨ AI-powered Placement Management Platform</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-extrabold leading-[1.12] mb-6 tracking-tight text-slate-900 relative z-10">
              The smartest way to <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 relative inline-block">
                manage placements
                {/* Subtle gradient glow behind the text */}
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 blur-2xl opacity-20 -z-10" aria-hidden="true"></span>
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-slate-500 leading-relaxed mb-10 max-w-[540px]">
              Connect students, colleges, and companies in one AI-powered platform. Automate recruitment workflows, discover top talent, and make smarter placement decisions faster.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 w-full sm:w-auto relative">
              <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full animate-pulse z-0 hidden sm:block w-[180px]"></div>
              <Link href="/register-selection" className="relative z-10 group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-3.5 rounded-full font-bold hover:shadow-[0_8px_30px_-10px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 transition-all duration-300 text-[1.05rem]">
                Get Started <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} 
                className="relative z-10 w-full sm:w-auto flex items-center justify-center bg-white/40 backdrop-blur-md text-slate-900 px-8 py-3.5 rounded-full font-bold border border-slate-200 hover:bg-white hover:text-violet-600 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5 transition-all duration-300 text-[1.05rem]"
              >
                Explore Platform
              </button>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex">
                {[
                  "https://i.pravatar.cc/100?img=1",
                  "https://i.pravatar.cc/100?img=2",
                  "https://i.pravatar.cc/100?img=3",
                  "https://i.pravatar.cc/100?img=4"
                ].map((src, i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm ${i !== 0 ? '-ml-3' : ''}`}>
                    <img src={src} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-500" />)}
                </div>
                <span className="text-sm font-semibold text-slate-500">Trusted by 10,000+ students, recruiters & placement teams</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-10 lg:mt-0 flex flex-col items-center"
          >
            {/* Role Tabs */}
            <div className="text-center mb-6 relative z-10 w-full flex flex-col items-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">One platform connecting</p>
              <div className="inline-flex bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-slate-200 shadow-sm relative">
                {roles.map((role, idx) => (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(idx)}
                    className={`px-4 md:px-5 py-1.5 rounded-full text-xs font-bold transition-all relative z-10 ${activeRole === idx ? 'text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {role.label}
                  </button>
                ))}
                {/* Animated active tab background */}
                <div className="absolute top-1.5 bottom-1.5 w-[calc(33.33%-4px)] bg-slate-900 rounded-full shadow-md transition-all duration-500 ease-out z-0" style={{ transform: `translateX(calc(${activeRole * 100}% + ${activeRole * 6}px))`, left: '6px' }}></div>
              </div>
            </div>

            <div className="relative w-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-blue-500/20 rounded-[2.5rem] blur-3xl opacity-40"></div>
              
              {/* Dashboard UI Frame */}
              <div className="relative rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200/80 bg-slate-50 z-10 transform transition-transform hover:scale-[1.02] duration-500 h-[380px] md:h-[420px]">
                {/* Toolbar */}
                <div className="absolute top-0 w-full h-12 bg-slate-900/5 flex items-center px-4 gap-2 border-b border-slate-200/50 z-20">
                  <div className="w-3 h-3 rounded-full bg-slate-300 shadow-inner"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300 shadow-inner"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300 shadow-inner"></div>
                </div>
                
                <div className="w-full h-full pt-12 flex overflow-hidden">
                  <AnimatePresence mode="wait">
                    
                    {/* 1. Recruiter Dashboard */}
                    {activeRole === 0 && (
                      <motion.div key="recruiter" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="w-full h-full flex flex-col gap-4 p-5 md:p-6 bg-slate-50 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                        <div className="flex justify-between items-center relative z-10">
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-lg">Welcome, Admin!</h3>
                            <p className="text-[10px] text-slate-500 font-medium mt-1">Here's your recruitment overview.</p>
                          </div>
                        </div>
                        
                        <div className="bg-white/75 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 flex gap-4 items-center hover:border-violet-200 transition-colors relative z-10">
                          <div className="w-12 h-12 rounded-full bg-violet-50 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                            <img src="https://i.pravatar.cc/100?img=8" alt="Candidate" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-bold text-slate-900 text-sm">Top Candidate Match</h4>
                              <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 flex items-center gap-1"><BrainCircuit size={10} /> 98% Match</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">Senior Frontend Developer</p>
                            <div className="flex gap-2">
                              <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">React 98%</span>
                              <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">Node.js 94%</span>
                              <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">MongoDB 91%</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                          <div className="bg-white/75 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 hover:border-violet-200 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Interviews</span>
                              <Calendar size={14} className="text-slate-400" />
                            </div>
                            <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                               <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-[10px] font-bold text-violet-600">2:30</div>
                               <div>
                                 <p className="text-[11px] font-bold text-slate-900">Technical Round</p>
                                 <p className="text-[9px] text-slate-500">Sarah Jenkins</p>
                               </div>
                            </div>
                          </div>
                          
                          <div className="bg-white/75 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-center hover:border-violet-200 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Avg Score</span>
                              <Target size={14} className="text-violet-500" />
                            </div>
                            <div className="flex items-end gap-1 mt-1">
                              <span className="text-3xl font-black text-slate-900">92</span><span className="text-xs font-bold text-slate-400 mb-1">/100</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                               <div className="bg-violet-500 w-[92%] h-full rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 bg-white/75 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col min-h-[90px] hover:border-violet-200 transition-colors relative z-10">
                           <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hiring Pipeline</span>
                          </div>
                          <div className="flex-1 flex items-end gap-2">
                            {[30, 50, 45, 80, 60, 90, 75, 100].map((h, i) => (
                              <div key={i} className="flex-1 bg-slate-100 rounded-t-sm relative h-full flex items-end group">
                                <div className="w-full bg-violet-500 rounded-t-sm group-hover:bg-violet-400 transition-colors" style={{ height: `${h}%` }}></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 2. Student Dashboard */}
                    {activeRole === 1 && (
                      <motion.div key="student" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="w-full h-full flex flex-col gap-4 p-5 md:p-6 bg-slate-50 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                        <div className="flex justify-between items-center relative z-10">
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-lg">Welcome, Alex!</h3>
                            <p className="text-[10px] text-slate-500 font-medium mt-1">Your placement journey.</p>
                          </div>
                          <div className="w-8 h-8 rounded-full border-2 border-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=11" alt="Profile"/></div>
                        </div>
                        
                        <div className="bg-white/75 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 hover:border-violet-200 transition-colors relative z-10">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Profile Strength</span>
                            <span className="text-[10px] font-bold text-emerald-600">92%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                             <div className="bg-emerald-500 w-[92%] h-full rounded-full"></div>
                          </div>
                          <p className="text-[9px] text-slate-500 flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-500"/> Resume parsed successfully</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                          <div className="bg-white/75 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 hover:border-violet-200 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Matches</span>
                               <Sparkles size={14} className="text-violet-500" />
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="bg-slate-50 px-2 py-1.5 rounded-md text-[9px] font-bold text-slate-700 border border-slate-200/60">Frontend Developer</div>
                              <div className="bg-slate-50 px-2 py-1.5 rounded-md text-[9px] font-bold text-slate-700 border border-slate-200/60">MERN Stack Engineer</div>
                            </div>
                          </div>
                          
                          <div className="bg-white/75 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-center hover:border-violet-200 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Applications</span>
                              <Briefcase size={14} className="text-slate-400" />
                            </div>
                            <div className="flex items-end gap-1 mt-1">
                              <span className="text-3xl font-black text-slate-900">14</span>
                            </div>
                            <p className="text-[9px] text-violet-600 font-bold mt-2 flex items-center gap-1"><Zap size={10}/> 3 In Review</p>
                          </div>
                        </div>

                        <div className="flex-1 bg-white/75 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col min-h-[80px] hover:border-violet-200 transition-colors justify-center relative z-10">
                           <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Upcoming Interviews</span>
                          </div>
                          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                             <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-600">TMRW</div>
                             <div>
                               <p className="text-[11px] font-bold text-slate-900">TechCorp Inc.</p>
                               <p className="text-[9px] text-slate-500">Technical Round - 2:00 PM</p>
                             </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 3. College Dashboard */}
                    {activeRole === 2 && (
                      <motion.div key="college" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="w-full h-full flex flex-col gap-4 p-5 md:p-6 bg-slate-50 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                        <div className="flex justify-between items-center relative z-10">
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-lg">Stanford University</h3>
                            <p className="text-[10px] text-slate-500 font-medium mt-1">Placement Cell Overview.</p>
                          </div>
                          <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold">SU</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                          <div className="bg-white/75 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 hover:border-violet-200 transition-colors flex flex-col">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Reg. Students</span>
                              <GraduationCap size={14} className="text-slate-400" />
                            </div>
                            <span className="text-3xl font-black text-slate-900 mt-auto">850</span>
                          </div>
                          
                          <div className="bg-white/75 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 hover:border-violet-200 transition-colors flex flex-col">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Placed Students</span>
                              <Target size={14} className="text-emerald-500" />
                            </div>
                            <span className="text-3xl font-black text-slate-900 mt-auto">620</span>
                          </div>
                        </div>

                        <div className="bg-white/75 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 hover:border-violet-200 transition-colors flex items-center justify-between relative z-10">
                          <div>
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Companies Participated</span>
                             <span className="text-2xl font-black text-slate-900">45</span>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                            <Building2 size={20} className="text-slate-600" />
                          </div>
                        </div>

                        <div className="flex-1 bg-white/75 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col min-h-[90px] hover:border-violet-200 transition-colors justify-center relative z-10">
                           <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Placement Rate</span>
                            <span className="text-[10px] font-bold text-emerald-600">73%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
                             <div className="bg-emerald-500 w-[73%] h-full rounded-full"></div>
                          </div>
                          <p className="text-[9px] text-slate-500 text-right">+5% from last year</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Floating UI Cards */}
              <AnimatePresence mode="wait">
                {activeRole === 0 && (
                  <motion.div key="cards-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 pointer-events-none">
                    <motion.div animate={floatAnimationAlt} className="hidden md:flex absolute -right-8 top-12 bg-white/75 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-2xl p-3 items-center gap-3 z-30 pointer-events-auto">
                      <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center border border-violet-100">
                        <BrainCircuit size={16} className="text-violet-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">96% AI Match Score</p>
                        <p className="text-[9px] font-medium text-slate-500">Perfect fit found</p>
                      </div>
                    </motion.div>
                    <motion.div animate={floatAnimation} className="hidden md:flex absolute -left-10 bottom-32 bg-white/75 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-2xl p-3 items-center gap-3 z-30 pointer-events-auto">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                        <Users size={16} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">+250 New Applicants</p>
                        <p className="text-[9px] font-medium text-slate-500">In the last 24 hours</p>
                      </div>
                    </motion.div>
                    <motion.div animate={floatAnimationAlt} className="hidden md:flex absolute right-6 -bottom-6 bg-white/75 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-2xl p-3 items-center gap-3 z-30 pointer-events-auto">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">✓ Interview Scheduled</p>
                        <p className="text-[9px] font-medium text-slate-500">Tomorrow at 2:00 PM</p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {activeRole === 1 && (
                  <motion.div key="cards-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 pointer-events-none">
                    <motion.div animate={floatAnimationAlt} className="hidden md:flex absolute -right-8 top-12 bg-white/75 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-2xl p-3 items-center gap-3 z-30 pointer-events-auto">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <Check size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Profile Strength: 92%</p>
                        <p className="text-[9px] font-medium text-slate-500">All details completed</p>
                      </div>
                    </motion.div>
                    <motion.div animate={floatAnimation} className="hidden md:flex absolute -left-10 bottom-32 bg-white/75 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-2xl p-3 items-center gap-3 z-30 pointer-events-auto">
                      <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center border border-violet-100">
                        <Sparkles size={16} className="text-violet-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">AI Recommended Roles</p>
                        <p className="text-[9px] font-medium text-slate-500">3 new matches found</p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {activeRole === 2 && (
                  <motion.div key="cards-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 pointer-events-none">
                    <motion.div animate={floatAnimationAlt} className="hidden md:flex absolute -right-8 top-12 bg-white/75 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-2xl p-3 items-center gap-3 z-30 pointer-events-auto">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                        <GraduationCap size={16} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Students Registered</p>
                        <p className="text-[9px] font-medium text-slate-500">850 active profiles</p>
                      </div>
                    </motion.div>
                    <motion.div animate={floatAnimation} className="hidden md:flex absolute -left-10 bottom-32 bg-white/75 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-2xl p-3 items-center gap-3 z-30 pointer-events-auto">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <Target size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Placed Students: 620</p>
                        <p className="text-[9px] font-medium text-slate-500">73% placement rate</p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Metrics Section */}
      <section className="py-16 relative z-10 border-y border-slate-200/50 bg-slate-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-[5%] lg:px-[10%]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200/50">
            <div className="text-center px-4">
              <h4 className="text-4xl font-black text-slate-900 mb-2">50K+</h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Students Managed</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl font-black text-violet-600 mb-2">98%</h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Matching Accuracy</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl font-black text-slate-900 mb-2">10K+</h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Applications Processed</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl font-black text-emerald-500 mb-2">70%</h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Faster Hiring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution Section */}
      <section className="py-32 px-[5%] lg:px-[10%] relative z-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight text-slate-900">Why switch to CareerHub?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg lg:text-xl">Leave behind the outdated methods and embrace the future of intelligent hiring.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Problems */}
            <div className="bg-slate-50 p-10 lg:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
               <div className="absolute top-0 right-0 w-40 h-40 bg-slate-100 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
               <h3 className="text-2xl font-bold mb-10 text-slate-900 flex items-center gap-3 relative z-10"><AlertCircle className="text-slate-400" /> The Old Way</h3>
               <ul className="space-y-8 relative z-10">
                 <li className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 border border-slate-200"><X size={20} className="text-slate-400" /></div>
                   <div><strong className="text-slate-900 block mb-1 text-lg">Too many applications</strong><span className="text-slate-500 text-sm leading-relaxed">Drowning in irrelevant resumes that don't match the job requirements.</span></div>
                 </li>
                 <li className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 border border-slate-200"><X size={20} className="text-slate-400" /></div>
                   <div><strong className="text-slate-900 block mb-1 text-lg">Manual candidate screening</strong><span className="text-slate-500 text-sm leading-relaxed">Wasting countless hours reviewing profiles one by one.</span></div>
                 </li>
                 <li className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 border border-slate-200"><X size={20} className="text-slate-400" /></div>
                   <div><strong className="text-slate-900 block mb-1 text-lg">Slow hiring process</strong><span className="text-slate-500 text-sm leading-relaxed">Losing top talent to competitors because of a sluggish pipeline.</span></div>
                 </li>
               </ul>
            </div>
            
            {/* Solutions */}
            <div className="bg-slate-900 p-10 lg:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:shadow-violet-500/10 transition-all">
               <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
               <h3 className="text-2xl font-bold mb-10 text-white flex items-center gap-3 relative z-10"><Sparkles className="text-violet-400" /> The CareerHub Way</h3>
               <ul className="space-y-8 relative z-10">
                 <li className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center shrink-0 mt-0.5"><Check size={20} className="text-violet-400" /></div>
                   <div><strong className="text-white block mb-1 text-lg">Automated workflows</strong><span className="text-slate-400 text-sm leading-relaxed">Streamline everything from application to final offer seamlessly.</span></div>
                 </li>
                 <li className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center shrink-0 mt-0.5"><Check size={20} className="text-violet-400" /></div>
                   <div><strong className="text-white block mb-1 text-lg">Smart candidate evaluation</strong><span className="text-slate-400 text-sm leading-relaxed">AI instantly highlights the best matches for your specific roles.</span></div>
                 </li>
                 <li className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center shrink-0 mt-0.5"><Check size={20} className="text-violet-400" /></div>
                   <div><strong className="text-white block mb-1 text-lg">Faster recruitment decisions</strong><span className="text-slate-400 text-sm leading-relaxed">Close top candidates in days, not weeks, with actionable insights.</span></div>
                 </li>
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Product Workflow Section */}
      <section id="process" className="py-32 px-[5%] lg:px-[10%] relative z-10 border-t border-slate-200/50 bg-slate-50 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-50 to-transparent blur-3xl rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
             <span className="inline-block py-1 px-3 rounded-full bg-slate-200/50 text-slate-600 font-bold uppercase tracking-widest text-xs mb-4">Workflow</span>
             <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight text-slate-900">Seamless End-to-End Process</h2>
             <p className="text-slate-500 max-w-2xl mx-auto text-lg">From the first application to the final handshake, we've automated the busywork.</p>
          </div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-12 md:gap-4 px-4">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[48px] left-[5%] w-[90%] h-1 bg-slate-200 z-0 rounded-full"></div>
            
            {[
              { icon: FileText, title: "Student Applies", color: "text-slate-600", bg: "bg-white", border: "border-slate-200", shadow: "shadow-sm" },
              { icon: BrainCircuit, title: "AI Profile Analysis", color: "text-violet-600", bg: "bg-white", border: "border-violet-200", shadow: "shadow-violet-500/10" },
              { icon: Target, title: "Candidate Evaluation", color: "text-slate-600", bg: "bg-white", border: "border-slate-200", shadow: "shadow-sm" },
              { icon: Calendar, title: "Interview Scheduling", color: "text-slate-600", bg: "bg-white", border: "border-slate-200", shadow: "shadow-sm" },
              { icon: CheckCircle2, title: "Successful Placement", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", shadow: "shadow-sm" }
            ].map((step, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                key={i} 
                className="relative z-10 flex flex-col items-center group w-full md:w-40"
              >
                <div className={`w-24 h-24 rounded-[2rem] ${step.bg} border-2 ${step.border} flex items-center justify-center mb-6 ${step.shadow} group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-300 relative`}>
                   <step.icon className={step.color} size={36} />
                </div>
                <h4 className="font-bold text-slate-900 text-[15px] text-center">{step.title}</h4>
                {i !== 4 && <ArrowRight className="md:hidden text-slate-300 mt-8" size={24} />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-[5%] lg:px-[10%] relative z-10 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <span className="inline-block py-1 px-3 rounded-full bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-xs mb-4">Features</span>
          <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight text-slate-900">Everything you need to hire smarter</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg lg:text-xl">
            Powerful tools designed specifically for educational institutions to help teams collaborate and make better placement decisions.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Settings, title: "Centralized Management", desc: "Keep all student info, communications, and documents in one secure, accessible location.", color: "text-slate-700", bg: "bg-slate-100" },
            { icon: Zap, title: "AI-Powered Matching", desc: "Our proprietary algorithms help you identify top talent faster by analyzing skills and experience.", color: "text-violet-600", bg: "bg-violet-50" },
            { icon: BarChart3, title: "Performance Analytics", desc: "Visual dashboards give you deep insights into your placement pipeline and student success rates.", color: "text-slate-700", bg: "bg-slate-100" },
            { icon: Users, title: "Automated Workflows", desc: "Reduce manual tasks with customizable stages for reviews, status updates, and auto-notifications.", color: "text-slate-700", bg: "bg-slate-100" }
          ].map((feature, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              key={i}
              className="p-8 rounded-[2rem] bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 text-left group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={28} className={feature.color} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-[5%] lg:px-[10%] text-center relative z-10 bg-slate-50 border-t border-slate-200/50">
        <span className="inline-block py-1 px-3 rounded-full bg-slate-200/50 text-slate-600 font-bold uppercase tracking-widest text-xs mb-4">Pricing</span>
        <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight text-slate-900">Simple, transparent pricing</h2>
        <p className="text-slate-500 max-w-2xl mx-auto mb-16 text-lg">Choose the perfect plan that scales with your institution's needs.</p>

        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <div className="p-10 rounded-[2.5rem] border border-slate-200 bg-white w-full lg:w-[450px] text-left flex flex-col hover:border-slate-300 hover:shadow-xl transition-all duration-300">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full w-fit mb-6">Basic</span>
            <h3 className="text-3xl font-black mb-2 text-slate-900">Foundation</h3>
            <p className="text-slate-500 text-sm mb-6">Perfect for small colleges just getting started with digitized placements.</p>
            <div className="text-5xl font-black mb-8 flex items-baseline gap-1 text-slate-900">₹99K <span className="text-slate-400 text-lg font-medium">/year</span></div>
            <ul className="space-y-4 mb-10 flex-1 text-slate-700 font-medium">
              <li className="flex items-start gap-3"><Check size={20} className="text-emerald-500 shrink-0 mt-0.5" /> Up to 150 students</li>
              <li className="flex items-start gap-3"><Check size={20} className="text-emerald-500 shrink-0 mt-0.5" /> 1 admin account</li>
              <li className="flex items-start gap-3"><Check size={20} className="text-emerald-500 shrink-0 mt-0.5" /> 2,000 AI credits/yr</li>
              <li className="flex items-start gap-3"><Check size={20} className="text-emerald-500 shrink-0 mt-0.5" /> Basic Resume builder</li>
              <li className="flex items-start gap-3 font-medium text-slate-400"><X size={20} className="shrink-0 mt-0.5" /> Mock interview bot</li>
              <li className="flex items-start gap-3 font-medium text-slate-400"><X size={20} className="shrink-0 mt-0.5" /> Advanced Analytics</li>
            </ul>
            <Link href="/register-selection" className="w-full py-4 text-center rounded-2xl font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">Start Free Trial</Link>
          </div>

          {/* Pro Plan */}
          <div className="p-10 rounded-[2.5rem] border-2 border-violet-600 bg-white w-full lg:w-[450px] text-left flex flex-col relative shadow-[0_30px_60px_-15px_rgba(124,58,237,0.15)] lg:scale-105 z-10">
            <div className="absolute top-[-16px] left-1/2 translate-x-[-50%] bg-slate-900 text-white text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full border-4 border-white shadow-sm flex items-center gap-1">
              <Star size={14} className="fill-white" /> Most Popular
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full w-fit mb-6">Pro</span>
            <h3 className="text-3xl font-black mb-2 text-slate-900">Enterprise</h3>
            <p className="text-slate-500 text-sm mb-6">For large universities looking to fully automate their placement cells.</p>
            <div className="text-5xl font-black mb-8 flex items-baseline gap-1 text-slate-900">₹2.4L <span className="text-slate-400 text-lg font-medium">/year</span></div>
            <ul className="space-y-4 mb-10 flex-1 text-slate-700 font-medium">
              <li className="flex items-start gap-3"><Check size={20} className="text-violet-600 shrink-0 mt-0.5" /> <span className="font-bold">Unlimited students</span></li>
              <li className="flex items-start gap-3"><Check size={20} className="text-emerald-500 shrink-0 mt-0.5" /> 5 admin accounts</li>
              <li className="flex items-start gap-3"><Check size={20} className="text-emerald-500 shrink-0 mt-0.5" /> 10,000 AI credits/yr</li>
              <li className="flex items-start gap-3"><Check size={20} className="text-emerald-500 shrink-0 mt-0.5" /> Full AI Resume builder</li>
              <li className="flex items-start gap-3"><Check size={20} className="text-emerald-500 shrink-0 mt-0.5" /> Mock interview bot</li>
              <li className="flex items-start gap-3"><Check size={20} className="text-emerald-500 shrink-0 mt-0.5" /> Custom Analytics dashboard</li>
              <li className="flex items-start gap-3"><Check size={20} className="text-violet-600 shrink-0 mt-0.5" /> <span className="font-bold">24/7 Priority support</span></li>
            </ul>
            <Link href="/register-selection" className="w-full py-4 text-center rounded-2xl font-bold bg-slate-900 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">Get Started Now</Link>
          </div>
        </div>

        <div className="mt-20 inline-flex items-center gap-4 px-8 py-5 bg-white border border-slate-200/60 shadow-sm rounded-full">
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-xl">🎁</div>
          <p className="text-slate-600 font-medium">
            <strong className="text-slate-900">14-day free trial</strong> on all plans. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-24 px-[5%] lg:px-[10%] relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <Logo white />
            </div>
            <p className="text-slate-400 max-w-[320px] leading-relaxed mb-8 text-sm">Empowering educational institutions to build better placement outcomes through intelligent tracking and AI matching.</p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-violet-600 transition-colors cursor-pointer text-slate-300 hover:text-white">
                <Globe size={18} />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-violet-600 transition-colors cursor-pointer text-slate-300 hover:text-white">
                <Globe size={18} />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-500">Platform</h4>
            <ul className="space-y-3 text-slate-300 text-sm font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Solutions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-500">Company</h4>
            <ul className="space-y-3 text-slate-300 text-sm font-medium">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-500">Legal</h4>
            <ul className="space-y-3 text-slate-300 text-sm font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
      </footer>
      <div className="bg-[#020617] py-6 px-[5%] lg:px-[10%] flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 relative z-10">
        <p className="text-slate-500 text-xs font-medium tracking-wide">© {new Date().getFullYear()} CareerHub Inc. All rights reserved.</p>
        <p className="text-slate-500 text-xs font-medium flex items-center gap-1">
          Designed with <span className="text-red-500">♥</span> for the future of work
        </p>
      </div>
    </div>
  );
}
