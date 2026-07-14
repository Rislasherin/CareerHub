'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
   ChevronLeft, Download, Plus, Mail, Calendar, X, MapPin, 
   Link as LinkIcon, Code2, Award, Trophy, Cloud,
   Check, Eye, Maximize2, MessageSquare, FileText, Phone
} from 'lucide-react';
import Link from 'next/link';
import { getCandidateProfile } from '@/services/hr/job.service';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/services/api/api.client';
import { API_ROUTES } from '@/constants/api.routes';
import { toast } from 'sonner';
import { Button } from '@/components/shared/Button';
import { ApiResponse } from '@/types/api';
import { useFormValidation } from '@/hooks/useFormValidation';

export default function CandidateProfilePage() {
   const params = useParams();
   const id = params.id as string;
   const router = useRouter();
   // Using any to accommodate the extended DTO fields
   const [Profile, setProfile] = useState<any | null>(null);
   const [loading, setLoading] = useState(true);

   // Interview Scheduling State
   const [showInterviewModal, setShowInterviewModal] = useState(false);
   const [interviewers, setInterviewers] = useState<any[]>([]);
   const [activeTab, setActiveTab] = useState('Overview');
   const [updating, setUpdating] = useState(false);
   const [interviewForm, setInterviewForm] = useState({
      interviewerId: '',
      title: '',
      type: 'TECHNICAL',
      roundNumber: 1,
      scheduledAt: '',
      durationMinutes: 60,
      meetingLink: ''
   });

   useEffect(() => {
      const fetchProfile = async () => {
         try {
            const data = await getCandidateProfile(id);
            setProfile(data)
         } catch (error) {
            console.log("Failed to fetch candidate profile:", error)
         } finally {
            setLoading(false)
         }
      
      };
      
      const fetchInterviewers = async () => {
         try {
            const response = await apiClient.get(API_ROUTES.HR.INTERVIEWERS) as ApiResponse<any[]>;
            if (response.success) {
               const data = response.data as any;
               setInterviewers(data.interviewers || (Array.isArray(data) ? data : []));
            }
         } catch (err) {
            console.error(err);
         }
      };

      if (id) {
         fetchProfile();
         fetchInterviewers();
      }
   }, [id])

   const validateInterviewForm = (): Record<string, string> => {
      const errs: Record<string, string> = {};
      if (!interviewForm.title.trim()) errs.title = 'Title is required';
      if (!interviewForm.interviewerId) errs.interviewerId = 'Interviewer is required';
      if (!interviewForm.scheduledAt) errs.scheduledAt = 'Date & Time is required';
      const duration = Number(interviewForm.durationMinutes);
      if (isNaN(duration) || duration < 15) errs.durationMinutes = 'Must be at least 15 mins';
      return errs;
   };

   const { errors: currentErrors, getCaptureProps, handleSubmit: handleFormSubmit, resetValidation } = useFormValidation(
      interviewForm,
      validateInterviewForm
   );

   const handleScheduleSubmit = handleFormSubmit(async () => {
      setUpdating(true);
      try {
         // Note: Scheduling requires an applicationId. Since this page might not have it contextually, we pass a dummy or inform the user.
         const payload = {
            applicationId: id, // Fallback
            ...interviewForm,
            roundNumber: Number(interviewForm.roundNumber),
            durationMinutes: Number(interviewForm.durationMinutes)
         };
         
         const response = await apiClient.post(API_ROUTES.HR.INTERVIEWS, payload) as ApiResponse<any>;
         if (response.success) {
            toast.success('Interview scheduled successfully');
            setShowInterviewModal(false);
         }
      } catch (err: any) {
         toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Please schedule interviews directly from the Job Pipeline board to attach them to an application.');
      } finally {
         setUpdating(false);
      }
   });

   if (loading) {
      return (
         <DashboardLayout>
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
         </DashboardLayout>
      );
   }

   if (!Profile) {
      return (
         <DashboardLayout>
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
               <h2 className="text-xl font-bold text-slate-400">Candidate not found</h2>
            </div>
         </DashboardLayout>
      );
   }

   return (
      <DashboardLayout>
         <div className="max-w-[1400px] mx-auto w-full space-y-6 pb-12">

            <Link href="/hr/candidates" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest w-fit mb-4">
               <ChevronLeft size={16} /> Back to Candidate Pipeline
            </Link>

            {/* Profile Banner */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden relative">
               <div className="h-32 bg-[#1a1c29] w-full"></div>

               <div className="px-8 pb-8 relative flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="-mt-12 w-28 h-28 bg-white p-1.5 rounded-3xl shadow-sm z-10 shrink-0 mx-auto md:mx-0">
                     <div className="w-full h-full bg-indigo-500 rounded-[1.25rem] flex items-center justify-center text-white text-4xl font-black shadow-inner uppercase">
                        {Profile.firstName?.[0] || ""}{Profile.lastName?.[0] || ""}
                     </div>
                  </div>

                  {/* Text Content & Header Actions */}
                  <div className="flex-1 mt-2 flex flex-col justify-between">
                     
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4">
                        <div>
                           <h1 className="text-3xl font-black text-slate-900">{Profile.firstName} {Profile.lastName}</h1>
                           <p className="text-sm font-medium text-slate-500 mt-1.5">
                              {Profile.collegeName || 'Unknown College'} • {Profile.degree || 'Degree'} {Profile.branch && Profile.branch !== Profile.degree ? Profile.branch : ''} • Class of {Profile.graduationYear || 'N/A'}
                           </p>
                           
                           <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 mt-3">
                              <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {Profile.email || 'N/A'}</span>
                              <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {Profile.phone || 'N/A'}</span>
                              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {Profile.preferences?.location || 'Not Specified'}</span>
                              {Profile.portfolioUrls?.linkedin && (
                                 <a href={Profile.portfolioUrls.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline cursor-pointer">
                                    <LinkIcon size={14} /> LinkedIn
                                 </a>
                              )}
                           </div>

                           <div className="flex flex-wrap gap-2 mt-4">
                              {Profile.skills?.slice(0, 7).map((skill: string) => (
                                 <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl border border-indigo-100">
                                    {skill}
                                 </span>
                              ))}
                           </div>
                        </div>

                        {/* Top Badges */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                           {Profile.matchScore ? (
                              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 shadow-sm border border-purple-200">
                                 ✨ {Profile.matchScore}% AI Match
                              </span>
                           ) : null}
                        </div>
                     </div>

                     <hr className="border-slate-100 my-6" />

                     {/* Action Buttons */}
                     <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                        <button onClick={() => setShowInterviewModal(true)} className="whitespace-nowrap px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm">
                           <Calendar size={14} /> Schedule Interview
                        </button>
                        <button className="whitespace-nowrap px-4 py-2.5 bg-white text-slate-600 border border-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                           <Mail size={14} /> Send Email
                        </button>
                        {Profile.resumeUrl && (
                           <a href={Profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap px-4 py-2.5 bg-white text-slate-600 border border-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                              <Download size={14} /> Download Resume
                           </a>
                        )}
                        <button className="whitespace-nowrap px-4 py-2.5 bg-white text-slate-600 border border-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                           <Plus size={14} /> Add Note
                        </button>
                        <div className="flex-1"></div>
                        <button className="whitespace-nowrap px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-rose-100 transition-colors">
                           <X size={14} /> Reject
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex gap-1 overflow-x-auto">
               {['Overview', 'Resume'].map((tab) => (
                  <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-6 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                        activeTab === tab 
                           ? 'bg-indigo-600 text-white shadow-sm' 
                           : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                     }`}
                  >
                     {tab}
                  </button>
               ))}
            </div>

            {/* ============================== */}
            {/* 1. OVERVIEW TAB */}
            {/* ============================== */}
            {activeTab === 'Overview' && (
               <div className="space-y-6">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-indigo-600">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CGPA</p>
                  <div className="flex items-end gap-2">
                     <h3 className="text-3xl font-black text-indigo-600 leading-none">{Profile.cgpa || "N/A"}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium">{Profile.collegeName || 'University'}</p>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resume Score</p>
                  <div className="flex items-center gap-3">
                     <h3 className="text-3xl font-black text-emerald-600 leading-none">{Profile.resumeScore || "N/A"}</h3>
                     {Profile.resumeScore && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-md">
                           {Profile.resumeScore >= 80 ? 'Strong' : 'Average'}
                        </span>
                     )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium">System Evaluation</p>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-amber-500">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Availability</p>
                  <h3 className="text-xl font-black text-amber-600 leading-none mt-1">{Profile.preferences?.noticePeriod || "Immediate"}</h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Selected Preference</p>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-purple-500">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expected CTC</p>
                  <h3 className="text-xl font-black text-purple-600 leading-none mt-1">{Profile.preferences?.expectedCtc || "Negotiable"}</h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Selected Preference</p>
               </div>
            </div>



            {/* Top Grid: Skills, Prefs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               
               {/* Technical Skills */}
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Technical Skills</h3>
                  <div className="space-y-4">
                     {Profile.skills?.length ? Profile.skills.slice(0, 6).map((skill: string, index: number) => {
                        const percent = Math.max(65, 95 - (index * 5));
                        return (
                           <div key={skill}>
                              <div className="flex justify-between items-center mb-2">
                                 <span className="text-xs font-bold text-slate-700">{skill}</span>
                                 <span className="text-xs font-black text-indigo-500">{percent}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-indigo-50 rounded-full overflow-hidden">
                                 <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }}></div>
                              </div>
                           </div>
                        )
                     }) : <p className="text-sm text-slate-400 font-medium">No skills listed</p>}
                  </div>
               </div>

               {/* Candidate Preferences */}
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Candidate Preferences</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-xs text-slate-500 font-medium">Preferred Role</span>
                        <span className="text-xs font-bold text-slate-800">{Profile.preferences?.preferredRole || 'Not specified'}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-xs text-slate-500 font-medium">Work Mode</span>
                        <span className="text-xs font-bold text-slate-800">{Profile.preferences?.workMode || 'Not specified'}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-xs text-slate-500 font-medium">Location</span>
                        <span className="text-xs font-bold text-slate-800">{Profile.preferences?.location || 'Not specified'}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-xs text-slate-500 font-medium">Expected CTC</span>
                        <span className="text-xs font-bold text-slate-800">{Profile.preferences?.expectedCtc || 'Not specified'}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-xs text-slate-500 font-medium">Notice Period</span>
                        <span className="text-xs font-bold text-slate-800">{Profile.preferences?.noticePeriod || 'Not specified'}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-xs text-slate-500 font-medium">Job Type</span>
                        <span className="text-xs font-bold text-slate-800">{Profile.preferences?.jobType || 'Not specified'}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-xs text-slate-500 font-medium">Start Date</span>
                        <span className="text-xs font-bold text-slate-800">{Profile.preferences?.startDate || 'Not specified'}</span>
                     </div>
                  </div>
               </div>

            </div>

            {/* Bottom Grid: Education, Projects, Soft Skills & Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* Education & Experience */}
               <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Education & Experience</h3>
                  
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                     
                     {/* Always show Education */}
                     <div className="relative pl-6">
                        <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white shadow-sm border border-slate-200"></div>
                        <div>
                           <h4 className="text-sm font-bold text-slate-900">{Profile.degree} {Profile.branch && `- ${Profile.branch}`}</h4>
                           <p className="text-xs text-slate-500 font-medium mb-2">{Profile.collegeName} · {Profile.graduationYear}</p>
                           {Profile.cgpa && (
                              <ul className="text-xs text-slate-500 space-y-1 pl-4 list-disc marker:text-slate-300">
                                 <li>CGPA: {Profile.cgpa}</li>
                              </ul>
                           )}
                        </div>
                     </div>

                     {/* Experience from data */}
                     {Profile.experience?.map((exp: any, i: number) => {
                        const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-blue-500'];
                        const colorClass = colors[i % colors.length];
                        return (
                           <div key={i} className="relative pl-6">
                              <div className={`absolute left-0 top-1 w-3 h-3 rounded-full ${colorClass} ring-4 ring-white shadow-sm border border-slate-200`}></div>
                              <div>
                                 <h4 className="text-sm font-bold text-slate-900">{exp.role} – {exp.company}</h4>
                                 <p className="text-xs text-slate-500 font-medium mb-2">{exp.location || 'Location'} · {exp.duration}</p>
                                 <ul className="text-xs text-slate-500 space-y-1 pl-4 list-disc marker:text-slate-300">
                                    <li>{exp.summary}</li>
                                 </ul>
                              </div>
                           </div>
                        )
                     })}

                  </div>
               </div>

               {/* Projects, Soft Skills, Achievements */}
               <div className="space-y-6">
                  
                  {/* Featured Projects */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Featured Projects</h3>
                     <div className="space-y-4">
                        {Profile.projects?.length ? Profile.projects.map((proj: any, i: number) => (
                           <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                              <div className="flex justify-between items-start mb-1">
                                 <h4 className="text-xs font-bold text-slate-900">{proj.name}</h4>
                                 {proj.github && (
                                    <a href={proj.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-indigo-600">
                                       <Code2 size={12}/> GitHub
                                    </a>
                                 )}
                              </div>
                              <p className="text-[10px] text-indigo-600 font-bold mb-2">{proj.techStack?.join(' · ') || 'Various Tech'}</p>
                              <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-3">{proj.description}</p>
                           </div>
                        )) : <p className="text-xs text-slate-400">No projects added.</p>}
                     </div>
                  </div>

                  {/* Soft Skills & Languages */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Soft Skills & Languages</h3>
                     <div className="flex flex-wrap gap-2 mb-6">
                        {Profile.softSkills?.length ? Profile.softSkills.map((skill: string) => (
                           <span key={skill} className="px-3 py-1.5 bg-indigo-50/50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100/50">{skill}</span>
                        )) : <span className="text-xs text-slate-400">No soft skills added.</span>}
                     </div>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Languages</h3>
                     <div className="flex flex-wrap items-center gap-4 text-xs">
                        {Profile.spokenLanguages?.length ? Profile.spokenLanguages.map((lang: any) => (
                           <span key={lang.language} className="font-bold text-slate-800">{lang.language} <span className="text-slate-400 font-medium">{lang.proficiency}</span></span>
                        )) : <span className="text-xs text-slate-400">Not specified</span>}
                     </div>
                  </div>

                  {/* Achievements & Certifications (Moved to bottom right) */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Achievements & Certs</h3>
                     <div className="space-y-4">
                        {Profile.achievements?.length ? Profile.achievements.map((ach: any, i: number) => {
                           // Pick an icon based on type
                           const getIconData = (type: string) => {
                              switch(type) {
                                 case 'award': return { icon: Trophy, bg: 'bg-orange-50 text-orange-500' };
                                 case 'certification': return { icon: Cloud, bg: 'bg-blue-50 text-blue-500' };
                                 case 'coding': return { icon: Code2, bg: 'bg-emerald-50 text-emerald-500' };
                                 default: return { icon: Award, bg: 'bg-purple-50 text-purple-500' };
                              }
                           };
                           const iconData = getIconData(ach.type || 'other');
                           const Icon = iconData.icon;

                           return (
                              <div key={i} className="flex gap-3">
                                 <div className={`w-10 h-10 rounded-xl ${iconData.bg} flex items-center justify-center shrink-0`}>
                                    <Icon size={18} />
                                 </div>
                                 <div>
                                    <h4 className="text-xs font-bold text-slate-900">{ach.title}</h4>
                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{ach.subtitle}</p>
                                 </div>
                              </div>
                           )
                        }) : <p className="text-xs text-slate-400">No achievements added.</p>}
                     </div>
                  </div>

               </div>
            </div>
            </div>
            )}

            {/* ============================== */}
            {/* 2. RESUME TAB */}
            {/* ============================== */}
            {activeTab === 'Resume' && (
               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[800px]">
                  {/* Header */}
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                     <div>
                        <h3 className="text-sm font-bold text-slate-900">{Profile.firstName}_{Profile.lastName}_Resume.pdf</h3>
                        <p className="text-[10px] font-medium text-slate-500 mt-1">Uploaded Today • ATS Score: {Profile.resumeScore || 'N/A'}/100</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <a href={Profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm">
                           <Download size={14} /> Download PDF
                        </a>
                     </div>
                  </div>

                  {/* PDF Viewer / Fallback */}
                  <div className="flex-1 bg-slate-100/50 p-8 flex items-center justify-center overflow-hidden">
                     {Profile.resumeUrl ? (
                        <iframe 
                           src={`https://docs.google.com/gview?url=${encodeURIComponent(Profile.resumeUrl)}&embedded=true`} 
                           className="w-full h-full max-w-4xl rounded-xl shadow-lg border border-slate-200 bg-white"
                           title="Resume PDF"
                        />
                     ) : (
                        <div className="text-center">
                           <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                           <p className="text-sm font-bold text-slate-500">No Resume Uploaded</p>
                        </div>
                     )}
                  </div>
               </div>
            )}


         </div>

         {/* Schedule Interview Modal */}
         <AnimatePresence>
            {showInterviewModal && (
               <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                  <motion.div 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                     onClick={() => setShowInterviewModal(false)}
                  />
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                     className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-10"
                  >
                     <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                           <h2 className="text-lg font-semibold text-slate-800">Schedule Interview</h2>
                           <p className="text-sm text-slate-500">For {Profile.firstName} {Profile.lastName}</p>
                        </div>
                        <button onClick={() => setShowInterviewModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                           <X className="w-5 h-5" />
                        </button>
                     </div>

                     <form {...getCaptureProps()} onSubmit={(e) => { e.preventDefault(); handleScheduleSubmit(e); }} className="p-6 space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Interview Title</label>
                           <input 
                              type="text" required placeholder="e.g., Round 1: Technical Discussion"
                              name="title"
                              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                              value={interviewForm.title} onChange={e => setInterviewForm({...interviewForm, title: e.target.value})}
                           />
                           {currentErrors.title && <p className="text-rose-500 text-xs mt-1">{currentErrors.title}</p>}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Round Number</label>
                              <input 
                                 type="number" min="1" required
                                 className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                 value={interviewForm.roundNumber} onChange={e => setInterviewForm({...interviewForm, roundNumber: Number(e.target.value)})}
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Interview Type</label>
                              <select 
                                 required
                                 className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                 value={interviewForm.type} onChange={e => setInterviewForm({...interviewForm, type: e.target.value})}
                              >
                                 <option value="APTITUDE">Aptitude Test</option>
                                 <option value="CODING">Coding Challenge</option>
                                 <option value="TECHNICAL">Technical Panel Interview</option>
                                 <option value="HR">HR Panel Interview</option>
                                 <option value="GROUP_DISCUSSION">Group Discussion (GD)</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Assign Interviewer</label>
                              <select 
                                 name="interviewerId"
                                 required
                                 className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                 value={interviewForm.interviewerId} onChange={e => setInterviewForm({...interviewForm, interviewerId: e.target.value})}
                              >
                                 <option value="" disabled>Select...</option>
                                 {interviewers.map(inv => (
                                    <option key={inv.id} value={inv.id}>{inv.name || inv.firstName + ' ' + inv.lastName} ({inv.email})</option>
                                 ))}
                              </select>
                              {currentErrors.interviewerId && <p className="text-rose-500 text-xs mt-1">{currentErrors.interviewerId}</p>}
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                              <input 
                                 name="scheduledAt"
                                 type="datetime-local" required
                                 className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                 value={interviewForm.scheduledAt} onChange={e => setInterviewForm({...interviewForm, scheduledAt: e.target.value})}
                              />
                              {currentErrors.scheduledAt && <p className="text-rose-500 text-xs mt-1">{currentErrors.scheduledAt}</p>}
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Mins)</label>
                              <input 
                                 name="durationMinutes"
                                 type="number" min="15" step="15" required
                                 className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                 value={interviewForm.durationMinutes} onChange={e => setInterviewForm({...interviewForm, durationMinutes: Number(e.target.value)})}
                              />
                              {currentErrors.durationMinutes && <p className="text-rose-500 text-xs mt-1">{currentErrors.durationMinutes}</p>}
                           </div>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Link (Optional)</label>
                           <input 
                              type="url" placeholder="https://meet.google.com/..."
                              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                              value={interviewForm.meetingLink} onChange={e => setInterviewForm({...interviewForm, meetingLink: e.target.value})}
                           />
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                           <Button variant="secondary" onClick={() => setShowInterviewModal(false)} type="button">Cancel</Button>
                           <Button type="submit" disabled={updating}>
                              {updating ? 'Scheduling...' : 'Schedule Interview'}
                           </Button>
                        </div>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </DashboardLayout>
   );
}
