'use client';

import React from 'react';
import Link from 'next/link';
import {
  Check,
  X,
  ArrowRight,
  Users,
  Zap,
  BarChart3,
  Settings,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex justify-between items-center py-6 px-[10%] fixed top-0 w-full z-[1000] bg-white/80 backdrop-blur-md border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md" />
          <span>CareerHub</span>
        </Link>
        <div className="hidden md:flex gap-10 items-center">
          <a href="#features" className="text-[0.95rem] font-medium text-slate-500 hover:text-slate-900 transition-colors">Features</a>
          <a href="#solutions" className="text-[0.95rem] font-medium text-slate-500 hover:text-slate-900 transition-colors">Solutions</a>
          <a href="#pricing" className="text-[0.95rem] font-medium text-slate-500 hover:text-slate-900 transition-colors">Pricing</a>
          <a href="#about" className="text-[0.95rem] font-medium text-slate-500 hover:text-slate-900 transition-colors">About</a>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/login" className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">Login</Link>
          <Link href="/register-selection" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:translate-y-[-2px] hover:shadow-lg hover:shadow-indigo-500/25 transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-[10%] grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
        <div>
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            The smartest way to manage enterprise placements
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-[500px]">
            Streamline recruitment, track internal talent, and automate workflows across every department. Built for modern organizations.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register-selection" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-500/30 transition-all text-lg">Get Started</Link>
            <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all text-lg shadow-sm">
              View Statistics Portal
            </button>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 ${i !== 1 ? '-ml-3' : ''}`} />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-500">Trusted by 500+ top companies</span>
          </div>
        </div>
        <div className="relative rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
          <img src="/assets/hero-dashboard.png" alt="Dashboard Mockup" className="w-full" />
        </div>
      </section>

      {/* Logos */}
      <section className="py-10 px-[10%] border-y border-slate-50">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Trusted by industry teams</p>
        <div className="flex flex-wrap justify-center gap-12 lg:gap-20 items-center grayscale opacity-60 font-black text-xl text-slate-300">
          <span>ACME CORP</span>
          <span>VERTEX</span>
          <span>ORBIT</span>
          <span>CUBOID</span>
          <span>STACK</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-[10%] text-center">
        <span className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4 block">Features</span>
        <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">Everything you need to hire smarter</h2>
        <p className="text-slate-500 max-w-2xl mx-auto mb-16 text-lg">
          Powerful tools designed to help teams collaborate and make better hiring decisions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Settings, title: "Centralized Management", desc: "Keep all applicant info, communications, and documents in one secure, accessible location." },
            { icon: Zap, title: "AI-Powered Matching", desc: "Our proprietary algorithms help you identify top talent faster by analyzing skills and experience." },
            { icon: BarChart3, title: "Performance Analytics", desc: "Visual dashboards give you deep insights into your recruitment pipeline and team efficiency." },
            { icon: Users, title: "Automated Workflows", desc: "Reduce manual tasks with customizable stages for reviews, status updates, and auto-notifications." }
          ].map((feature, i) => (
            <div key={i} className="p-10 rounded-3xl bg-slate-50 hover:translate-y-[-8px] transition-all duration-300 text-left border border-transparent hover:border-indigo-100 group">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-6 shadow-md shadow-indigo-500/5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-[10%] bg-slate-50 rounded-[3rem] mx-4 lg:mx-10 text-center">
        <span className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4 block">Process</span>
        <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">How CareerHub works</h2>
        <p className="text-slate-500 max-w-2xl mx-auto mb-16 text-lg">A simple, transparent process for admins, managers, and candidates.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {[
            { num: 1, title: "Sign Up", desc: "Organizations create their exclusive portal and set up their structures." },
            { num: 2, title: "Manage", desc: "Admins configure roles, permissions, and hiring pipelines." },
            { num: 3, title: "Match", desc: "Candidates apply and are automatically matched with open roles." },
            { num: 4, title: "Onboard", desc: "Manage offer letters and reduce onboarding cycle times." }
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-lg shadow-indigo-500/30">
                {step.num}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <img src="/assets/how-it-works.png" alt="Team collaborating" className="w-full" />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-[10%] text-center">
        <span className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4 block">Pricing</span>
        <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">Simple, transparent pricing</h2>
        <p className="text-slate-500 max-w-2xl mx-auto mb-16 text-lg">Choose the plan that fits your organization's needs.</p>

        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8">
          {/* Basic Plan */}
          <div className="p-12 rounded-[2.5rem] border border-slate-200 w-full lg:w-[400px] text-left flex flex-col hover:border-indigo-200 transition-all">
            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-fit mb-6">Basic</span>
            <h3 className="text-2xl font-extrabold mb-4">Foundation</h3>
            <div className="text-4xl font-black mb-8 flex items-baseline gap-1">₹99K <span className="text-slate-400 text-lg font-medium">/year</span></div>
            <ul className="space-y-4 mb-10 flex-1 text-[0.95rem]">
              <li className="flex items-center gap-3"><Check size={18} className="text-emerald-500" /> Up to 150 students</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-emerald-500" /> 1 admin account</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-emerald-500" /> 2,000 AI credits/yr</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-emerald-500" /> Resume builder</li>
              <li className="flex items-center gap-3 font-bold text-slate-300 line-through"><X size={18} /> Mock interview bot</li>
              <li className="flex items-center gap-3 font-bold text-slate-300 line-through"><X size={18} /> Advanced Analytics</li>
            </ul>
            <Link href="/register-selection" className="w-full py-4 text-center rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all">Start Free Trial</Link>
          </div>

          {/* Pro Plan */}
          <div className="p-12 rounded-[2.5rem] border-2 border-indigo-600 w-full lg:w-[400px] text-left flex flex-col relative bg-white shadow-2xl shadow-indigo-500/10 scale-105 z-10">
            <div className="absolute top-[-14px] left-1/2 translate-x-[-50%] bg-indigo-600 text-white text-[0.7rem] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-4 border-white">✨ Most Popular</div>
            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit mb-6">Pro</span>
            <h3 className="text-2xl font-extrabold mb-4">Enterprise</h3>
            <div className="text-4xl font-black mb-8 flex items-baseline gap-1">₹2.4L <span className="text-slate-400 text-lg font-medium">/year</span></div>
            <ul className="space-y-4 mb-10 flex-1 text-[0.95rem]">
              <li className="flex items-center gap-3"><Check size={18} className="text-emerald-500" /> Unlimited students</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-emerald-500" /> 5 admin accounts</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-emerald-500" /> 10,000 AI credits/yr</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-emerald-500" /> Full AI Resume builder</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-emerald-500" /> Mock interview bot</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-emerald-500" /> Analytics dashboard</li>
              <li className="flex items-center gap-3 font-bold text-indigo-600"><Check size={18} /> Priority support</li>
            </ul>
            <Link href="/register-selection" className="w-full py-4 text-center rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/30 transition-all">Continue →</Link>
          </div>
        </div>

        <div className="mt-16 inline-flex items-center gap-4 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <span className="text-2xl">🎁</span>
          <p className="text-sm font-medium text-slate-600">
            <strong className="text-slate-900">14-day free trial</strong> on all plans — no credit card required. Full access from day one.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-24 px-[10%] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg" />
            <span>CareerHub</span>
          </Link>
          <p className="text-slate-400 max-w-[300px] leading-relaxed">Empowering organizations to build better teams through intelligent placement and tracking.</p>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-8 uppercase tracking-widest text-xs text-indigo-400">Platform</h4>
          <ul className="space-y-4 text-slate-400 font-medium">
            <li><a href="#" className="hover:text-white transition-colors">Solutions</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-8 uppercase tracking-widest text-xs text-indigo-400">Company</h4>
          <ul className="space-y-4 text-slate-400 font-medium">
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-8 uppercase tracking-widest text-xs text-indigo-400">Legal</h4>
          <ul className="space-y-4 text-slate-400 font-medium">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
          </ul>
        </div>
      </footer>
      <div className="bg-slate-950 py-10 px-[10%] flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">© 2026 CareerHub Inc. All rights reserved.</p>
        <div className="flex gap-8 text-slate-400">
          <Globe size={20} className="hover:text-white transition-colors cursor-pointer" />
          <Globe size={20} className="hover:text-white transition-colors cursor-pointer" />
          <Globe size={20} className="hover:text-white transition-colors cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
