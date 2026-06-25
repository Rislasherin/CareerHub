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
import {
  StudentProfile,
  StudentExperience,
  StudentProject
} from '@/types/student';
import { toast } from 'sonner';

export default function StudentProfilePage() {
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

  // Input states for comma-separated skills
  const [languagesInput, setLanguagesInput] = useState('');
  const [frameworksInput, setFrameworksInput] = useState('');
  const [databasesInput, setDatabasesInput] = useState('');
  const [cloudDevopsInput, setCloudDevopsInput] = useState('');
  const [otherToolsInput, setOtherToolsInput] = useState('');
  const [aiMlInput, setAiMlInput] = useState('');

  // Experiences & Projects lists
  const [experiences, setExperiences] = useState<StudentExperience[]>([]);
  const [projects, setProjects] = useState<StudentProject[]>([]);

  // Profile completion score
  const [completionPercentage, setCompletionPercentage] = useState(85);

  const calculateProgress = (profile: StudentProfile) => {
    let score = 30; // Base verified score
    if (profile.phoneNumber) score += 10;
    if (profile.linkedinUrl) score += 10;
    if (profile.githubUrl) score += 10;
    if (profile.portfolioUrl) score += 10;
    if (profile.skills && Object.values(profile.skills).some(arr => Array.isArray(arr) && arr.length > 0)) score += 15;
    if (profile.experience && profile.experience.length > 0) score += 15;
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
          setLanguagesInput((profile.skills.languages || []).join(', '));

          setFrameworks(profile.skills.frameworks || []);
          setFrameworksInput((profile.skills.frameworks || []).join(', '));

          setDatabases(profile.skills.databases || []);
          setDatabasesInput((profile.skills.databases || []).join(', '));

          setCloudDevops(profile.skills.cloudDevops || []);
          setCloudDevopsInput((profile.skills.cloudDevops || []).join(', '));

          setOtherTools(profile.skills.otherTools || []);
          setOtherToolsInput((profile.skills.otherTools || []).join(', '));

          setAiMl(profile.skills.aiMl || []);
          setAiMlInput((profile.skills.aiMl || []).join(', '));
        }

        // Map experience & projects
        setExperiences(profile.experience || [
          {
            company: 'Flipkart',
            role: 'SWE Intern',
            duration: 'May 2024 - Jul 2024',
            location: 'Bangalore (Remote)',
            summary: 'Built real-time recommendation engine using collaborative filtering. Deployed on AWS Lambda. Improved CTR by 23%.'
          }
        ]);
        setProjects(profile.projects || [
          {
            name: 'CodeCollab - Real-time Code Editor',
            techStack: ['React', 'Node.js', 'WebSocket', 'Redis'],
            github: 'github.com/antypea/codecollab',
            liveDemo: 'codecollab.vercel.app',
            description: 'Multi-user real-time code editor with execution support. 500+ GitHub stars, featured on Product Hunt.'
          }
        ]);

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
        languages: languagesInput.split(',').map(s => s.trim()).filter(Boolean),
        frameworks: frameworksInput.split(',').map(s => s.trim()).filter(Boolean),
        databases: databasesInput.split(',').map(s => s.trim()).filter(Boolean),
        cloudDevops: cloudDevopsInput.split(',').map(s => s.trim()).filter(Boolean),
        otherTools: otherToolsInput.split(',').map(s => s.trim()).filter(Boolean),
        aiMl: aiMlInput.split(',').map(s => s.trim()).filter(Boolean)
      };

      const payload: Partial<StudentProfile> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        city: city.trim(),
        degree: degree.trim(),
        branch: branch.trim(),
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
        cgpa: cgpa ? Number(cgpa) : undefined,
        tenthPercentage: tenthPercentage ? Number(tenthPercentage) : undefined,
        twelfthPercentage: twelfthPercentage ? Number(twelfthPercentage) : undefined,
        activeBacklogs: activeBacklogs ? Number(activeBacklogs) : undefined,
        skills: parsedSkills,
        experience: experiences.filter(exp => exp.company.trim() && exp.role.trim()),
        projects: projects.filter(proj => proj.name.trim() && proj.techStack.length > 0)
      };

      const updated = await updateStudentProfile(payload);
      toast.success('Profile successfully saved!');
      calculateProgress(updated);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to save student profile');
    } finally {
      setSaving(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Visible to HR & Companies · Keep it updated</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-student-primary text-white shadow-xl hover:scale-105 transition-all duration-300 font-bold px-8 py-3 rounded-2xl"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        {/* Interactive Banner Profile Card */}
        <GlassCard className="p-8 border-slate-100 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden mb-8 shadow-2xl">
          {/* Subtle glowing backgrounds */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-student-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar Initials */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-black text-3xl text-white shadow-lg shrink-0">
              {firstName.charAt(0)}{lastName.charAt(0)}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start mb-2">
                <h2 className="text-3xl font-black tracking-tight">{firstName} {lastName}</h2>
                <span className="bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Open to Work
                </span>
              </div>
              <p className="text-slate-300 text-sm font-medium mb-3">
                {collegeName} · {branch} · Batch {graduationYear} · CGPA {cgpa}
              </p>

              {/* Profile tag overview */}
              <div className="flex flex-wrap gap-1.5 justify-center md:justify-start text-xs text-slate-400">
                {languages.slice(0, 3).map(lang => (
                  <span key={lang} className="bg-white/10 px-2 py-0.5 rounded-lg">{lang}</span>
                ))}
                {frameworks.slice(0, 2).map(fw => (
                  <span key={fw} className="bg-white/10 px-2 py-0.5 rounded-lg">{fw}</span>
                ))}
              </div>
            </div>

            {/* Profile complete indicator */}
            <div className="text-center md:text-right shrink-0">
              <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-2xl backdrop-blur-md mb-2">
                <span className="text-emerald-400 font-black mr-1.5">✓</span>
                <span className="text-xs font-bold text-slate-200">{completionPercentage}% Profile Complete</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">VISIBLE TO HR & COMPANIES</p>
            </div>
          </div>
        </GlassCard>

        {/* Warning Callout info */}
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-semibold mb-8 shadow-sm">
          <span className="text-lg">👁</span>
          <span>This profile is exactly what HR/Companies see. Fill all sections for maximum recruiter visibility.</span>
        </div>

        {/* Sections */}
        <div className="space-y-8">

          {/* 1. Personal Information */}
          <GlassCard className="p-8 md:p-10 border-slate-100 rounded-[2.5rem] bg-white shadow-sm">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>👤</span> Personal Information
              </h3>
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                ✓ Complete
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <Input label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
              <Input label="Phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
              <Input label="Email" value={email} disabled className="bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100 shadow-inner" />
              <Input label="LinkedIn URL" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
              <Input label="GitHub URL" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} />
              <Input label="Portfolio URL" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} />
              <Input label="City" value={city} onChange={e => setCity(e.target.value)} />
            </div>
          </GlassCard>

          {/* 2. Education (PREFILLED fields) */}
          <GlassCard className="p-8 md:p-10 border-slate-100 rounded-[2.5rem] bg-white shadow-sm relative">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>🎓</span> Education
              </h3>
              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 flex items-center gap-1">
                🔒 Verified Institution & Branch
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="College / University" value={collegeName} disabled className="bg-slate-50/70 text-slate-400 cursor-not-allowed border-slate-100/50 shadow-inner" />
              <Input label="Degree" value={degree} onChange={e => setDegree(e.target.value)} placeholder="e.g. B.Tech" />
              <Input label="Branch" value={branch} disabled className="bg-slate-50/70 text-slate-400 cursor-not-allowed border-slate-100/50 shadow-inner" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Input label="Graduation Year" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} placeholder="e.g. 2025" />
              <Input label="CGPA" value={cgpa} onChange={e => setCgpa(e.target.value)} placeholder="e.g. 9.10" />
              <Input label="Active Backlogs" value={activeBacklogs} onChange={e => setActiveBacklogs(e.target.value)} placeholder="e.g. 0" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Input label="12th %" value={twelfthPercentage} onChange={e => setTwelfthPercentage(e.target.value)} placeholder="e.g. 96.4" />
              <Input label="10th %" value={tenthPercentage} onChange={e => setTenthPercentage(e.target.value)} placeholder="e.g. 98.2" />
            </div>
          </GlassCard>

          {/* 3. Technical Skills */}
          <GlassCard className="p-8 md:p-10 border-slate-100 rounded-[2.5rem] bg-white shadow-sm">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>🔧</span> Technical Skills
              </h3>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Comma-separated lists</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Languages" placeholder="e.g. Python, JavaScript, Java" value={languagesInput} onChange={e => setLanguagesInput(e.target.value)} />
              <Input label="Frameworks" placeholder="e.g. React, Node.js, Express" value={frameworksInput} onChange={e => setFrameworksInput(e.target.value)} />
              <Input label="Databases" placeholder="e.g. PostgreSQL, MongoDB, Redis" value={databasesInput} onChange={e => setDatabasesInput(e.target.value)} />
              <Input label="Cloud / DevOps" placeholder="e.g. AWS, GCP, Docker, Kubernetes" value={cloudDevopsInput} onChange={e => setCloudDevopsInput(e.target.value)} />
              <Input label="Other Tools" placeholder="e.g. Git, Linux, Figma, TensorFlow" value={otherToolsInput} onChange={e => setOtherToolsInput(e.target.value)} />
              <Input label="AI / ML" placeholder="e.g. PyTorch, HuggingFace, LangChain" value={aiMlInput} onChange={e => setAiMlInput(e.target.value)} />
            </div>
          </GlassCard>

          {/* 4. Work Experience */}
          <GlassCard className="p-8 md:p-10 border-slate-100 rounded-[2.5rem] bg-white shadow-sm">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>💼</span> Work Experience / Internships
              </h3>
              <Button type="button" onClick={handleAddExperience} className="bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-700 font-bold py-1.5 px-4 rounded-xl text-xs">
                + Add Experience
              </Button>
            </div>

            <div className="space-y-8">
              {experiences.map((exp, idx) => (
                <div key={idx} className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 relative">
                  <button
                    onClick={() => handleRemoveExperience(idx)}
                    className="absolute top-4 right-4 text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-100"
                  >
                    Remove
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input label="Company Name *" value={exp.company} onChange={e => handleUpdateExperience(idx, 'company', e.target.value)} />
                    <Input label="Role / Designation *" value={exp.role} onChange={e => handleUpdateExperience(idx, 'role', e.target.value)} />
                    <Input label="Duration (e.g. May 2024 - Jul 2024) *" value={exp.duration} onChange={e => handleUpdateExperience(idx, 'duration', e.target.value)} />
                    <Input label="Location" value={exp.location || ''} onChange={e => handleUpdateExperience(idx, 'location', e.target.value)} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Work Summary (Shown to HR)</label>
                    <textarea
                      rows={3}
                      placeholder="Write brief points on what you built, tech stack used, and metrics/impact..."
                      value={exp.summary || ''}
                      onChange={e => handleUpdateExperience(idx, 'summary', e.target.value)}
                      className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 5. Projects */}
          <GlassCard className="p-8 md:p-10 border-slate-100 rounded-[2.5rem] bg-white shadow-sm">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>🔗</span> Projects
              </h3>
              <Button type="button" onClick={handleAddProject} className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 font-bold py-1.5 px-4 rounded-xl text-xs">
                + Add Project
              </Button>
            </div>

            <div className="space-y-8">
              {projects.map((proj, idx) => (
                <div key={idx} className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 relative">
                  <button
                    onClick={() => handleRemoveProject(idx)}
                    className="absolute top-4 right-4 text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-100"
                  >
                    Remove
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input label="Project Name *" value={proj.name} onChange={e => handleUpdateProject(idx, 'name', e.target.value)} />
                    <Input
                      label="Tech Stack (Comma-separated) *"
                      value={proj.techStack.join(', ')}
                      onChange={e => handleUpdateProject(idx, 'techStack', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                    />
                    <Input label="GitHub Link" value={proj.github || ''} onChange={e => handleUpdateProject(idx, 'github', e.target.value)} />
                    <Input label="Live Demo Link" value={proj.liveDemo || ''} onChange={e => handleUpdateProject(idx, 'liveDemo', e.target.value)} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Project Description (Shown to HR)</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Built multi-user real-time collaborative text editor with socket.io support. Scaled using Redis adapter..."
                      value={proj.description || ''}
                      onChange={e => handleUpdateProject(idx, 'description', e.target.value)}
                      className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

      </div>
    </DashboardLayout>
  );
}
