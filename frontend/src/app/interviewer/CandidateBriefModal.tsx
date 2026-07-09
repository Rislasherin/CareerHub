'use client';
import React from 'react';
import { X, Eye, GraduationCap, AlertTriangle, BarChart3, FileBadge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CandidateBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: any;
}

export const CandidateBriefModal: React.FC<CandidateBriefModalProps> = ({ isOpen, onClose, interview }) => {
  if (!isOpen || !interview) return null;

  const studentSkillsArray = Object.values(interview.candidate.skills || {})
    .flat()
    .filter(Boolean)
    .map((s: any) => String(s).toLowerCase().trim());
  
  const jobSkills = interview.job?.requiredSkills || [];
  const matchedSkills = jobSkills.filter((js: string) => studentSkillsArray.includes(js.toLowerCase().trim()));
  const missingSkills = jobSkills.filter((js: string) => !studentSkillsArray.includes(js.toLowerCase().trim()));
  
  // Use real resume score or calculate based on skills if 0
  const computedScore = interview.candidate.resumeScore > 0 
      ? interview.candidate.resumeScore 
      : (jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 85);

  const mockAnalysis = {
    upcomingPlan: [
      { topic: "System Design", status: "primary", note: "Standard technical evaluation" },
      { topic: "Problem Solving", status: "primary", note: "DSA and algorithms" },
      { topic: "Behavioral", status: "primary", note: "Team fit and culture" },
    ]
  };

  const isPast = new Date(interview.scheduledAt) <= new Date();
  const needsFeedback = interview.status === 'SCHEDULED' && isPast;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-indigo-600"><Eye size={20} /></div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Candidate Brief — {interview.candidate.name}</h2>
                <p className="text-sm font-medium text-slate-500 mt-0.5">{interview.title} • {new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})} • For Interviewer Use Only</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Alert Banner */}
            <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl flex items-center gap-3 mb-6">
              <Eye size={16} className="text-sky-600" />
              <p className="text-sm font-bold text-sky-700">This brief is for your eyes only. Do not share this with the candidate.</p>
            </div>

            {/* Candidate Summary Block */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-inner">
                  {interview.candidate.name.split(' ').map((n: string) => n[0]).join('').substring(0,2)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{interview.candidate.name}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">{interview.candidate.college || 'University'} • {interview.candidate.branch || 'CSE'} • CGPA {interview.candidate.cgpa || 'N/A'} • Batch {interview.candidate.graduationYear || '2025'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">{interview.job?.title || 'Software Engineer'}</span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">{interview.candidate.degree || 'B.Tech'}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{computedScore}% AI Match</span>
                  </div>
                </div>
              </div>
              <div className="text-center p-3 border border-slate-200 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Match</p>
                <p className="text-3xl font-black text-blue-600">{computedScore}%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Left Column: Education & Experience */}
              <div className="space-y-6">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><GraduationCap size={14}/> Education & Experience</h4>
                
                <div className="space-y-5">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{interview.candidate.degree || 'B.Tech'} {interview.candidate.branch || 'CSE'} <span className="text-slate-400 font-medium">— {interview.candidate.college || 'University'}</span></h5>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Batch {interview.candidate.graduationYear || '2025'} • CGPA {interview.candidate.cgpa || 'N/A'}</p>
                  </div>
                  
                  {interview.candidate.experience?.map((exp: any, idx: number) => (
                    <div key={idx}>
                      <h5 className="text-sm font-bold text-slate-900">{exp.role} <span className="text-slate-400 font-medium">— {exp.company}</span></h5>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{exp.duration}</p>
                    </div>
                  ))}

                  {interview.candidate.projects?.map((proj: any, idx: number) => (
                    <div key={idx}>
                      <h5 className="text-sm font-bold text-slate-900">{proj.name}</h5>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{proj.techStack?.join(', ')}</p>
                    </div>
                  ))}
                  
                  {(!interview.candidate.experience?.length && !interview.candidate.projects?.length) && (
                     <p className="text-sm text-slate-500 italic">No additional experience or projects listed.</p>
                  )}
                </div>
              </div>

              {/* Right Column: AI Analysis */}
              <div className="space-y-6">
                
                {/* Upcoming Plan */}
                <div>
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4"><AlertTriangle size={14}/> Upcoming Assessment Plan</h4>
                   <div className="space-y-2">
                     {mockAnalysis.upcomingPlan.map((area, idx) => (
                       <div key={idx} className="flex justify-between items-center p-3 rounded-xl border bg-blue-50/50 border-blue-100 text-blue-700">
                         <div className="flex items-center gap-2 font-bold text-sm">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                           {area.topic}
                         </div>
                         <span className="text-xs font-semibold opacity-80">{area.note}</span>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Required Skills Match */}
                <div>
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4"><BarChart3 size={14}/> Job Skills Match</h4>
                   <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                      <div className="flex justify-between items-end mb-6">
                        <span className="text-sm font-bold text-slate-900">Overall Match</span>
                        <span className="text-2xl font-black text-blue-600">{computedScore}<span className="text-sm text-slate-400">/100</span></span>
                      </div>
                      
                      <div className="space-y-4">
                        {jobSkills.length > 0 ? (
                          <>
                            {matchedSkills.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-emerald-700 mb-2">Matched Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {matchedSkills.map((s: string) => (
                                    <span key={s} className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-md">
                                      ✓ {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {missingSkills.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-amber-700 mb-2 mt-4">Missing / Probe Further</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {missingSkills.map((s: string) => (
                                    <span key={s} className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-md">
                                      ? {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                           <p className="text-xs text-slate-500 italic">No specific skills required by this job.</p>
                        )}
                      </div>
                   </div>
                </div>

              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
            <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
              Close
            </button>
            {needsFeedback && (
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
                <FileBadge size={16} /> Open Feedback Form
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


