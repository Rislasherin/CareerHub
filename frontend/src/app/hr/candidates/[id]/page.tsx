'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
   Search, Bell, ChevronLeft, Calendar, Mail, Download,
   Plus, X, FileText, CheckCircle2, Circle, Clock,
   MapPin, Phone, Link as LinkIcon, Briefcase, GraduationCap,
   Award, Cloud, Code2, Users2, BrainCircuit
} from 'lucide-react';
import Link from 'next/link';
import { CandidateProfile } from '@/types/job';
import { getCandidateProfile } from '@/services/hr/job.service';
import { useRouter } from 'next/navigation';

export default function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
   const { id } = React.use(params);
   const router = useRouter();
   const [Profile, setProfile] = useState<CandidateProfile | null>(null);
   const [loading, setLoading] = useState(true);

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
      if (id) {
         fetchProfile();
      }
   }, [id])

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

   const handleShortlist = () => {
      const existing = JSON.parse(localStorage.getItem('shortlistedIds') || '[]');
      if (!existing.includes(id)) {
         existing.push(id);
         localStorage.setItem('shortlistedIds', JSON.stringify(existing));
      }
      alert('Candidate Shortlisted!');
      router.push('/hr/candidates');
   };

   const handleReject = () => {
      const existing = JSON.parse(localStorage.getItem('rejectedIds') || '[]');
      if (!existing.includes(id)) {
         existing.push(id);
         localStorage.setItem('rejectedIds', JSON.stringify(existing));
      }
      router.push('/hr/candidates');
   };

   return (
      <DashboardLayout>
         <div className="max-w-[1400px] mx-auto w-full space-y-6">

            <Link href="/hr/candidates" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest w-fit">
               <ChevronLeft size={16} /> Back to Candidate Pipeline
            </Link>

            {/* Profile Banner */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden relative">
               <div className="h-32 bg-[#1a1c29] w-full"></div>

               <div className="px-8 pb-8 relative flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="-mt-12 w-28 h-28 bg-white p-1.5 rounded-3xl shadow-sm z-10 shrink-0 mx-auto md:mx-0">
                     <div className="w-full h-full bg-indigo-500 rounded-[1.25rem] flex items-center justify-center text-white text-4xl font-black shadow-inner">
                        {Profile.firstName?.[0] || ""}{Profile.lastName?.[0] || ""}
                     </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 mt-2 space-y-6 text-center md:text-left">
                     {/* Action Buttons Top Right */}
                     <div className="md:absolute md:top-6 md:right-8 flex flex-row md:flex-col items-center md:items-end justify-center gap-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 shadow-sm border border-purple-200">
                           ✨ 96% AI Match
                        </span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100">
                           Applied: SWE Intern
                        </span>
                     </div>

                     <div>
                        <h1 className="text-3xl font-black text-slate-900">{Profile.firstName} {Profile.lastName}</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1.5">
                           {Profile.collegeName || 'Unknown College'} • {Profile.degree || 'Degree'} {Profile.branch && Profile.branch !== Profile.degree ? Profile.branch : ''} • Class of {Profile.graduationYear || 'N/A'}
                        </p>
                     </div>

                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer"><Mail size={14} className="text-slate-400" /> {Profile.email || 'N/A'}</span>
                        <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {Profile.phone || 'N/A'}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> India</span>
                        <span className="flex items-center gap-1.5 text-blue-600 hover:underline cursor-pointer"><LinkIcon size={14} /> linkedin.com/in/{Profile.firstName?.toLowerCase() || 'link'}</span>
                     </div>

                     <div className="flex flex-wrap gap-2">
                        {Profile.skills?.length ? Profile.skills.slice(0, 10).map(skill => (
                           <span key={skill} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl border border-indigo-100">
                              {skill}
                           </span>
                        )) : (
                           <span className="text-xs text-slate-400">No skills added</span>
                        )}
                     </div>

                     <hr className="border-slate-100" />

                     {/* Actions Bottom */}
                     <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                           <button onClick={handleShortlist} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-5 py-2.5 flex items-center transition-all shadow-sm shadow-emerald-500/20">
                              <CheckCircle2 size={16} className="mr-2" /> Shortlist
                           </button>
                        </div>
                        <button onClick={handleReject} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl px-5 py-2.5 flex items-center transition-all border border-red-100">
                           <X size={16} className="mr-2" /> Reject
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex gap-1 overflow-x-auto">
               {['Overview', 'Resume'].map((tab, i) => (
                  <button
                     key={tab}
                     className={`px-6 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${i === 0 ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                     {tab}
                  </button>
               ))}
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-indigo-600">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CGPA</p>
                  <h3 className="text-3xl font-black text-indigo-600">{Profile.cgpa || "N/A"}</h3>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-emerald-500 relative">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resume Score</p>
                  <div className="flex items-end gap-2">
                     <h3 className="text-3xl font-black text-emerald-600">{Profile.resumeScore || "N/A"}</h3>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-amber-500">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Availability</p>
                  <h3 className="text-xl font-black text-amber-600 mt-1">{Profile.preferences?.noticePeriod || "Immediate"}</h3>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-purple-500">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expected CTC</p>
                  <h3 className="text-xl font-black text-purple-600 mt-1">{Profile.preferences?.expectedCtc || "Negotiable"}</h3>
               </div>
            </div>

            {/* Grid Layout Bottom */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

               {/* Left Column */}
               <div className="space-y-6">
                  {/* Technical Skills */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Technical Skills</h3>
                     <div className="space-y-5">
                        {Profile.skills?.length ? Profile.skills.slice(0, 6).map((skill, index) => {
                           const percent = 90 - (index * 5); // UI Aesthetic
                           return (
                              <div key={skill}>
                                 <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-700">{skill}</span>
                                    <span className="text-xs font-black text-indigo-500">{percent}%</span>
                                 </div>
                                 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }}></div>
                                 </div>
                              </div>
                           )
                        }) : <p className="text-sm text-slate-400 font-medium">No skills listed</p>}
                     </div>
                  </div>
                  
                  {/* Soft Skills */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Soft Skills</h3>
                     <div className="flex flex-wrap gap-2">
                        {Profile.softSkills?.length ? Profile.softSkills.map((skill: string) => (
                           <span key={skill} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-200">
                              {skill}
                           </span>
                        )) : <p className="text-sm text-slate-400 font-medium">No soft skills listed</p>}
                     </div>
                  </div>
               </div>

               {/* Middle + Right Columns */}
               <div className="lg:col-span-2 space-y-6">
                  {/* Experience Section */}
                  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                     <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Briefcase size={14} className="text-indigo-500" /> Professional Experience
                        </h3>
                     </div>

                     <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {Profile.experience?.length ? Profile.experience.map((exp, i: number) => (
                           <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 group-[.is-active]:bg-indigo-600 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                 <Briefcase size={16} />
                              </div>
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                                 <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-slate-900">{exp.role}</div>
                                    <time className="font-mono text-[10px] text-slate-400">{exp.duration}</time>
                                 </div>
                                 <div className="text-xs font-bold text-indigo-600 mb-3">{exp.company} • {exp.location}</div>
                                 <p className="text-sm text-slate-500 leading-relaxed">
                                    {exp.summary}
                                 </p>
                              </div>
                           </div>
                        )) : (
                           <div className="text-sm font-medium text-slate-400 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-center">
                              No professional experience recorded.
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Projects Section */}
                  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
                        <Code2 size={14} className="text-indigo-500" /> Featured Projects
                     </h3>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Profile.projects?.length ? Profile.projects.map((proj, i: number) => (
                           <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all group cursor-pointer">
                              <div className="flex justify-between items-start mb-4">
                                 <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{proj.name}</h4>
                                 {proj.github && <LinkIcon size={14} className="text-slate-400" />}
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                                 {proj.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                 {proj.techStack?.slice(0, 3).map((tech: string) => (
                                    <span key={tech} className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                       {tech}
                                    </span>
                                 ))}
                              </div>
                           </div>
                        )) : (
                           <div className="col-span-2 text-sm font-medium text-slate-400 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-center">
                              No projects uploaded yet.
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </DashboardLayout>
   );
}
