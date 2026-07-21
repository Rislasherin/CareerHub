'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import {
  getStudentProfile,
  updateStudentProfile
} from '@/services/student/profile.service';
import { apiClient } from '@/services/api/api.client';
import {
  StudentProfile,
  StudentExperience,
  StudentProject
} from '@/types/student';
import { toast } from 'sonner';
import { SkillAutocomplete } from '@/components/shared/SkillAutocomplete';
import ResumeSection from './_components/ResumeSection';
import ResumeSyncModal from './_components/ResumeSyncModal';
import { ResumeMetadata } from '@/types/student';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setStudentDetails } from '@/redux/slices/studentSlice';

export default function StudentProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.student.details);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [city, setCity] = useState('');
  const [professionalSummary, setProfessionalSummary] = useState('');

  // AI Summary states
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showSummaryPreview, setShowSummaryPreview] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');

  // Academic fields
  const [collegeName, setCollegeName] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [twelfthPercentage, setTwelfthPercentage] = useState('');
  const [tenthPercentage, setTenthPercentage] = useState('');
  const [activeBacklogs, setActiveBacklogs] = useState('0');

  // Skills
  const [languages, setLanguages] = useState<string[]>([]);
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [databases, setDatabases] = useState<string[]>([]);
  const [cloudDevops, setCloudDevops] = useState<string[]>([]);
  const [otherTools, setOtherTools] = useState<string[]>([]);
  const [aiMl, setAiMl] = useState<string[]>([]);

  // Input states for arrays
  const [experiences, setExperiences] = useState<StudentExperience[]>([]);
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [spokenLanguages, setSpokenLanguages] = useState<any[]>([]);

  // Preferences & Soft Skills
  const [preferredRole, setPreferredRole] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [expectedCtc, setExpectedCtc] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [jobType, setJobType] = useState('');
  const [preferenceLocation, setPreferenceLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [softSkillsInput, setSoftSkillsInput] = useState('');
  
  // Resume
  const [resumeMetadata, setResumeMetadata] = useState<ResumeMetadata | undefined>(undefined);
  const [parsedResumeData, setParsedResumeData] = useState<any | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Profile completion score
  const [completionPercentage, setCompletionPercentage] = useState(85);

  const calculateProgress = (profile: StudentProfile) => {
    let score = 30; // Base verified score
    if (profile.phoneNumber) score += 10;
    if (profile.linkedinUrl) score += 10;
    if (profile.githubUrl || profile.portfolioUrl) score += 10;
    if (profile.skills && Object.values(profile.skills).some(arr => Array.isArray(arr) && arr.length > 0)) score += 15;
    if (profile.experience && profile.experience.length > 0) score += 10;
    if (profile.softSkills && profile.softSkills.length > 0) score += 10;
    if (profile.preferences && profile.preferences.preferredRole) score += 10;
    setCompletionPercentage(Math.min(score, 100));
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await getStudentProfile();

        // Map personal
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setEmail(profile.email || '');
        setPhoneNumber(profile.phoneNumber || '');
        setLinkedinUrl(profile.linkedinUrl || '');
        setGithubUrl(profile.githubUrl || '');
        setPortfolioUrl(profile.portfolioUrl || '');
        setCity(profile.city || '');
        setProfessionalSummary(profile.professionalSummary || '');

        // Map academic fields
        setCollegeName(profile.collegeName || '');
        setDegree(profile.degree || '');
        setBranch(profile.branch || profile.department || '');
        setGraduationYear(profile.graduationYear?.toString() || '');
        setCgpa(profile.cgpa?.toString() || '');
        setTwelfthPercentage(profile.twelfthPercentage?.toString() || '');
        setTenthPercentage(profile.tenthPercentage?.toString() || '');
        setActiveBacklogs(profile.activeBacklogs?.toString() || '0');

        // Map skills
        if (profile.skills) {
          setLanguages(profile.skills.languages || []);
          setFrameworks(profile.skills.frameworks || []);
          setDatabases(profile.skills.databases || []);
          setCloudDevops(profile.skills.cloudDevops || []);
          setOtherTools(profile.skills.otherTools || []);
          setAiMl(profile.skills.aiMl || []);
        }

        // Map experience & projects
        setExperiences(profile.experience || []);
        setProjects(profile.projects || []);
        setAchievements(profile.achievements || []);
        setSpokenLanguages(profile.spokenLanguages || []);

        // Map preferences & soft skills
        if (profile.preferences) {
          setPreferredRole(profile.preferences.preferredRole || '');
          setWorkMode(profile.preferences.workMode || '');
          setExpectedCtc(profile.preferences.expectedCtc || '');
          setNoticePeriod(profile.preferences.noticePeriod || '');
          setJobType(profile.preferences.jobType || '');
          setPreferenceLocation(profile.preferences.location || '');
          setStartDate(profile.preferences.startDate || '');
        }
        if (profile.softSkills) {
          setSoftSkillsInput(profile.softSkills.join(', '));
        }
        
        if (profile.resume) {
          setResumeMetadata(profile.resume);
        }

        // Calculate progress dynamically
        calculateProgress(profile);

      } catch (err: unknown) {
        setError((err as Error)?.message || 'Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      { company: '', role: '', duration: '', location: '', summary: '' }
    ]);
  };

  const handleUpdateExperience = (index: number, field: keyof StudentExperience, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleAddProject = () => {
    setProjects([
      ...projects,
      { name: '', techStack: [], github: '', liveDemo: '', description: '' }
    ]);
  };

  const handleUpdateProject = (index: number, field: keyof StudentProject, value: string | string[]) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleAddAchievement = () => {
    setAchievements([...achievements, { title: '', subtitle: '', type: 'award' }]);
  };

  const handleUpdateAchievement = (index: number, field: string, value: string) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  const handleAddSpokenLanguage = () => {
    setSpokenLanguages([...spokenLanguages, { language: '', proficiency: 'Professional' }]);
  };

  const handleUpdateSpokenLanguage = (index: number, field: string, value: string) => {
    const updated = [...spokenLanguages];
    updated[index] = { ...updated[index], [field]: value };
    setSpokenLanguages(updated);
  };

  const handleSave = async () => {
    // Validation
    if (!firstName.trim()) { toast.error("First Name is required"); return; }
    if (!lastName.trim()) { toast.error("Last Name is required"); return; }
    if (!phoneNumber.trim()) { toast.error("Phone Number is required"); return; }
    if (!degree.trim()) { toast.error("Degree is required"); return; }

    if (graduationYear && isNaN(Number(graduationYear))) { toast.error("Graduation Year must be a valid number"); return; }
    if (cgpa && (isNaN(Number(cgpa)) || Number(cgpa) < 0 || Number(cgpa) > 10)) { toast.error("CGPA must be a valid number between 0 and 10"); return; }
    if (tenthPercentage && (isNaN(Number(tenthPercentage)) || Number(tenthPercentage) < 0 || Number(tenthPercentage) > 100)) { toast.error("10th Percentage must be between 0 and 100"); return; }
    if (twelfthPercentage && (isNaN(Number(twelfthPercentage)) || Number(twelfthPercentage) < 0 || Number(twelfthPercentage) > 100)) { toast.error("12th Percentage must be between 0 and 100"); return; }
    if (activeBacklogs && (isNaN(Number(activeBacklogs)) || Number(activeBacklogs) < 0)) { toast.error("Active Backlogs must be a valid non-negative number"); return; }

    const invalidExp = experiences.find(exp => 
      (exp.company.trim() || exp.role.trim() || exp.duration.trim()) && 
      (!exp.company.trim() || !exp.role.trim() || !exp.duration.trim())
    );
    if (invalidExp) {
      toast.error("Please fill Company Name, Role, and Duration for all work experiences");
      return;
    }

    const invalidProj = projects.find(proj => 
      (proj.name.trim() || proj.techStack.length > 0) && 
      (!proj.name.trim() || proj.techStack.length === 0)
    );
    if (invalidProj) {
      toast.error("Please fill Project Name and Tech Stack for all active projects");
      return;
    }

    setSaving(true);
    try {
      const parsedSkills = {
        languages,
        frameworks,
        databases,
        cloudDevops,
        otherTools,
        aiMl
      };

      const payload: Partial<StudentProfile> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        city: city.trim(),
        professionalSummary: professionalSummary.trim(),
        degree: degree.trim(),
        branch: branch.trim(),
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
        cgpa: cgpa ? Number(cgpa) : undefined,
        tenthPercentage: tenthPercentage ? Number(tenthPercentage) : undefined,
        twelfthPercentage: twelfthPercentage ? Number(twelfthPercentage) : undefined,
        activeBacklogs: activeBacklogs ? Number(activeBacklogs) : undefined,
        skills: parsedSkills,
        experience: experiences.filter(exp => exp.company.trim() && exp.role.trim()),
        projects: projects.filter(proj => proj.name.trim() && proj.techStack.length > 0),
        achievements: achievements.filter(ach => ach.title.trim()),
        spokenLanguages: spokenLanguages.filter(lang => lang.language.trim()),
        preferences: {
          preferredRole: preferredRole.trim(),
          workMode: workMode.trim(),
          expectedCtc: expectedCtc.trim(),
          noticePeriod: noticePeriod.trim(),
          jobType: jobType.trim(),
          location: preferenceLocation.trim(),
          startDate: startDate.trim()
        },
        softSkills: softSkillsInput.split(',').map(s => s.trim()).filter(Boolean)
      };

      const updated = await updateStudentProfile(payload);
      toast.success('Profile successfully saved!');
      calculateProgress(updated);
      
      dispatch(setStudentDetails(updated as any));
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to save student profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImportParsedData = (dataToImport: any) => {
    setIsSyncModalOpen(false);
    let importedCount = 0;
    
    if (dataToImport.experience) {
       const newExperiences = dataToImport.experience.map((e: any) => ({
          company: e.company || '',
          role: e.title || '',
          duration: `${e.startDate || ''} - ${e.endDate || ''}`.trim(),
          summary: e.descriptionBullets?.join('\n') || ''
       }));
       setExperiences([...experiences, ...newExperiences]);
       importedCount++;
    }

    if (dataToImport.skills) {
       // We can just dump them in "otherTools" or "languages" for now
       const newSkills = dataToImport.skills.filter((s: string) => !otherTools.includes(s));
       setOtherTools([...otherTools, ...newSkills]);
       importedCount++;
    }

    if (dataToImport.personalInfo) {
       if (dataToImport.personalInfo.linkedinUrl) setLinkedinUrl(dataToImport.personalInfo.linkedinUrl);
       if (dataToImport.personalInfo.githubUrl) setGithubUrl(dataToImport.personalInfo.githubUrl);
       if (dataToImport.personalInfo.phone) setPhoneNumber(dataToImport.personalInfo.phone);
       importedCount++;
    }

    if (importedCount > 0) {
       toast.success("Imported AI data! Please review and click Save Profile.");
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await apiClient.post('/student/profile/generate-summary') as any;
      setGeneratedSummary(response.data.summary);
      setShowSummaryPreview(true);
    } catch (err: any) {
      // apiClient shows toast automatically on errors
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-student-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
            <p className="text-slate-500 font-medium mt-1">This profile is exactly what HR & Companies see. Keep it updated!</p>
          </div>
          <div className="hidden md:block">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Profile Active
            </span>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* Banner Card */}
            <GlassCard className="p-8 border-slate-100 rounded-[2rem] bg-[#0F172A] text-white relative overflow-hidden shadow-2xl flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl -z-10" />

              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-4xl text-white shadow-xl mb-4 border-4 border-slate-800">
                {firstName.charAt(0)}{lastName.charAt(0)}
              </div>

              <h2 className="text-2xl font-black tracking-tight mb-1">{firstName} {lastName}</h2>
              <p className="text-slate-300 text-sm font-medium mb-4">
                {degree} • {branch}
              </p>

              <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Open to Work
              </span>

              <div className="w-full bg-slate-800/50 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Score</span>
                  <span className="text-sm font-black text-emerald-400">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${completionPercentage}%` }} />
                </div>
              </div>
            </GlassCard>

            {/* Resume Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
               <ResumeSection 
                initialResume={resumeMetadata} 
                onUpdate={(newResume, parsedData) => {
                  setResumeMetadata(newResume);
                  if (parsedData) {
                    setParsedResumeData(parsedData);
                    setIsSyncModalOpen(true);
                  }
                  if (user && newResume) {
                    dispatch(setStudentDetails({
                      ...user,
                      resume: newResume
                    } as any));
                  } else if (user && !newResume) {
                    const { resume, ...rest } = user;
                    dispatch(setStudentDetails(rest as any));
                  }
                }} 
              />
            </div>

            {/* Job Preferences */}
            <GlassCard className="p-6 md:p-8 border-slate-100 rounded-[2rem] bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg">🎯</div>
                <h3 className="text-lg font-black text-slate-900">Job Preferences</h3>
              </div>

              <div className="space-y-5">
                <Input label="Preferred Role" value={preferredRole} onChange={e => setPreferredRole(e.target.value)} placeholder="e.g. Full Stack" />
                <Input label="Expected CTC" value={expectedCtc} onChange={e => setExpectedCtc(e.target.value)} placeholder="e.g. 12 LPA" />
                <Input label="Preferred Location" value={preferenceLocation} onChange={e => setPreferenceLocation(e.target.value)} placeholder="e.g. Bangalore" />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Mode</label>
                  <select value={workMode} onChange={e => setWorkMode(e.target.value)} className="bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-inner w-full">
                    <option value="" disabled>Select...</option>
                    <option value="On-Site">On-Site Office</option>
                    <option value="Remote">Fully Remote</option>
                    <option value="Hybrid">Hybrid Mode</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notice Period</label>
                  <select value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} className="bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-inner w-full">
                    <option value="" disabled>Select...</option>
                    <option value="Immediate">Immediate Joiner</option>
                    <option value="15 Days">15 Days</option>
                    <option value="1 Month">1 Month</option>
                    <option value="Post Graduation">After Graduation</option>
                  </select>
                </div>
              </div>
            </GlassCard>

            {/* Soft Skills & Languages */}
            <GlassCard className="p-6 md:p-8 border-slate-100 rounded-[2rem] bg-white shadow-sm border-b-4 border-b-pink-400">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center text-lg">🗣️</div>
                <h3 className="text-lg font-black text-slate-900">Soft Skills</h3>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Skills (Comma-Separated)</label>
                  <Input placeholder="Leadership, Communication..." value={softSkillsInput} onChange={e => setSoftSkillsInput(e.target.value)} />
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Languages</label>
                    <button type="button" onClick={handleAddSpokenLanguage} className="text-xs font-bold text-indigo-700 bg-indigo-50 px-4 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">+ Add</button>
                  </div>
                  <div className="space-y-3">
                    {spokenLanguages.map((lang, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-slate-50/50 p-2 rounded-2xl border border-slate-100/80 overflow-hidden">
                        <input className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none px-2" placeholder="e.g. English" value={lang.language} onChange={e => handleUpdateSpokenLanguage(idx, 'language', e.target.value)} />
                        <select value={lang.proficiency} onChange={e => handleUpdateSpokenLanguage(idx, 'proficiency', e.target.value)} className="shrink-0 max-w-[110px] bg-white border border-slate-200 text-xs py-1.5 px-2 rounded-xl outline-none font-medium text-slate-600 shadow-sm cursor-pointer">
                          <option value="Native">Native</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Professional">Professional</option>
                        </select>
                        <button type="button" onClick={() => setSpokenLanguages(spokenLanguages.filter((_, i) => i !== idx))} className="shrink-0 text-rose-400 hover:text-rose-600 px-2 font-black">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

          </div>

          {/* RIGHT COLUMN */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* 1. Personal Information */}
            <GlassCard className="p-6 md:p-8 border-slate-100 rounded-[2rem] bg-white shadow-sm border-b-4 border-b-blue-400">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">👤</div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Personal Information</h3>
                  <p className="text-xs font-semibold text-slate-500">Basic contact and social links</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                <Input label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
                <Input label="Phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                <Input label="Email" value={email} disabled className="bg-slate-50/50 text-slate-400 cursor-not-allowed border-slate-100" />
                <Input label="LinkedIn URL" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
                <Input label="GitHub URL" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} />
                <Input label="Portfolio URL" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} />
                <Input label="City" value={city} onChange={e => setCity(e.target.value)} />
              </div>
            </GlassCard>

            {/* 1.5 Professional Summary */}
            <GlassCard className="p-6 md:p-8 border-slate-100 rounded-[2rem] bg-white shadow-sm border-b-4 border-b-indigo-400">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">📝</div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Professional Summary</h3>
                    <p className="text-xs font-semibold text-slate-500">Appears at the top of your resume</p>
                  </div>
                </div>
                <Button 
                  type="button" 
                  onClick={handleGenerateSummary} 
                  disabled={isGeneratingSummary}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 px-5 rounded-full text-sm transition-colors border border-indigo-200 shadow-sm whitespace-nowrap"
                >
                  {isGeneratingSummary ? 'Generating...' : '✨ Generate with AI'}
                </Button>
              </div>

              {showSummaryPreview ? (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 mb-4 relative animate-in fade-in zoom-in duration-300">
                   <h4 className="text-xs font-black uppercase text-indigo-500 tracking-wider mb-2">AI Generated Preview</h4>
                   <p className="text-sm text-slate-700 leading-relaxed italic">{generatedSummary}</p>
                   <div className="flex gap-3 mt-4">
                      <Button onClick={() => { setProfessionalSummary(generatedSummary); setShowSummaryPreview(false); }} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-full font-bold">Accept</Button>
                      <Button onClick={handleGenerateSummary} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs px-4 py-2 rounded-full font-bold">Regenerate</Button>
                      <Button onClick={() => setShowSummaryPreview(false)} className="bg-transparent hover:bg-slate-100 text-slate-500 text-xs px-4 py-2 rounded-full font-bold">Cancel</Button>
                   </div>
                </div>
              ) : null}

              <div className="relative">
                <textarea 
                  rows={4} 
                  maxLength={700}
                  value={professionalSummary}
                  onChange={e => setProfessionalSummary(e.target.value)}
                  placeholder="Write a concise 2-4 sentence professional summary..."
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-inner resize-none"
                />
                <div className="absolute bottom-3 right-4 text-xs font-bold text-slate-400">
                  {professionalSummary.length}/700
                </div>
              </div>
            </GlassCard>

            {/* 2. Education */}
            <GlassCard className="p-6 md:p-8 border-slate-100 rounded-[2rem] bg-white shadow-sm border-b-4 border-b-purple-400">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">🎓</div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Education Details</h3>
                  <p className="text-xs font-semibold text-slate-500">Academic background (Auto-verified by College)</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="College / University" value={collegeName} disabled className="bg-slate-50/50 text-slate-400 cursor-not-allowed border-slate-100 md:col-span-2" />
                <Input label="Degree" value={degree} onChange={e => setDegree(e.target.value)} placeholder="e.g. B.Tech" />
                <Input label="Branch" value={branch} disabled className="bg-slate-50/50 text-slate-400 cursor-not-allowed border-slate-100" />
                <Input label="Graduation Year" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} />
                <Input label="Current CGPA" value={cgpa} onChange={e => setCgpa(e.target.value)} />
                <Input label="12th Percentage (%)" value={twelfthPercentage} onChange={e => setTwelfthPercentage(e.target.value)} />
                <Input label="10th Percentage (%)" value={tenthPercentage} onChange={e => setTenthPercentage(e.target.value)} />
              </div>
            </GlassCard>

            {/* 3. Technical Skills */}
            <GlassCard className="p-6 md:p-8 border-slate-100 rounded-[2rem] bg-white shadow-sm border-b-4 border-b-emerald-400">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">⚡</div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Technical Skills</h3>
                  <p className="text-xs font-semibold text-slate-500">Categorized tech stack for better ATS matching</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Languages', state: languages, setter: setLanguages, placeholder: 'e.g. JS, Python' },
                  { label: 'Frameworks', state: frameworks, setter: setFrameworks, placeholder: 'e.g. React, Spring' },
                  { label: 'Databases', state: databases, setter: setDatabases, placeholder: 'e.g. Postgres, MongoDB' },
                  { label: 'Cloud / Tools', state: cloudDevops, setter: setCloudDevops, placeholder: 'e.g. AWS, Docker' }
                ].map(section => (
                  <div key={section.label} className="flex flex-col gap-3 bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-100">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{section.label}</label>
                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                      {section.state.map(skill => (
                        <span key={skill} className="bg-white border border-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                          {skill}
                          <button type="button" onClick={() => section.setter(section.state.filter(s => s !== skill))} className="text-slate-300 hover:text-rose-500">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="relative z-10 mt-1">
                      <SkillAutocomplete placeholder={section.placeholder} onSelect={skill => !section.state.includes(skill) && section.setter([...section.state, skill])} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* 4. Experience */}
            {/* 4. Experience */}
            <GlassCard className="p-6 md:p-8 border-slate-100 rounded-[2rem] bg-white shadow-sm border-b-4 border-b-amber-400">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700/80 flex items-center justify-center text-2xl">💼</div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Experience</h3>
                    <p className="text-xs font-semibold text-slate-500">Internships & Work History</p>
                  </div>
                </div>
                <Button type="button" onClick={handleAddExperience} className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold py-1.5 px-5 rounded-full text-sm transition-colors border border-amber-200/60 shadow-sm">
                  + Add New
                </Button>
              </div>
              <div className="space-y-6">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="p-6 rounded-[1.5rem] border border-slate-100 bg-slate-50 relative group">
                    <button onClick={() => handleRemoveExperience(idx)} className="absolute top-4 right-4 text-xs font-bold text-rose-500 hover:bg-rose-100 bg-white shadow-sm px-3 py-1.5 rounded-lg border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-20">
                      <Input label="Company Name *" value={exp.company} onChange={e => handleUpdateExperience(idx, 'company', e.target.value)} />
                      <Input label="Role / Designation *" value={exp.role} onChange={e => handleUpdateExperience(idx, 'role', e.target.value)} />
                      <Input label="Duration (e.g. May 2024 - Jul 2024) *" value={exp.duration} onChange={e => handleUpdateExperience(idx, 'duration', e.target.value)} />
                      <Input label="Location" value={exp.location || ''} onChange={e => handleUpdateExperience(idx, 'location', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Work Summary</label>
                      <textarea rows={3} placeholder="Describe your responsibilities and achievements..." value={exp.summary || ''} onChange={e => handleUpdateExperience(idx, 'summary', e.target.value)} className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-inner w-full" />
                    </div>
                  </div>
                ))}
                {experiences.length === 0 && (
                  <div className="text-center py-10 text-slate-400/80 font-medium border-[2px] border-dashed border-amber-200/50 bg-amber-50/20 rounded-[2rem]">
                    No experience added yet.
                  </div>
                )}
              </div>
            </GlassCard>

            {/* 5. Projects */}
            <GlassCard className="p-6 md:p-8 border-slate-100 rounded-[2rem] bg-white shadow-sm border-b-4 border-b-teal-400">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl">🚀</div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Projects</h3>
                    <p className="text-xs font-semibold text-slate-500">Showcase your best work</p>
                  </div>
                </div>
                <Button type="button" onClick={handleAddProject} className="bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold py-1.5 px-5 rounded-full text-sm transition-colors border border-teal-200/60 shadow-sm">
                  + Add New
                </Button>
              </div>
              <div className="space-y-6">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-6 rounded-[1.5rem] border border-slate-100 bg-slate-50 relative group">
                    <button onClick={() => handleRemoveProject(idx)} className="absolute top-4 right-4 text-xs font-bold text-rose-500 hover:bg-rose-100 bg-white shadow-sm px-3 py-1.5 rounded-lg border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-20">
                      <Input label="Project Name *" value={proj.name} onChange={e => handleUpdateProject(idx, 'name', e.target.value)} />
                      <Input label="Tech Stack (Comma-separated) *" value={proj.techStack.join(', ')} onChange={e => handleUpdateProject(idx, 'techStack', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} />
                      <Input label="GitHub Link" value={proj.github || ''} onChange={e => handleUpdateProject(idx, 'github', e.target.value)} />
                      <Input label="Live Demo Link" value={proj.liveDemo || ''} onChange={e => handleUpdateProject(idx, 'liveDemo', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Project Description</label>
                      <textarea rows={3} placeholder="Describe the problem, solution, and your role..." value={proj.description || ''} onChange={e => handleUpdateProject(idx, 'description', e.target.value)} className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-inner w-full" />
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-10 text-slate-400/80 font-medium border-[2px] border-dashed border-teal-200/50 bg-teal-50/20 rounded-[2rem]">
                    No projects added yet.
                  </div>
                )}
              </div>
            </GlassCard>

            {/* 6. Achievements */}
            <GlassCard className="p-6 md:p-8 border-slate-100 rounded-[2rem] bg-white shadow-sm border-b-4 border-b-yellow-400">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center text-2xl">🏆</div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Achievements</h3>
                    <p className="text-xs font-semibold text-slate-500">Awards & Certifications</p>
                  </div>
                </div>
                <Button type="button" onClick={handleAddAchievement} className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-bold py-1.5 px-5 rounded-full text-sm transition-colors border border-yellow-200/60 shadow-sm">
                  + Add New
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((ach, idx) => (
                  <div key={idx} className="p-5 rounded-[1.5rem] border border-slate-100 bg-slate-50 relative group">
                    <button onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))} className="absolute top-3 right-3 text-rose-400 hover:text-rose-600 font-black">×</button>
                    <div className="space-y-3 pr-6">
                      <Input label="Title *" value={ach.title} onChange={e => handleUpdateAchievement(idx, 'title', e.target.value)} />
                      <Input label="Issuer / Subtitle" value={ach.subtitle || ''} onChange={e => handleUpdateAchievement(idx, 'subtitle', e.target.value)} />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                        <select value={ach.type} onChange={e => handleUpdateAchievement(idx, 'type', e.target.value)} className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 text-sm shadow-inner w-full outline-none">
                          <option value="award">Award</option>
                          <option value="certification">Certification</option>
                          <option value="coding">Coding Competition</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>
        </div>

      </div>

      {/* Floating Save Pill */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-slate-200 p-2.5 z-50 flex gap-6 items-center rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.08)] w-[90%] max-w-md md:max-w-lg justify-between">
        <div className="hidden sm:block pl-4 py-1">
           <p className="text-sm font-black text-slate-800">Unsaved Changes</p>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Save to update profile</p>
        </div>
        <div className="sm:hidden pl-4 py-1">
           <p className="text-sm font-black text-slate-800">Unsaved</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-auto bg-student-primary text-white shadow-md hover:scale-105 transition-all duration-300 font-bold px-8 py-2.5 rounded-full text-sm shrink-0">
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      <ResumeSyncModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
        parsedData={parsedResumeData} 
        onImport={handleImportParsedData} 
      />

    </DashboardLayout>
  );
}
