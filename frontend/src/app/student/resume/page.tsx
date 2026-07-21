"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search, Lightbulb, FileText, Download, Check, AlertTriangle, XCircle, Wand2, PenSquare, RefreshCw, GripVertical, User, GraduationCap, Briefcase, Wrench, Folder, Award, Sparkles, ChevronRight, CheckCircle2, X } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { exportResumePdf } from '@/services/api/api.client';
import { useAppSelector } from '@/redux/hooks';
import { GlassCard } from '@/components/shared/GlassCard';

export default function ResumeBuilderPage() {
  const user = useAppSelector((state) => state.student.details);
  const router = useRouter();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(Date.now()); // bumped to force iframe refresh
  const [isFixModalOpen, setIsFixModalOpen] = useState(false);
  const [fixingIssue, setFixingIssue] = useState<string | null>(null);
  const [fixedContent, setFixedContent] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [jdText, setJdText] = useState("");
  
  // Section Coach State
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [coachSectionName, setCoachSectionName] = useState("");
  const [coachInstructions, setCoachInstructions] = useState("Make it sound more professional and metric-driven.");

  const { 
    report, isAnalyzing, isFixing, triggerAnalysis, triggerAutoFix, triggerRewriteAll, 
    syncResume, isSyncing, settings, updateSettings,
    resumes, activeResumeId, isLoadingResumes, fetchResumes, createNewResume, setActiveResume,
    jobMatchReport, isMatchingJob, triggerJobMatch,
    sectionCoachResult, isCoachingSection, triggerSectionCoach, clearSectionCoach
  } = useResumeStore();

  useEffect(() => {
    fetchResumes();
  }, []);

  const activeResume = resumes.find(r => (r._id || r.id) === activeResumeId);

  const handleAutoFix = async (issueMsg: string) => {
      setFixingIssue(issueMsg);
      setFixedContent(null);
      setIsFixModalOpen(true);
      const targetRole = "Software Engineer"; // Default role
      const result = await triggerAutoFix(issueMsg, targetRole);
      if (result) {
          setFixedContent(result);
      } else {
          setIsFixModalOpen(false);
      }
  };

  const handleOpenCoach = (sectionName: string) => {
      setCoachSectionName(sectionName);
      clearSectionCoach();
      setIsCoachModalOpen(true);
  };

  // Sync profile then auto-open preview
  const handleSync = async () => {
      await syncResume();
      setPreviewKey(Date.now());
      setIsPreviewOpen(true);
  };

  const handleExportPdf = async () => {
      if (!activeResumeId) return toast.error("No active resume selected");
      setIsExporting(true);
      try {
          const blob = await exportResumePdf(activeResumeId);
          const url = window.URL.createObjectURL(new Blob([blob as any], { type: 'application/pdf' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${activeResume?.resumeName || 'Resume'}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
      } catch (error) {
          console.error("Failed to export PDF", error);
      } finally {
          setIsExporting(false);
      }
  };


  const handleCreateNew = async () => {
      const title = prompt("Enter a name for this Resume Version (e.g., Backend Engineer):");
      if (title) {
          setIsCreating(true);
          await createNewResume(title);
          setIsCreating(false);
      }
  }

  const atsScore = report?.overallScore ?? 78;

  // Dynamic Suggestions from ATS Report
  const criticalIssues = report?.criticalIssues || [
     'Add quantified results \u2014 "Reduced load time by 40%"',
     'No GitHub / LinkedIn in contact section.'
  ];
  const improvements = report?.warnings || [
     '73% of SWE roles require AWS/GCP. Add cloud skills.'
  ];
  const strengths = report?.strengths || [
     '3 impactful projects with GitHub links \u2014 excellent.'
  ];
  const hasContactInfo = user?.phoneNumber && (user?.linkedinUrl || user?.githubUrl);
  const hasEducation = !!user?.degree;
  const hasExperience = user?.experience && user.experience.length > 0;
  const hasSkills = user?.skills && (user.skills.languages?.length || 0) > 0;
  const hasProjects = user?.projects && user.projects.length > 0;
  const projectCount = user?.projects?.length || 0;

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resume Builder</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              AI-powered &bull; 4 Naukri templates &bull; ATS scored &bull; PDF export
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none"
              />
            </div>
            <button className="h-10 px-4 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-rose-500/20">
              <Lightbulb size={14} /> Practice Now
            </button>
          </div>
        </header>

        {/* Top Dark Card (ATS Score) */}
        <div className="bg-[#242424] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-xl text-white gap-6">
          <div className="flex items-center gap-6">
            {/* Circular Ring */}
            <div className="relative w-20 h-20 shrink-0">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#3f3f46" strokeWidth="6" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#E11D48" strokeWidth="6" strokeDasharray={`${atsScore * 2.82} 282`} strokeLinecap="round" />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-black">{atsScore}</span>
               </div>
            </div>
            <div>
               <h2 className="text-xl font-bold">ATS Score: {atsScore}/100</h2>
               <p className="text-sm text-gray-400 mt-1">3 critical issues preventing 90+ score</p>
               <div className="flex items-center gap-2 mt-3">
                  <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30">3 Critical</span>
                  <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-500/30">5 Improve</span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">12 Good</span>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1 md:flex-none border border-gray-600 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
             >
                <RefreshCw size={14} className={isSyncing ? "animate-spin text-emerald-400" : "text-emerald-400"} /> {isSyncing ? 'Syncing...' : 'Sync Profile'}
             </button>
             <button 
                onClick={() => triggerRewriteAll("Software Engineer")}
                disabled={isAnalyzing}
                className="flex-1 md:flex-none border border-gray-600 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
             >
                <Sparkles size={14} className="text-purple-400" /> {isAnalyzing ? 'Rewriting...' : 'Rewrite with AI'}
             </button>
             <button 
                onClick={() => setIsPreviewOpen(true)}
                className="flex-1 md:flex-none border border-gray-600 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
             >
                <FileText size={14} /> Live Preview
             </button>
             <button 
                onClick={handleExportPdf}
                disabled={isExporting}
                className="flex-1 md:flex-none border border-gray-600 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
             >
                <Download size={14} /> Export PDF
             </button>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left Column (2/3) */}
           <div className="lg:col-span-2 space-y-8">
              
              {/* Choose Template Section */}
              <GlassCard className="p-6 bg-white rounded-2xl border border-slate-200">
                 <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-slate-800">Choose Template</h3>
                    <div className="flex gap-2">
                       <span className="text-[9px] font-bold text-rose-500 border border-rose-200 bg-rose-50 px-2 py-0.5 rounded-full">Naukri-compatible</span>
                       <span className="text-[9px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-full">ATS-safe</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Template: Professional */}
                    <div 
                      onClick={() => activeResumeId && updateSettings(activeResumeId, { templateId: "professional" })}
                      className={`cursor-pointer rounded-xl border p-1 transition-all ${settings.templateId === 'professional' ? 'border-rose-500 shadow-md ring-2 ring-rose-100' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                       <div className="relative h-32 bg-[#1A1A1A] rounded-lg mb-2 overflow-hidden flex flex-col p-3">
                          {settings.templateId === 'professional' && (
                             <div className="absolute top-2 right-2 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Check size={10} /> Active
                             </div>
                          )}
                          <div className="w-16 h-1 bg-gray-400 mb-2"></div>
                          <div className="w-10 h-0.5 bg-rose-500 mb-3"></div>
                          <div className="w-full h-2 bg-gray-700 mb-1"></div>
                          <div className="w-full h-2 bg-gray-700"></div>
                       </div>
                       <div className="px-1 pb-1">
                          <h4 className="text-xs font-bold text-gray-900">Professional</h4>
                          <p className="text-[9px] text-gray-500">Dark &bull; ATS-safe</p>
                       </div>
                    </div>

                    {/* Template: Crimson */}
                    <div 
                      onClick={() => activeResumeId && updateSettings(activeResumeId, { templateId: "crimson" })}
                      className={`cursor-pointer rounded-xl border p-1 transition-all ${settings.templateId === 'crimson' ? 'border-rose-500 shadow-md ring-2 ring-rose-100' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                       <div className="relative h-32 bg-[#8B1A3B] rounded-lg mb-2 overflow-hidden flex p-2 gap-2">
                          {settings.templateId === 'crimson' && (
                             <div className="absolute top-2 right-2 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Check size={10} /> Active
                             </div>
                          )}
                          <div className="w-1/3 h-full border-r border-white/20"></div>
                          <div className="flex-1 h-full"></div>
                       </div>
                       <div className="px-1 pb-1">
                          <h4 className="text-xs font-bold text-gray-900">Crimson</h4>
                          <p className="text-[9px] text-gray-500">Bold &bull; Two-column</p>
                       </div>
                    </div>

                    {/* Template: Minimal */}
                    <div 
                      onClick={() => activeResumeId && updateSettings(activeResumeId, { templateId: "minimal" })}
                      className={`cursor-pointer rounded-xl border p-1 transition-all ${settings.templateId === 'minimal' ? 'border-rose-500 shadow-md ring-2 ring-rose-100' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                       <div className="relative h-32 bg-gray-100 rounded-lg mb-2 overflow-hidden flex flex-col p-3 items-center text-center">
                          {settings.templateId === 'minimal' && (
                             <div className="absolute top-2 right-2 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Check size={10} /> Active
                             </div>
                          )}
                          <div className="w-10 h-10 rounded-full bg-gray-300 mb-2"></div>
                          <div className="w-16 h-1 bg-gray-400 mb-2"></div>
                       </div>
                       <div className="px-1 pb-1">
                          <h4 className="text-xs font-bold text-gray-900">Minimal</h4>
                          <p className="text-[9px] text-gray-500">Clean &bull; Simple</p>
                       </div>
                    </div>

                    {/* Template: Executive */}
                    <div 
                      onClick={() => activeResumeId && updateSettings(activeResumeId, { templateId: "executive" })}
                      className={`cursor-pointer rounded-xl border p-1 transition-all ${settings.templateId === 'executive' ? 'border-rose-500 shadow-md ring-2 ring-rose-100' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                       <div className="relative h-32 bg-[#274488] rounded-lg mb-2 overflow-hidden flex flex-col items-center justify-center">
                          {settings.templateId === 'executive' && (
                             <div className="absolute top-2 right-2 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Check size={10} /> Active
                             </div>
                          )}
                          <div className="w-10 h-10 rounded-full bg-white/20 mb-2"></div>
                          <div className="w-16 h-1 bg-white mb-2"></div>
                       </div>
                       <div className="px-1 pb-1">
                          <h4 className="text-xs font-bold text-gray-900">Executive</h4>
                          <p className="text-[9px] text-gray-500">Premium &bull; Formal</p>
                       </div>
                    </div>
                 </div>
              </GlassCard>

              {/* Resume Sections */}
              <GlassCard className="p-6 bg-white rounded-2xl border border-slate-200">
                 <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-slate-800">Resume Sections</h3>
                    <button 
                        onClick={() => triggerAnalysis()}
                        disabled={isAnalyzing}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-colors"
                     >
                        <Sparkles size={12} /> {isAnalyzing ? 'Analyzing...' : 'Analyze All'}
                    </button>
                 </div>

                 <div className="space-y-3">
                    {/* Personal Information */}
                    <div className={`p-4 rounded-xl border flex items-center gap-4 ${hasContactInfo ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                       <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                          <User size={18} className="text-gray-500" />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-800">Personal Information</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Name, contacts, GitHub, LinkedIn</p>
                       </div>
                       {hasContactInfo ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                             <Check size={12} /> Complete
                          </div>
                       ) : (
                          <button className="flex items-center gap-1.5 text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm">
                             Fix Details
                          </button>
                       )}
                    </div>

                    {/* Education */}
                    <div className={`p-4 rounded-xl border flex items-center gap-4 ${hasEducation ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                       <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                          <GraduationCap size={18} className="text-gray-500" />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-800">Education</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{user?.collegeName || "Add college"} &bull; {user?.degree || "Degree"} &bull; CGPA {user?.cgpa || "N/A"}</p>
                       </div>
                       {hasEducation ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                             <Check size={12} /> Complete
                          </div>
                       ) : (
                          <button className="flex items-center gap-1.5 text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm">
                             Add Education
                          </button>
                       )}
                    </div>

                    {/* Work Experience */}
                    <div className={`p-4 rounded-xl border flex items-center gap-4 bg-amber-50/30 border-amber-200`}>
                       <div className="w-10 h-10 rounded-full bg-white border border-amber-200 flex items-center justify-center shrink-0">
                          <Briefcase size={18} className="text-amber-600" />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-800">Work Experience</h4>
                          <p className="text-xs text-amber-700 mt-0.5">Bullet points lack metrics</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <button 
                             onClick={() => handleOpenCoach('experience')}
                             className="flex items-center gap-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                          >
                             <Sparkles size={12} className="text-purple-500" /> AI Coach
                          </button>
                          <div className="flex items-center gap-1 text-amber-600 border border-amber-200 bg-amber-50 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider">
                             <AlertTriangle size={10} /> Improve
                          </div>
                       </div>
                    </div>

                    {/* Skills */}
                    <div className={`p-4 rounded-xl border flex items-center gap-4 bg-rose-50/30 border-rose-200`}>
                       <div className="w-10 h-10 rounded-full bg-white border border-rose-200 flex items-center justify-center shrink-0">
                          <Wrench size={18} className="text-rose-600" />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-800">Skills</h4>
                          <p className="text-xs text-rose-600 mt-0.5">Missing: AWS, Docker, TypeScript</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm">
                             <Wand2 size={12} className="text-purple-500" /> Fix
                          </button>
                          <div className="flex items-center gap-1 text-rose-600 border border-rose-200 bg-rose-50 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider">
                             <X size={10} /> Keywords
                          </div>
                       </div>
                    </div>

                    {/* Projects */}
                    <div className={`p-4 rounded-xl border flex items-center gap-4 ${hasProjects ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                       <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                          <Folder size={18} className="text-gray-500" />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-800">Projects ({projectCount})</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{hasProjects ? "GitHub links present \u00b7 Strong" : "No projects added"}</p>
                       </div>
                       {hasProjects ? (
                          <div className="flex items-center gap-2">
                              <button 
                                 onClick={() => handleOpenCoach('projects')}
                                 className="flex items-center gap-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                              >
                                 <Sparkles size={12} className="text-purple-500" /> AI Coach
                              </button>
                              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                                 <Check size={12} /> Complete
                              </div>
                          </div>
                       ) : (
                          <button className="flex items-center gap-1.5 text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm">
                             Add Project
                          </button>
                       )}
                    </div>

                    {/* Certifications */}
                    <div className={`p-4 rounded-xl border flex items-center gap-4 bg-amber-50/30 border-amber-200`}>
                       <div className="w-10 h-10 rounded-full bg-white border border-amber-200 flex items-center justify-center shrink-0">
                          <Award size={18} className="text-amber-600" />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-800">Certifications</h4>
                          <p className="text-xs text-amber-700 mt-0.5">Only 1 cert \u2014 add 2+ for better ATS</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <button 
                             onClick={() => router.push('/student/profile')}
                             className="flex items-center gap-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                          >
                             Edit in Profile
                          </button>
                          <div className="flex items-center gap-1 text-amber-600 border border-amber-200 bg-amber-50 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider">
                             <AlertTriangle size={10} /> Add more
                          </div>
                       </div>
                    </div>

                 </div>
              </GlassCard>
           </div>

           {/* Right Column (1/3) */}
           <div className="space-y-6">
              

              <div className="flex justify-between items-center bg-slate-900 rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="relative z-10 space-y-3">
             <div className="flex items-center gap-3 mb-2">
                 <select 
                    value={activeResumeId || ''}
                    onChange={(e) => setActiveResume(e.target.value)}
                    className="bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none"
                 >
                    {isLoadingResumes && <option value="">Loading...</option>}
                    {resumes.map(r => (
                        <option key={r._id || r.id} value={r._id || r.id}>{r.resumeName || 'Untitled Resume'}</option>
                    ))}
                 </select>
                 <button onClick={handleCreateNew} disabled={isCreating} className="text-xs text-purple-400 font-bold hover:text-purple-300 transition-colors">
                     + New Version
                 </button>
             </div>
             <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                {activeResume?.resumeName || "AI Resume Builder"} <Sparkles className="text-purple-400" size={24} />
             </h1>
          </div>
        </div>

              <GlassCard className="p-6 bg-white rounded-2xl border border-slate-200">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <Sparkles className="text-purple-500" size={16} /> AI Suggestions
                 </h3>

                 <div className="space-y-4">
                    {/* Critical Issues */}
                    {criticalIssues.map((issue: string, idx: number) => (
                      <div key={`crit-${idx}`} className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl">
                         <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Critical</span>
                         </div>
                         <p className="text-xs text-slate-700 mb-3 leading-relaxed">
                            {issue}
                         </p>
                         <button 
                            onClick={() => handleAutoFix(issue)}
                            className="flex items-center gap-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                         >
                            <Sparkles size={12} className="text-purple-500" /> Auto-Fix
                         </button>
                      </div>
                    ))}

                    {/* Improvements */}
                    {improvements.map((improvement: string, idx: number) => (
                      <div key={`imp-${idx}`} className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                         <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Improve</span>
                         </div>
                         <p className="text-xs text-slate-700 mb-3 leading-relaxed">
                            {improvement}
                         </p>
                         <button className="flex items-center gap-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm">
                            <Sparkles size={12} className="text-purple-500" /> Suggest
                         </button>
                      </div>
                    ))}

                    {/* Strengths */}
                    {strengths.map((strength: string, idx: number) => (
                      <div key={`str-${idx}`} className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                         <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Strong</span>
                         </div>
                         <p className="text-xs text-emerald-700 leading-relaxed">
                            {strength}
                         </p>
                      </div>
                    ))}
                 </div>
              </GlassCard>

              {/* Dynamic Job Description Intelligence */}
              <GlassCard className="p-6 bg-white rounded-2xl border border-slate-200">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <Briefcase className="text-blue-500" size={16} /> Job Description Match
                 </h3>
                 
                 <div className="space-y-4">
                     <textarea 
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste target Job Description here..."
                        className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                     />
                     <button 
                        onClick={() => triggerJobMatch(jdText)}
                        disabled={isMatchingJob || !jdText.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                     >
                         {isMatchingJob ? <span className="animate-spin text-lg">⚙</span> : <Search size={14} />} 
                         {isMatchingJob ? "Analyzing Match..." : "Analyze Job Match"}
                     </button>

                     {jobMatchReport && (
                         <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                             <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                                 <span className="text-xs font-bold text-slate-600">Overall Match</span>
                                 <span className={`text-lg font-black ${jobMatchReport.matchPercentage >= 75 ? 'text-emerald-600' : jobMatchReport.matchPercentage >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                     {jobMatchReport.matchPercentage}%
                                 </span>
                             </div>

                             <div>
                                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Matched Skills</p>
                                 <div className="flex flex-wrap gap-1.5">
                                     {jobMatchReport.matchedKeywords.length === 0 && <span className="text-xs text-slate-400">No matches found</span>}
                                     {jobMatchReport.matchedKeywords.map((kw: string, i: number) => (
                                         <span key={i} className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                             <Check size={10} /> {kw}
                                         </span>
                                     ))}
                                 </div>
                             </div>

                             <div>
                                 <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-2">Missing Skills</p>
                                 <div className="flex flex-wrap gap-1.5">
                                     {jobMatchReport.missingKeywords.length === 0 && <span className="text-xs text-slate-400">None! Perfect match.</span>}
                                     {jobMatchReport.missingKeywords.map((kw: string, i: number) => (
                                         <span key={i} className="bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                             <X size={10} /> {kw}
                                         </span>
                                     ))}
                                 </div>
                             </div>
                         </div>
                     )}
                 </div>
              </GlassCard>
           </div>
        </div>
      </div>
      
      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="w-full max-w-4xl h-[90vh] bg-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-slate-700">
              <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
                 <h2 className="text-sm font-bold text-gray-900">Live HTML Preview</h2>
                 <button 
                    onClick={() => setIsPreviewOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors"
                 >
                    <X size={20} />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
                 <div className="w-full max-w-[794px] aspect-[1/1.414] bg-white shadow-xl relative" style={{ minHeight: '1123px' }}>
                    <iframe 
                      key={previewKey}
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/student/resume/preview?resumeId=${activeResumeId}&template=${settings.templateId}&t=${previewKey}`} 
                      className="w-full h-full border-none absolute inset-0"
                      title="Live Resume Preview"
                    />
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Auto-Fix Modal */}
      {isFixModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-slate-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-purple-50/50">
                 <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" /> AI Auto-Fix
                 </h2>
                 <button 
                    onClick={() => setIsFixModalOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-slate-200/50 text-slate-500 flex items-center justify-center transition-colors"
                 >
                    <X size={20} />
                 </button>
              </div>
              <div className="p-6">
                 <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Addressing Issue</p>
                 <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-900 mb-6 font-medium">
                     {fixingIssue}
                 </div>

                 <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">AI Suggestion</p>
                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg min-h-[100px] flex items-center justify-center">
                     {!fixedContent ? (
                         <div className="flex flex-col items-center gap-3">
                             <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                             <p className="text-xs font-bold text-purple-600 animate-pulse">Generating perfect wording...</p>
                         </div>
                     ) : (
                         <p className="text-sm text-slate-800 font-medium leading-relaxed">
                             {fixedContent}
                         </p>
                     )}
                 </div>
              </div>
              {fixedContent && (
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                     <button onClick={() => setIsFixModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                        Discard
                     </button>
                     <button onClick={async () => {
                         if (fixedContent) {
                             try {
                                 await navigator.clipboard.writeText(fixedContent);
                                 toast.success('Suggestion copied to clipboard!');
                             } catch (err) {
                                 toast.error('Failed to copy to clipboard.');
                             }
                         }
                         setIsFixModalOpen(false);
                     }} className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-lg shadow-purple-500/30">
                        Copy to Clipboard
                     </button>
                  </div>
              )}
           </div>
        </div>
      )}

      {/* AI Section Coach Modal */}
      {isCoachModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-slate-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
                 <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 capitalize">
                    <Sparkles size={16} className="text-blue-500" /> {coachSectionName} AI Coach
                 </h2>
                 <button 
                    onClick={() => setIsCoachModalOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-slate-200/50 text-slate-500 flex items-center justify-center transition-colors"
                 >
                    <X size={20} />
                 </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                 <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Instructions for AI</p>
                 <textarea 
                    value={coachInstructions}
                    onChange={(e) => setCoachInstructions(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-6 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    rows={2}
                 />

                 {!sectionCoachResult ? (
                     <div className="flex flex-col items-center justify-center py-8">
                         {isCoachingSection ? (
                             <div className="flex flex-col items-center gap-4">
                                 <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                 <p className="text-sm font-bold text-blue-600 animate-pulse">Analyzing and rewriting your {coachSectionName} section...</p>
                             </div>
                         ) : (
                             <button 
                                onClick={() => triggerSectionCoach(coachSectionName, coachInstructions, "Software Engineer")}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
                             >
                                <Sparkles size={16} /> Generate Suggestions
                             </button>
                         )}
                     </div>
                 ) : (
                     <div className="space-y-4">
                         <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                             <p className="text-xs font-bold text-emerald-800 mb-1">AI Explanation:</p>
                             <p className="text-sm text-emerald-700">{sectionCoachResult.explanation}</p>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Original</p>
                                 <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-500 max-h-64 overflow-y-auto opacity-70">
                                     <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(activeResume ? activeResume[coachSectionName as keyof typeof activeResume] : {}, null, 2)}</pre>
                                 </div>
                             </div>
                             <div>
                                 <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">AI Suggestion</p>
                                 <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-slate-800 max-h-64 overflow-y-auto shadow-inner">
                                     <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(sectionCoachResult.suggestedData, null, 2)}</pre>
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}
              </div>
              {sectionCoachResult && (
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                     <button onClick={() => setIsCoachModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                        Discard
                     </button>
                     <button onClick={async () => {
                         try {
                             await navigator.clipboard.writeText(
                                 JSON.stringify(sectionCoachResult.suggestedData, null, 2)
                             );
                             toast.success(`AI suggestion copied! Apply it in your Profile → ${coachSectionName}.`);
                         } catch {
                             toast.info('Copy the AI Suggestion above and apply it in your Profile.');
                         }
                         setIsCoachModalOpen(false);
                         router.push('/student/profile');
                     }} className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-500/30">
                        Accept & Go to Profile
                     </button>
                  </div>
              )}
           </div>
        </div>
      )}

    </DashboardLayout>
  );
}
