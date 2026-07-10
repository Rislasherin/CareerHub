'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  ArrowLeft, 
  Video, 
  Download, 
  FileText, 
  Star,
  CheckCircle2,
  ArrowRight,
  Pause,
  X,
  Bell,
  User
} from 'lucide-react';
import { apiClient } from '@/services/api/api.client';
import { API_ROUTES } from '@/constants/api.routes';
import { toast } from 'sonner';

const StarRating = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => {
  const labels = ["Poor", "Below Avg", "Average", "Good", "Excellent"];
  return (
    <div className="flex items-center justify-between w-full max-w-lg mt-4 mb-2 relative">
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-100 -z-10" />
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(star)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all bg-white border-2 ${
              value >= star 
                ? 'border-amber-400 text-amber-500 shadow-sm' 
                : 'border-slate-200 text-slate-300 hover:border-amber-200'
            }`}
          >
            <Star size={20} fill={value >= star ? "currentColor" : "none"} />
          </button>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{labels[star-1]}</span>
        </div>
      ))}
    </div>
  );
};

export default function InterviewFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    dsaScore: 0,
    dsaNotes: '',
    codingScore: 0,
    codingNotes: '',
    systemDesignScore: 0,
    systemDesignNotes: '',
    problemSolvingScore: 0,
    problemSolvingNotes: '',
    strengths: '',
    weaknesses: '',
    hrNotes: '',
    recommendedAction: '' as 'HIRE' | 'NEXT_ROUND' | 'HOLD' | 'REJECT' | ''
  });

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        // Fetch all and find (since we don't have a getById endpoint yet)
        const response: any = await apiClient.get(API_ROUTES.INTERVIEWER.DASHBOARD);
        const found = response.data.find((i: any) => i.id === params.id);
        if (found) {
          setInterview(found);
          // Pre-fill if already submitted
          if (found.feedback) {
            setFormData({
              dsaScore: found.feedback.dsaScore || 0,
              dsaNotes: found.feedback.dsaNotes || '',
              codingScore: found.feedback.codingScore || 0,
              codingNotes: found.feedback.codingNotes || '',
              systemDesignScore: found.feedback.systemDesignScore || 0,
              systemDesignNotes: found.feedback.systemDesignNotes || '',
              problemSolvingScore: found.feedback.problemSolvingScore || 0,
              problemSolvingNotes: found.feedback.problemSolvingNotes || '',
              strengths: found.feedback.strengths || '',
              weaknesses: found.feedback.weaknesses || '',
              hrNotes: found.feedback.hrNotes || '',
              recommendedAction: found.feedback.recommendedAction || ''
            });
          }
        }
      } catch (error) {
        toast.error("Failed to load interview details");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchInterview();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recommendedAction) {
      toast.error("Please select a recommendation before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const url = API_ROUTES.INTERVIEWER.SUBMIT_FEEDBACK.replace(':id', params.id as string);
      await apiClient.post(url, formData);
      toast.success('Feedback submitted successfully!');
      router.push('/interviewer/interviews');
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div></DashboardLayout>;
  if (!interview) return <DashboardLayout><div className="p-8 text-center">Interview not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto pb-24">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => router.push('/interviewer/interviews')} className="flex items-center gap-2 text-indigo-600 text-sm font-bold hover:text-indigo-700 transition-colors mb-4">
              <ArrowLeft size={16} /> Back to My Interviews
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Interview Detail & Feedback</h1>
            <p className="text-slate-500 font-medium mt-1">
              {interview.candidate.name} • {interview.type} Round • {new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full flex items-center gap-2">
              <Star size={14} /> Technical
            </span>
            <span className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-400 text-xs font-bold rounded-full flex items-center gap-2">
              <User size={14} /> HR Round
            </span>
            <span className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-400 text-xs font-bold rounded-full flex items-center gap-2">
              <CheckCircle2 size={14} /> Final Round
            </span>
          </div>
        </div>

        {/* Top Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          
          {/* Candidate Card */}
          <div className="xl:col-span-2 bg-[#1B2533] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10 border border-slate-800">
            {/* AI Match Badge */}
            <div className="absolute top-8 right-8 w-20 h-20 rounded-full border-[6px] border-indigo-500/30 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">AI Match</span>
              <span className="text-xl font-black text-white">91%</span>
            </div>

            <div className="flex gap-6 mb-8 relative z-10">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-600/30">
                {interview.candidate.name.split(' ').map((n: string) => n[0]).join('').substring(0,2)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black">{interview.candidate.name}</h2>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1">
                    <Star size={10} /> Today • {new Date(interview.scheduledAt).toLocaleTimeString('en-US', {hour: 'numeric', minute:'2-digit'})}
                  </span>
                  <span className="text-[10px] font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    {interview.type} Round {interview.roundNumber || 1}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-400 mt-1">
                  {interview.candidate.college || 'University'} • CSE • Batch {interview.candidate.graduationYear || '2025'} • CGPA {interview.candidate.cgpa || '8.7'}
                </p>
                
                {/* Mock Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1">React <CheckCircle2 size={12}/></span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1">Node.js <CheckCircle2 size={12}/></span>
                  <span className="px-3 py-1 rounded-full bg-slate-700 border border-slate-600 text-slate-300 text-xs font-bold">Python</span>
                  <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1">System Design <X size={12}/></span>
                  <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1">Docker <X size={12}/></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8 py-6 border-y border-slate-800">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">College</p>
                <p className="text-sm font-bold text-slate-200">{interview.candidate.college || 'NIT Trichy'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">CGPA</p>
                <p className="text-sm font-bold text-teal-400">{interview.candidate.cgpa || '8.7'} / 10</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Backlogs</p>
                <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">None <CheckCircle2 size={14}/></p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Duration</p>
                <p className="text-sm font-bold text-slate-200">{interview.durationMinutes} minutes</p>
              </div>
            </div>

            <div className="flex gap-4">
              <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                <Video size={18} /> Join Meeting
              </a>
              <a href={interview.candidate.resumeUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                <Download size={18} /> Download Resume
              </a>
              <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                <FileText size={18} /> Full Candidate Brief
              </button>
            </div>
          </div>

          {/* Right Sidebar Tools */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex-1">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                <Bell size={14} className="text-slate-400" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Suggested Questions</h3>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="p-4 text-sm font-bold text-slate-700">Q1. Explain time complexity of your last project</div>
                <div className="p-4 text-sm font-bold text-slate-700">Q2. Design a rate limiter system</div>
                <div className="p-4 text-sm font-bold text-slate-700">Q3. Difference between SQL and NoSQL — when to use each?</div>
                <div className="p-4 text-sm font-bold text-slate-700">Q4. Debug: given code has off-by-one error in binary search</div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-48 flex flex-col">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notes to self (not saved)</h3>
              </div>
              <textarea 
                className="w-full h-full p-4 text-sm text-slate-600 resize-none outline-none placeholder:text-slate-300"
                placeholder="Quick scratch notes during the interview — these are not saved or submitted..."
              />
            </div>
          </div>
        </div>

        {/* Main Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
          
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 text-amber-800">
            <div className="bg-amber-200/50 p-2 rounded-lg">
              <Star size={20} className="text-amber-600" />
            </div>
            <p className="text-sm font-bold">
              <span className="font-black">{interview.type} Round {interview.roundNumber || 1} Form</span> — Configured by HR. Focus: {['TECHNICAL', 'MACHINE_CODING'].includes(interview.type) ? 'DSA, Coding, System Design.' : 'Behavioral, Culture fit, Soft skills.'} Questions adapted for this round type.
            </p>
          </div>

          {['TECHNICAL', 'MACHINE_CODING'].includes(interview.type) && (
            <div>
              <h3 className="text-lg font-black text-slate-900 border-l-4 border-blue-600 pl-3 mb-6">Section A — Technical Knowledge</h3>
            
            <div className="space-y-6">
              {/* DSA */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-black text-slate-900 mb-1">1. Data Structures & Algorithms</h4>
                <p className="text-xs font-medium text-slate-500 mb-6">How well did the candidate handle DSA problems? Speed, correctness, time complexity?</p>
                <StarRating value={formData.dsaScore} onChange={(v) => setFormData({...formData, dsaScore: v})} />
                <textarea 
                  value={formData.dsaNotes}
                  onChange={(e) => setFormData({...formData, dsaNotes: e.target.value})}
                  className="w-full h-24 p-4 mt-6 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none resize-none"
                  placeholder="e.g. Solved 2/3. Used brute force initially, then optimised LRU Cache with O(1)..."
                />
              </div>

              {/* Coding */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-black text-slate-900 mb-1">2. Coding Ability (Live)</h4>
                <p className="text-xs font-medium text-slate-500 mb-6">Code quality, readability, edge cases, debugging — how was the live coding session?</p>
                <StarRating value={formData.codingScore} onChange={(v) => setFormData({...formData, codingScore: v})} />
                <textarea 
                  value={formData.codingNotes}
                  onChange={(e) => setFormData({...formData, codingNotes: e.target.value})}
                  className="w-full h-24 p-4 mt-6 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none resize-none"
                  placeholder="e.g. Clean code, good variable naming. Missed null checks. Fixed when prompted..."
                />
              </div>

              {/* System Design */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-black text-slate-900 mb-1">3. System Design</h4>
                <p className="text-xs font-medium text-slate-500 mb-6">Can the candidate design scalable systems? Databases, APIs, caching, load balancing?</p>
                <StarRating value={formData.systemDesignScore} onChange={(v) => setFormData({...formData, systemDesignScore: v})} />
                <textarea 
                  value={formData.systemDesignNotes}
                  onChange={(e) => setFormData({...formData, systemDesignNotes: e.target.value})}
                  className="w-full h-24 p-4 mt-6 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none resize-none"
                  placeholder="e.g. Could not explain horizontal scaling. Understood basic REST..."
                />
              </div>

              {/* Problem Solving */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-black text-slate-900 mb-1">4. Problem-Solving Approach</h4>
                <p className="text-xs font-medium text-slate-500 mb-6">Did the candidate think aloud, break down the problem, ask clarifying questions?</p>
                <StarRating value={formData.problemSolvingScore} onChange={(v) => setFormData({...formData, problemSolvingScore: v})} />
                <textarea 
                  value={formData.problemSolvingNotes}
                  onChange={(e) => setFormData({...formData, problemSolvingNotes: e.target.value})}
                  className="w-full h-24 p-4 mt-6 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none resize-none"
                  placeholder="e.g. Good structured thinking. Asked clarifying questions..."
                />
              </div>
            </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-black text-slate-900 border-l-4 border-blue-600 pl-3 mb-6">
              {['TECHNICAL', 'MACHINE_CODING'].includes(interview.type) ? 'Section B' : 'Section A'} — Notes
            </h3>
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-black text-slate-900 mb-4">5. Strengths Observed</h4>
                <textarea 
                  value={formData.strengths}
                  onChange={(e) => setFormData({...formData, strengths: e.target.value})}
                  className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none resize-none"
                  placeholder="e.g. Strong in React and Node. Excellent problem decomposition..."
                />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-black text-slate-900 mb-4">6. Areas of Concern</h4>
                <textarea 
                  value={formData.weaknesses}
                  onChange={(e) => setFormData({...formData, weaknesses: e.target.value})}
                  className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none resize-none"
                  placeholder="e.g. System design needs work. Not comfortable with Docker..."
                />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-black text-slate-900 mb-1">7. Notes for HR (private)</h4>
                <p className="text-xs font-medium text-slate-500 mb-4">This goes to HR only. Your feedback directly drives the hire decision.</p>
                <textarea 
                  value={formData.hrNotes}
                  onChange={(e) => setFormData({...formData, hrNotes: e.target.value})}
                  className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none resize-none"
                  placeholder="e.g. Strong profile overall. Recommend moving to Round 2..."
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-900 border-l-4 border-blue-600 pl-3 mb-6">
              {['TECHNICAL', 'MACHINE_CODING'].includes(interview.type) ? 'Section C' : 'Section B'} — Your Recommendation
            </h3>
            <p className="text-xs font-medium text-slate-500 mb-6">Your recommendation is seen by HR Admin only. HR will use this to make the final hiring decision.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer rounded-2xl border-2 p-6 transition-all flex items-start gap-4 ${formData.recommendedAction === 'HIRE' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-200'}`}>
                <input type="radio" name="recommendation" className="sr-only" checked={formData.recommendedAction === 'HIRE'} onChange={() => setFormData({...formData, recommendedAction: 'HIRE'})} />
                <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${formData.recommendedAction === 'HIRE' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 className={`font-black ${formData.recommendedAction === 'HIRE' ? 'text-emerald-700' : 'text-slate-900'}`}>Hire</h4>
                  <p className={`text-xs font-semibold mt-1 ${formData.recommendedAction === 'HIRE' ? 'text-emerald-600' : 'text-slate-500'}`}>Strong candidate, recommend immediately</p>
                </div>
              </label>

              <label className={`cursor-pointer rounded-2xl border-2 p-6 transition-all flex items-start gap-4 ${formData.recommendedAction === 'NEXT_ROUND' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
                <input type="radio" name="recommendation" className="sr-only" checked={formData.recommendedAction === 'NEXT_ROUND'} onChange={() => setFormData({...formData, recommendedAction: 'NEXT_ROUND'})} />
                <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${formData.recommendedAction === 'NEXT_ROUND' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <ArrowRight size={16} />
                </div>
                <div>
                  <h4 className={`font-black ${formData.recommendedAction === 'NEXT_ROUND' ? 'text-blue-700' : 'text-slate-900'}`}>Next Round</h4>
                  <p className={`text-xs font-semibold mt-1 ${formData.recommendedAction === 'NEXT_ROUND' ? 'text-blue-600' : 'text-slate-500'}`}>Good but needs further evaluation</p>
                </div>
              </label>

              <label className={`cursor-pointer rounded-2xl border-2 p-6 transition-all flex items-start gap-4 ${formData.recommendedAction === 'HOLD' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white hover:border-amber-200'}`}>
                <input type="radio" name="recommendation" className="sr-only" checked={formData.recommendedAction === 'HOLD'} onChange={() => setFormData({...formData, recommendedAction: 'HOLD'})} />
                <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${formData.recommendedAction === 'HOLD' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Pause size={16} />
                </div>
                <div>
                  <h4 className={`font-black ${formData.recommendedAction === 'HOLD' ? 'text-amber-700' : 'text-slate-900'}`}>On Hold</h4>
                  <p className={`text-xs font-semibold mt-1 ${formData.recommendedAction === 'HOLD' ? 'text-amber-600' : 'text-slate-500'}`}>Not sure — HR should decide</p>
                </div>
              </label>

              <label className={`cursor-pointer rounded-2xl border-2 p-6 transition-all flex items-start gap-4 ${formData.recommendedAction === 'REJECT' ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-white hover:border-rose-200'}`}>
                <input type="radio" name="recommendation" className="sr-only" checked={formData.recommendedAction === 'REJECT'} onChange={() => setFormData({...formData, recommendedAction: 'REJECT'})} />
                <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${formData.recommendedAction === 'REJECT' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <X size={16} />
                </div>
                <div>
                  <h4 className={`font-black ${formData.recommendedAction === 'REJECT' ? 'text-rose-700' : 'text-slate-900'}`}>No Hire</h4>
                  <p className={`text-xs font-semibold mt-1 ${formData.recommendedAction === 'REJECT' ? 'text-rose-600' : 'text-slate-500'}`}>Does not meet the bar for this role</p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => router.push('/interviewer/interviews')}
              className="px-8 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Final Feedback'}
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
