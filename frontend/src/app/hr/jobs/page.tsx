'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Stepper } from '@/components/shared/Stepper';
import { SkillAutocomplete } from '@/components/shared/SkillAutocomplete';
import {
  getHRJobs,
  postJob,
  updateJob,
  closeJob,
  deleteJob
} from '@/services/hr/job.service';
import {
  Job,
  InterviewRoundConfig,
  EligibilityCriteria
} from '@/types/job';
import { OrganizationService } from '@/services/organization/organization.service';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

import { PLATFORM_DEGREES, PLATFORM_BRANCHES } from '@/constants/academic';

export default function HRJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [editJobId, setEditJobId] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [organizations, setOrganizations] = useState<{ id: string; name: string; activeBranches?: string[] }[]>([]);

  // Wizard Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('ALL');
  const [jobType, setJobType] = useState('');
  const [deadline, setDeadline] = useState('');
  const [openings, setOpenings] = useState('1');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [workMode, setWorkMode] = useState<'on-site' | 'remote' | 'hybrid' | ''>('');
  const [location, setLocation] = useState('');
  const [salaryType, setSalaryType] = useState<'per_month' | 'per_year' | ''>('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [interviewMode, setInterviewMode] = useState<'online' | 'offline' | 'hybrid' | ''>('');
  const [description, setDescription] = useState('');

  // Skills
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [noSkillsRequired, setNoSkillsRequired] = useState(false);

  // Eligibility
  const [minCGPA, setMinCGPA] = useState('6.0');
  const [allowedBacklogs, setAllowedBacklogs] = useState('0');
  const [passingYear, setPassingYear] = useState('');
  const [degreeInput, setDegreeInput] = useState('');
  const [degreeTypes, setDegreeTypes] = useState<string[]>([]);
  const [allDegreesSelected, setAllDegreesSelected] = useState(false);
  const [branchInput, setBranchInput] = useState('');
  const [customBranchInput, setCustomBranchInput] = useState('');
  const [branches, setBranches] = useState<string[]>([]);
  const [allBranchesSelected, setAllBranchesSelected] = useState(false);

  // Interview Rounds configuration
  const [rounds, setRounds] = useState<InterviewRoundConfig[]>([
    { roundNumber: 1, name: 'Aptitude Test', type: 'aptitude', description: 'Basic cognitive and quantitative analysis' },
    { roundNumber: 2, name: 'Technical Round 1', type: 'technical', description: 'Core problem solving and CS fundamentals' }
  ]);
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundType, setNewRoundType] = useState<'aptitude' | 'coding' | 'technical' | 'hr' | 'group_discussion' | ''>('');
  const [newRoundDesc, setNewRoundDesc] = useState('');

  // Selected Job Details Modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [matrixTab, setMatrixTab] = useState<'reviewed' | 'pending' | 'all'>('reviewed');

  // Fetch Jobs list
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHRJobs(page, limit, statusFilter || undefined, searchQuery);
      setJobs(data.jobs);
      setTotal(data.total);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to fetch job postings');
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, searchQuery]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const list = await OrganizationService.getOrganizations();
        setOrganizations(list);
      } catch (err) {
        console.error('Failed to load organizations', err);
      }
    };
    fetchOrgs();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'post-job') {
        setShowWizard(true);
        // Clear param so it doesn't reopen if refreshed
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const handleCloseJob = async (jobId: string) => {
    const result = await Swal.fire({
      title: 'Close Job Opening?',
      text: 'Are you sure you want to close this job opening? This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Close it',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
        title: 'text-2xl font-black text-slate-900 mb-2',
        confirmButton: 'bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl mr-2',
        cancelButton: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/50 shadow-sm font-bold px-6 py-3 rounded-2xl'
      },
      buttonsStyling: false
    });

    if (!result.isConfirmed) return;

    try {
      await closeJob(jobId);
      await Swal.fire({
        title: 'Closed!',
        text: 'Job successfully marked as closed!',
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
          title: 'text-2xl font-black text-slate-900 mb-2',
          confirmButton: 'bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl shadow-xl'
        },
        buttonsStyling: false
      });
      fetchJobs();
      setShowDetailsModal(false);
    } catch (err: unknown) {
      Swal.fire({
        title: 'Error',
        text: (err as Error)?.message || 'Failed to close job openings',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
          title: 'text-2xl font-black text-slate-900 mb-2',
          confirmButton: 'bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl shadow-xl'
        },
        buttonsStyling: false
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    const result = await Swal.fire({
      title: 'Delete Job Posting?',
      text: 'Are you sure you want to delete this job posting? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete it',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
        title: 'text-2xl font-black text-slate-900 mb-2',
        confirmButton: 'bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl mr-2',
        cancelButton: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/50 shadow-sm font-bold px-6 py-3 rounded-2xl'
      },
      buttonsStyling: false
    });

    if (!result.isConfirmed) return;

    try {
      await deleteJob(jobId);
      await Swal.fire({
        title: 'Deleted!',
        text: 'Job posting successfully deleted!',
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
          title: 'text-2xl font-black text-slate-900 mb-2',
          confirmButton: 'bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl shadow-xl'
        },
        buttonsStyling: false
      });
      fetchJobs();
      setShowDetailsModal(false);
    } catch (err: unknown) {
      Swal.fire({
        title: 'Error',
        text: (err as Error)?.message || 'Failed to delete job posting',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
          title: 'text-2xl font-black text-slate-900 mb-2',
          confirmButton: 'bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl shadow-xl'
        },
        buttonsStyling: false
      });
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAddDegree = () => {
    if (degreeInput.trim() && !degreeTypes.includes(degreeInput.trim())) {
      setDegreeTypes([...degreeTypes, degreeInput.trim()]);
      setDegreeInput('');
    }
  };

  const handleRemoveDegree = (degree: string) => {
    setDegreeTypes(degreeTypes.filter((d) => d !== degree));
  };

  const handleAddBranch = () => {
    const val = branchInput === 'custom' ? customBranchInput.trim() : branchInput.trim();
    if (val && !branches.includes(val)) {
      setBranches([...branches, val]);
      if (branchInput !== 'custom') setBranchInput('');
      setCustomBranchInput('');
    }
  };

  const handleRemoveBranch = (branch: string) => {
    setBranches(branches.filter((b) => b !== branch));
  };

  const handleAddRound = () => {
    if (!newRoundName.trim() || !newRoundType) return;
    const newRound: InterviewRoundConfig = {
      roundNumber: rounds.length + 1,
      name: newRoundName.trim(),
      type: newRoundType as any,
      description: newRoundDesc.trim() || undefined
    };
    setRounds([...rounds, newRound]);
    setNewRoundName('');
    setNewRoundDesc('');
  };

  const handleRemoveRound = (idx: number) => {
    const updated = rounds.filter((_, i) => i !== idx).map((r, i) => ({
      ...r,
      roundNumber: i + 1
    }));
    setRounds(updated);
  };

    const handleEditJob = (job: Job) => {
    setEditJobId(job.id || null);
    setTitle(job.title);
    setCategory(job.category);
    setSelectedOrgId(job.collegeId);
    setJobType(job.type);
    setDeadline(new Date(job.deadline).toISOString().split('T')[0]);
    setOpenings(String(job.openings));
    setExperienceLevel(job.experienceLevel);
    setNoticePeriod(job.noticePeriod);
    setWorkMode(job.workMode);
    setLocation(job.location);
    setSalaryType(job.salaryType);
    setMinSalary(String(job.minSalary));
    setMaxSalary(String(job.maxSalary));
    setInterviewMode(job.interviewMode);
    setDescription(job.description);
    setSkills(job.requiredSkills || []);
    setNoSkillsRequired(job.requiredSkills?.includes("All Skills Welcome") || false);
    setMinCGPA(String(job.eligibility.minCGPA));
    setAllowedBacklogs(String(job.eligibility.allowedBacklogs));
    setPassingYear(String(job.eligibility.passingYear));
    
    // Parse old single degreeType string into array if needed
    const degrees = job.eligibility.degreeType 
      ? job.eligibility.degreeType.split(',').map(d => d.trim()).filter(d => d) 
      : [];
    setDegreeTypes(degrees);
    setAllDegreesSelected(degrees.length === 0 || job.eligibility.degreeType === 'Any Degree');
    
    setBranches(job.eligibility.eligibleBranches || []);
    setAllBranchesSelected(job.eligibility.eligibleBranches?.length === 0);
    setRounds(job.rounds || []);
    setWizardStep(1);
    setShowWizard(true);
  };

  const resetWizard = () => {
    setTitle('');
    setCategory('');
    setJobType('');
    setDeadline('');
    setOpenings('1');
    setExperienceLevel('');
    setNoticePeriod('');
    setWorkMode('');
    setLocation('');
    setSalaryType('');
    setMinSalary('');
    setMaxSalary('');
    setInterviewMode('');
    setDescription('');
    setSkills([]);
    setNoSkillsRequired(false);
    setMinCGPA('6.0');
    setAllowedBacklogs('0');
    setPassingYear('2026');
    setDegreeInput('');
    setDegreeTypes([]);
    setAllDegreesSelected(false);
    setBranches([]);
    setAllBranchesSelected(false);
    setRounds([
      { roundNumber: 1, name: 'Aptitude Test', type: 'aptitude', description: 'Basic cognitive and quantitative analysis' },
      { roundNumber: 2, name: 'Technical Round 1', type: 'technical', description: 'Core problem solving and CS fundamentals' }
    ]);
    setSelectedOrgId('ALL');
    setWizardStep(1);
    setShowWizard(false);
    setEditJobId(null);
  };

  const validateCurrentStep = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (wizardStep === 1) {
      if (!title.trim()) errs.title = 'Job Title is required';
      if (!category.trim()) errs.category = 'Job Category is required';
      if (!jobType) errs.jobType = 'Job Type is required';
      if (!deadline) {
        errs.deadline = 'Application Deadline is required';
      } else {
        const deadlineDate = new Date(deadline);
        if (isNaN(deadlineDate.getTime())) errs.deadline = 'Invalid date';
        else if (deadlineDate < new Date()) errs.deadline = 'Cannot be in the past';
      }
    } else if (wizardStep === 2) {
      const openingsNum = Number(openings);
      if (isNaN(openingsNum) || openingsNum < 1) errs.openings = 'Must be at least 1';
      if (!experienceLevel.trim()) errs.experienceLevel = 'Experience level is required';
      if (!noticePeriod.trim()) errs.noticePeriod = 'Notice period is required';
      if (!workMode) errs.workMode = 'Work Mode is required';
      if (workMode !== 'remote' && !location.trim()) errs.location = 'Office location is required for on-site/hybrid';
      if (!salaryType) errs.salaryType = 'Salary Type is required';
      if (!interviewMode) errs.interviewMode = 'Interview Mode is required';
      
      const minSal = Number(minSalary);
      const maxSal = Number(maxSalary);
      if (!minSalary || isNaN(minSal) || minSal <= 0) errs.minSalary = 'Valid min salary required (> 0)';
      if (!maxSalary || isNaN(maxSal) || maxSal <= 0) errs.maxSalary = 'Valid max salary required (> 0)';
      if (maxSal < minSal) errs.maxSalary = 'Max salary cannot be < min salary';
    } else if (wizardStep === 3) {
      const cgpa = Number(minCGPA);
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) errs.minCGPA = 'Must be between 0.0 and 10.0';
      const backlogs = Number(allowedBacklogs);
      if (isNaN(backlogs) || backlogs < 0) errs.allowedBacklogs = 'Must be a non-negative number';
      if (!passingYear.trim()) errs.passingYear = 'Passing year is required';
      if (!allDegreesSelected && degreeTypes.length === 0) errs.degreeTypes = 'Add at least one degree or select "Open to All Degrees"';
      if (!allBranchesSelected && branches.length === 0) errs.branches = 'Add at least one branch or select "Open to All"';
      if (!noSkillsRequired && skills.length === 0) errs.skills = 'Add at least one skill or select "No specific skills"';
      if (!description.trim() || description.trim().length < 10) errs.description = 'Description is required (min 10 chars)';
    } else if (wizardStep === 4) {
      if (rounds.length === 0) errs.rounds = 'Configure at least one selection stage';
    }
    return errs;
  };

  const currentErrors = validateCurrentStep();
  const isStepValid = Object.keys(currentErrors).length === 0;

  const handleContinue = () => {
    if (!isStepValid) return;
    setWizardStep(wizardStep + 1);
  };

  const handleSubmitJob = async () => {
    if (!title || !category || !deadline || !minSalary || !maxSalary) {
      Swal.fire({
        title: 'Required Fields',
        text: 'Please fill out all required fields before submitting',
        icon: 'warning',
        confirmButtonText: 'Ok',
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
          title: 'text-2xl font-black text-slate-900 mb-2',
          confirmButton: 'bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl shadow-xl'
        },
        buttonsStyling: false
      });
      return;
    }

    const payload = {
      title,
      category,
      collegeId: selectedOrgId,
      type: jobType,
      deadline,
      openings: Number(openings),
      experienceLevel,
      noticePeriod,
      workMode,
      location,
      salaryType,
      minSalary: Number(minSalary),
      maxSalary: Number(maxSalary),
      interviewMode,
      description,
      requiredSkills: skills.length > 0 ? skills : (noSkillsRequired ? ["All Skills Welcome"] : [category]),
      preferredSkills: [],
      eligibility: {
        minCGPA: Number(minCGPA),
        allowedBacklogs: Number(allowedBacklogs),
        eligibleBranches: allBranchesSelected ? [] : (branches.length > 0 ? branches : ['Computer Science', 'Information Technology']),
        passingYear: Number(passingYear),
        degreeType: allDegreesSelected ? 'Any Degree' : degreeTypes.join(', ')
      },
      rounds
    };

    try {
      if (editJobId) { await updateJob(editJobId, payload as any); } else { await postJob(payload as any); }
      await Swal.fire({
        title: 'Job Submitted!',
        text: editJobId ? 'Job vacancy has been updated successfully!' : 'Job vacancy has been created and submitted for college approval successfully!',
        icon: 'success',
        confirmButtonText: 'Awesome',
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
          title: 'text-2xl font-black text-slate-900 mb-2',
          confirmButton: 'bg-company-primary text-white font-bold px-6 py-3 rounded-2xl shadow-xl'
        },
        buttonsStyling: false
      });
      resetWizard();
      fetchJobs();
    } catch (err: unknown) {
      Swal.fire({
        title: 'Submission Failed',
        text: (err as Error)?.message || 'Failed to submit job posting',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
          title: 'text-2xl font-black text-slate-900 mb-2',
          confirmButton: 'bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl shadow-xl'
        },
        buttonsStyling: false
      });
    }
  };

  const getStatusBadgeClass = (status: Job['status']) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'pending_review':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'closed':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status: Job['status']) => {
    if (status === 'pending_review') return 'Pending Approval';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getJobStatusBadgeClass = (job: Job) => {
    if (job.collegeId === 'ALL') {
      if (job.status === 'closed') {
        return 'bg-slate-50 text-slate-600 border-slate-200';
      }
      const approvedCount = job.approvedColleges?.length || 0;
      if (approvedCount > 0) {
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      }
      return 'bg-amber-50 text-amber-700 border-amber-100';
    }
    return getStatusBadgeClass(job.status);
  };

  const getJobStatusLabel = (job: Job) => {
    if (job.status === 'closed') return 'Closed';
    if (job.collegeId === 'ALL') {
      const approvedCount = job.approvedColleges?.length || 0;
      if (approvedCount > 0) {
        return `Approved by ${approvedCount} College${approvedCount > 1 ? 's' : ''}`;
      }
      return 'Pending Campus Reviews';
    }
    return getStatusLabel(job.status);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Job Openings</h1>
            <p className="text-slate-500 font-medium">Create job vacancies and recruit students directly from campuses.</p>
          </div>
          <Button
            onClick={() => setShowWizard(true)}
            className="bg-company-primary text-white shadow-xl hover:scale-105 transition-all duration-300 font-bold px-6 py-3 rounded-2xl flex items-center justify-center gap-2"
          >
            <span>+</span> Post a New Job
          </Button>
        </div>

        {/* Search & Tabs Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          {/* Tabs */}
          <div className="flex gap-2 p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/50 w-full md:w-auto overflow-x-auto">
            {['', 'pending_review', 'approved', 'rejected', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${statusFilter === status
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                {status === '' ? 'All Jobs' : getStatusLabel(status as any)}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-slate-200/60 px-5 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-sm"
            />
          </div>
        </div>

        {/* Jobs Table List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-company-primary"></div>
          </div>
        ) : error ? (
          <GlassCard className="p-8 text-center text-rose-500 rounded-3xl border-rose-100">
            {error}
          </GlassCard>
        ) : jobs.length === 0 ? (
          <GlassCard className="p-20 text-center rounded-[2.5rem] border-slate-100/50">
            <p className="text-slate-400 font-bold text-lg mb-2">No job listings found</p>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">Get started by posting a new job vacancy request.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <GlassCard
                key={job.id}
                className="p-6 rounded-[2rem] border-slate-100 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                onClick={() => {
                  setSelectedJob(job);
                  setShowDetailsModal(true);
                }}
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getJobStatusBadgeClass(job)}`}>
                      {getJobStatusLabel(job)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{job.type.replace('_', ' ')}</span>
                  </div>

                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-snug mb-2 hover:text-company-primary transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">{job.category}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Openings</span>
                      <span className="text-slate-800 font-bold">{job.openings}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Salary</span>
                      <span className="text-slate-800 font-bold">
                        ₹{(job.minSalary / 100000).toFixed(1)}L - ₹{(job.maxSalary / 100000).toFixed(1)}L {job.salaryType === 'per_month' ? '/mo' : '/yr'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Deadline</span>
                      <span className="text-slate-800 font-bold">{new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="w-full bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJob(job);
                      setShowDetailsModal(true);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditJob(job);
                    }}
                  >
                    Edit
                  </Button>
                  {job.status === 'approved' && (
                    <Button
                      variant="ghost"
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2 px-3 rounded-xl text-xs whitespace-nowrap"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseJob(job.id);
                      }}
                    >
                      Close
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-3 rounded-xl text-xs whitespace-nowrap border-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteJob(job.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Post Job wizard overlay */}
        {showWizard && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-md flex justify-center items-center p-4">
            <style>{`
              @keyframes modalScaleIn {
                from { opacity: 0; transform: scale(0.96) translateY(12px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
              }
              .animate-modal-scale {
                animation: modalScaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
              }
            `}</style>
            <GlassCard className="w-full max-w-3xl p-6 md:p-10 rounded-[2rem] shadow-2xl relative bg-white max-h-[90vh] overflow-y-auto animate-modal-scale border border-slate-100/50">
              <button
                onClick={resetWizard}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 text-xl font-bold w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 transition-all hover:rotate-90 duration-300"
              >
                ✕
              </button>

              <div className="mb-8 text-center">
                <h2 className="text-2xl font-black text-slate-900 mb-1.5 tracking-tight">Create Job Posting</h2>
                <p className="text-slate-400 font-medium text-xs">Register a new job vacancy with college approval.</p>
              </div>

              {/* Stepper */}
              <Stepper
                roleType="hr"
                currentStep={wizardStep}
                steps={[
                  { title: 'Vacancy Info' },
                  { title: 'Job Details' },
                  { title: 'Eligibility' },
                  { title: 'Rounds' },
                  { title: 'Submit' }
                ]}
              />

              {/* Wizard Body */}
              <div className="mt-8">
                {/* Step 1 */}
                {wizardStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Job Title *" placeholder="e.g. Associate Software Engineer" value={title} onChange={(e) => setTitle(e.target.value)} error={currentErrors.title} />
                    <Input label="Job Category *" placeholder="e.g. Engineering / Tech" value={category} onChange={(e) => setCategory(e.target.value)} error={currentErrors.category} />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Colleges *</label>
                      <div className="bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-2xl text-indigo-600 font-bold text-sm h-[50px] flex items-center shadow-inner">
                        🌐 All Partner Colleges (Global Vacancy)
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Type *</label>
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className="bg-slate-50/50 border border-slate-200/80 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner h-[50px]"
                      >
                        <option value="" disabled>Select Job Type...</option>
                        <option value="full_time">Full-Time Vacancy</option>
                        <option value="internship">Internship Vacancy</option>
                        <option value="part_time">Part-Time</option>
                        <option value="contract">Contractor</option>
                      </select>
                      {currentErrors.jobType && <p className="text-rose-500 text-[10px] font-bold uppercase mt-1">{currentErrors.jobType}</p>}
                    </div>

                    <Input type="date" label="Application Deadline *" value={deadline} onChange={(e) => setDeadline(e.target.value)} error={currentErrors.deadline} />
                  </div>
                )}

                {/* Step 2 */}
                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Input type="number" label="Openings Available *" min={1} value={openings} onChange={(e) => setOpenings(e.target.value)} error={currentErrors.openings} />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience Level *</label>
                        <select
                          value={["Fresher", "0-1 years", "1-2 years", "2-3 years", "3-5 years", "5+ years", ""].includes(experienceLevel) ? experienceLevel : "Other"}
                          onChange={(e) => {
                             if(e.target.value !== "Other") setExperienceLevel(e.target.value);
                             else setExperienceLevel("Custom");
                          }}
                          className={`bg-slate-50/50 border ${currentErrors.experienceLevel ? 'border-rose-500/50' : 'border-slate-200/80'} px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner h-[50px]`}
                        >
                          <option value="" disabled>Select Experience...</option>
                          <option value="Fresher">Fresher (0 years)</option>
                          <option value="0-1 years">0-1 years</option>
                          <option value="1-2 years">1-2 years</option>
                          <option value="2-3 years">2-3 years</option>
                          <option value="3-5 years">3-5 years</option>
                          <option value="5+ years">5+ years</option>
                          <option value="Other">Other...</option>
                        </select>
                        
                        {!["Fresher", "0-1 years", "1-2 years", "2-3 years", "3-5 years", "5+ years", ""].includes(experienceLevel) && (
                          <input 
                            type="text"
                            value={experienceLevel === "Custom" ? "" : experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                            placeholder="Type custom experience..."
                            className="mt-1 bg-white border border-indigo-200 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-inner h-[50px]"
                          />
                        )}
                        {currentErrors.experienceLevel && <p className="text-rose-500 text-[10px] font-bold uppercase mt-1">{currentErrors.experienceLevel}</p>}
                      </div>
                      <Input label="Notice Period Needed *" placeholder="e.g. Immediate, 30 days" value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} error={currentErrors.noticePeriod} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Work Mode *</label>
                        <select
                          value={workMode}
                          onChange={(e) => setWorkMode(e.target.value as any)}
                          className="bg-slate-50/50 border border-slate-200/80 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner h-[50px]"
                        >
                          <option value="" disabled>Select Work Mode...</option>
                          <option value="on-site">On-Site Office</option>
                          <option value="remote">Fully Remote</option>
                          <option value="hybrid">Hybrid Mode</option>
                        </select>
                        {currentErrors.workMode && <p className="text-rose-500 text-[10px] font-bold uppercase mt-1">{currentErrors.workMode}</p>}
                      </div>

                      <Input label="Office Location *" placeholder="e.g. Bangalore, KA" value={location} onChange={(e) => setLocation(e.target.value)} error={currentErrors.location} />

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salary Type *</label>
                        <select
                          value={salaryType}
                          onChange={(e) => setSalaryType(e.target.value as any)}
                          className="bg-slate-50/50 border border-slate-200/80 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner h-[50px]"
                        >
                          <option value="" disabled>Select Salary Type...</option>
                          <option value="per_year">LPA (Per Annum)</option>
                          <option value="per_month">Monthly Stipend</option>
                        </select>
                        {currentErrors.salaryType && <p className="text-rose-500 text-[10px] font-bold uppercase mt-1">{currentErrors.salaryType}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Input type="number" label="Minimum Salary (INR) *" placeholder="e.g. 600000" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} error={currentErrors.minSalary} />
                      <Input type="number" label="Maximum Salary (INR) *" placeholder="e.g. 800000" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} error={currentErrors.maxSalary} />

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interview Format *</label>
                        <select
                          value={interviewMode}
                          onChange={(e) => setInterviewMode(e.target.value as any)}
                          className="bg-slate-50/50 border border-slate-200/80 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner h-[50px]"
                        >
                          <option value="" disabled>Select Interview Format...</option>
                          <option value="online">Online / VC rounds</option>
                          <option value="offline">In-person campus visit</option>
                          <option value="hybrid">Hybrid interviews</option>
                        </select>
                        {currentErrors.interviewMode && <p className="text-rose-500 text-[10px] font-bold uppercase mt-1">{currentErrors.interviewMode}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {wizardStep === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Input type="number" step="0.1" label="Minimum CGPA *" value={minCGPA} onChange={(e) => setMinCGPA(e.target.value)} error={currentErrors.minCGPA} />
                      <Input type="number" label="Max Backlogs allowed *" value={allowedBacklogs} onChange={(e) => setAllowedBacklogs(e.target.value)} error={currentErrors.allowedBacklogs} />
                      <Input type="number" label="Passing Year *" value={passingYear} onChange={(e) => setPassingYear(e.target.value)} error={currentErrors.passingYear} />
                    </div>

                    {/* Degree Types Tag Cloud Input */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eligible Degrees *</label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allDegreesSelected}
                            onChange={(e) => {
                              setAllDegreesSelected(e.target.checked);
                              if (e.target.checked) setDegreeTypes([]);
                            }}
                            className="w-4 h-4 rounded text-company-primary focus:ring-company-primary border-slate-350 cursor-pointer"
                          />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Open to All Degrees</span>
                        </label>
                      </div>

                      {!allDegreesSelected ? (
                        <>
                          <div className="flex gap-2 w-full">
                            <input
                              list="hr-degrees"
                              className="bg-slate-50/50 border border-slate-200/80 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner h-[50px] w-full"
                              placeholder="Type or select a degree..."
                              value={degreeInput}
                              onChange={(e) => setDegreeInput(e.target.value)}
                            />
                            <datalist id="hr-degrees">
                              {PLATFORM_DEGREES.map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </datalist>
                            <Button type="button" onClick={handleAddDegree} className="bg-slate-900 text-white rounded-2xl px-6 font-bold h-[50px]">Add</Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {degreeTypes.map((d) => (
                              <span key={d} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-slate-200">
                                {d} <button onClick={() => handleRemoveDegree(d)} className="text-slate-400 hover:text-slate-950 font-bold">✕</button>
                              </span>
                            ))}
                          </div>
                          {currentErrors.degreeTypes && <p className="text-rose-500 text-[10px] font-bold uppercase mt-1">{currentErrors.degreeTypes}</p>}
                        </>
                      ) : (
                        <div className="p-3 bg-emerald-50/60 border border-emerald-100/50 rounded-2xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                          <span className="text-emerald-500 text-sm">✔</span> All academic degrees are eligible for this recruitment.
                        </div>
                      )}
                    </div>

                    {/* Branches Tag Cloud Input */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eligible Branches *</label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allBranchesSelected}
                            onChange={(e) => {
                              setAllBranchesSelected(e.target.checked);
                              if (e.target.checked) setBranches([]);
                            }}
                            className="w-4 h-4 rounded text-company-primary focus:ring-company-primary border-slate-350 cursor-pointer"
                          />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Open to All Branches</span>
                        </label>
                      </div>

                      {!allBranchesSelected ? (
                        <>
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex gap-2">
                              <select
                                className="bg-slate-50/50 border border-slate-200/80 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner h-[50px] w-full appearance-none cursor-pointer"
                                value={branchInput}
                                onChange={(e) => setBranchInput(e.target.value)}
                              >
                                <option value="">Select an eligible branch...</option>
                                {PLATFORM_BRANCHES.map((b) => (
                                  <option key={b} value={b}>{b}</option>
                                ))}
                                <option value="custom">Other (Add Custom Branch)...</option>
                              </select>
                              <Button type="button" onClick={handleAddBranch} className="bg-slate-900 text-white rounded-2xl px-6 font-bold h-[50px]">Add</Button>
                            </div>
                            {branchInput === 'custom' && (
                              <input
                                type="text"
                                className="bg-slate-50/50 border border-slate-200/80 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner h-[50px] w-full"
                                placeholder="Type custom branch name..."
                                value={customBranchInput}
                                onChange={(e) => setCustomBranchInput(e.target.value)}
                                autoFocus
                              />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {branches.map((b) => (
                              <span key={b} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-slate-200">
                                {b} <button onClick={() => handleRemoveBranch(b)} className="text-slate-400 hover:text-slate-950 font-bold">✕</button>
                              </span>
                            ))}
                          </div>
                          {currentErrors.branches && <p className="text-rose-500 text-[10px] font-bold uppercase mt-1">{currentErrors.branches}</p>}
                        </>
                      ) : (
                        <div className="p-3 bg-emerald-50/60 border border-emerald-100/50 rounded-2xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                          <span className="text-emerald-500 text-sm">✔</span> All registered academic branches are eligible for this recruitment.
                        </div>
                      )}
                    </div>

                    {/* Required Skills Input */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Skills *</label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={noSkillsRequired}
                            onChange={(e) => {
                              setNoSkillsRequired(e.target.checked);
                              if (e.target.checked) setSkills([]);
                            }}
                            className="w-4 h-4 rounded text-company-primary focus:ring-company-primary border-slate-350 cursor-pointer"
                          />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">No specific skills required</span>
                        </label>
                      </div>

                      {!noSkillsRequired ? (
                        <>
                          <div className="flex gap-2">
                            <SkillAutocomplete 
                              placeholder="e.g. React, Node.js, C++"
                              onSelect={(selectedSkill) => {
                                if (selectedSkill.trim() && !skills.includes(selectedSkill.trim())) {
                                  setSkills([...skills, selectedSkill.trim()]);
                                }
                              }}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {skills.map((s) => (
                              <span key={s} className="bg-company-primary/10 text-company-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-company-primary/15">
                                {s} <button onClick={() => handleRemoveSkill(s)} className="text-company-primary hover:text-slate-950 font-bold">✕</button>
                              </span>
                            ))}
                          </div>
                          {currentErrors.skills && <p className="text-rose-500 text-[10px] font-bold uppercase mt-1">{currentErrors.skills}</p>}
                        </>
                      ) : (
                        <div className="p-3 bg-emerald-50/60 border border-emerald-100/50 rounded-2xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                          <span className="text-emerald-500 text-sm">✔</span> No specialized skillset is enforced. Ideal for general placement drives.
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Description *</label>
                      <textarea
                        rows={4}
                        placeholder="Write detailed responsibilities, key tasks, and expectations..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`bg-slate-50/50 border px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner w-full ${currentErrors.description ? 'border-rose-500' : 'border-slate-200/80'}`}
                      />
                      {currentErrors.description && <p className="text-rose-500 text-[10px] font-bold uppercase mt-1">{currentErrors.description}</p>}
                    </div>
                  </div>
                )}

                {/* Step 4 */}
                {wizardStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-slate-800 mb-2">Configure Selection Stages</h3>

                    <div className="space-y-3">
                      {rounds.map((round, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                          <div>
                            <span className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full mr-2">
                              Stage {round.roundNumber}
                            </span>
                            <span className="font-bold text-slate-800">{round.name}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase ml-2">({round.type})</span>
                            <p className="text-xs text-slate-500 mt-1">{round.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRound(idx)}
                            className="text-rose-500 hover:text-rose-700 font-bold text-xs bg-rose-50 p-2 rounded-xl"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {currentErrors.rounds && <p className="text-rose-500 text-[10px] font-bold uppercase mt-1">{currentErrors.rounds}</p>}
                    </div>

                    <div className="bg-slate-100/50 p-5 rounded-2xl border border-slate-200/30">
                      <h4 className="font-bold text-slate-800 text-sm mb-3">Add Selection Stage</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input placeholder="e.g. Technical Interview 2" value={newRoundName} onChange={(e) => setNewRoundName(e.target.value)} />

                        <div className="flex flex-col gap-1.5">
                          <select
                            value={newRoundType}
                            onChange={(e) => setNewRoundType(e.target.value as any)}
                            className="bg-white border border-slate-200/80 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner h-[50px] mt-1"
                          >
                            <option value="" disabled>Select Round Type...</option>
                            <option value="aptitude">Aptitude Round</option>
                            <option value="coding">Coding Challenge</option>
                            <option value="technical">Technical Panel Interview</option>
                            <option value="hr">HR Panel Interview</option>
                            <option value="group_discussion">Group Discussion (GD)</option>
                          </select>
                        </div>
                      </div>

                      <Input placeholder="Brief description of rounds" value={newRoundDesc} onChange={(e) => setNewRoundDesc(e.target.value)} />

                      <Button
                        type="button"
                        onClick={handleAddRound}
                        className="bg-slate-900 text-white rounded-xl py-2 px-6 font-bold mt-4 text-xs"
                      >
                        + Add Stage
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 5 */}
                {wizardStep === 5 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-800 mb-4">Review Posting Summary</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-200/50 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between border-b pb-1"><span className="text-slate-400">Title</span><span className="font-bold text-slate-800">{title}</span></div>
                        <div className="flex justify-between border-b pb-1"><span className="text-slate-400">Category</span><span className="font-bold text-slate-800">{category}</span></div>
                        <div className="flex justify-between border-b pb-1"><span className="text-slate-400">Job Type</span><span className="font-bold text-slate-800 capitalize">{jobType.replace('_', ' ')}</span></div>
                        <div className="flex justify-between border-b pb-1"><span className="text-slate-400">Work Mode</span><span className="font-bold text-slate-800 capitalize">{workMode}</span></div>
                        <div className="flex justify-between border-b pb-1"><span className="text-slate-400">Location</span><span className="font-bold text-slate-800">{location}</span></div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-400">CTC Range</span>
                          <span className="font-bold text-slate-800">
                            ₹{minSalary} - ₹{maxSalary} ({salaryType.replace('_', ' ')})
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-1"><span className="text-slate-400">Openings</span><span className="font-bold text-slate-800">{openings}</span></div>
                        <div className="flex justify-between border-b pb-1"><span className="text-slate-400">Deadline</span><span className="font-bold text-slate-800">{new Date(deadline).toLocaleDateString()}</span></div>
                        <div className="flex justify-between border-b pb-1"><span className="text-slate-400">Min CGPA</span><span className="font-bold text-slate-800">{minCGPA}</span></div>
                        <div className="flex justify-between border-b pb-1"><span className="text-slate-400">Format</span><span className="font-bold text-slate-800 capitalize">{interviewMode} Format</span></div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200/50">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Configured Rounds</span>
                      <div className="flex flex-wrap gap-2">
                        {rounds.map((round) => (
                          <span key={round.roundNumber} className="bg-white border border-slate-200/70 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                            {round.roundNumber}. {round.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Footer Actions */}
              <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
                {wizardStep > 1 ? (
                  <Button
                    variant="secondary"
                    className="font-bold px-6 py-3 rounded-2xl"
                    onClick={() => setWizardStep(wizardStep - 1)}
                  >
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}

                {wizardStep < 5 ? (
                  <Button
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleContinue}
                    disabled={!isStepValid}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    className="bg-company-primary text-white font-bold px-8 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all duration-300"
                    onClick={handleSubmitJob}
                  >
                    Submit for Approval
                  </Button>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* View Details modal */}
        {showDetailsModal && selectedJob && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-md flex justify-center items-center p-4">
            <GlassCard className="w-full max-w-2xl p-6 md:p-8 rounded-[2rem] shadow-2xl relative bg-white animate-modal-scale border border-slate-100/50 max-h-[95vh] overflow-y-auto">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 text-xl font-bold w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 transition-all hover:rotate-90 duration-300"
              >
                ✕
              </button>

              <div className="mb-5">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border inline-block mb-2.5 ${getJobStatusBadgeClass(selectedJob)}`}>
                  {getJobStatusLabel(selectedJob)}
                </span>
                <h2 className="text-2xl font-black text-slate-900 leading-snug tracking-tight mb-0.5">{selectedJob.title}</h2>
                <p className="text-company-primary font-black text-[10px] uppercase tracking-widest">{selectedJob.category}</p>
              </div>

              {selectedJob.status === 'rejected' && selectedJob.rejectionNote && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-sm mb-6">
                  <span className="font-bold block mb-1">Rejection Reason:</span>
                  {selectedJob.rejectionNote}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 border border-slate-100/50 p-6 rounded-[2rem] text-sm mb-6">
                <div>
                  <span className="text-slate-400 text-xs font-semibold block uppercase">Type</span>
                  <span className="font-bold text-slate-800 capitalize">{selectedJob.type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-semibold block uppercase">Openings</span>
                  <span className="font-bold text-slate-800">{selectedJob.openings}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-semibold block uppercase">CGPA Required</span>
                  <span className="font-bold text-slate-800">{selectedJob.eligibility?.minCGPA ?? '6.0'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-semibold block uppercase">Work Mode</span>
                  <span className="font-bold text-slate-800 capitalize">{selectedJob.workMode}</span>
                </div>
              </div>

              {/* College Approvals Matrix for global vacancy postings */}
              {selectedJob.collegeId === 'ALL' && (() => {
                // Filter to only include colleges whose active branches intersect with the job's eligible branches
                const eligibleColleges = organizations.filter(org => {
                  const jobBranches = selectedJob.eligibility?.eligibleBranches || [];
                  if (jobBranches.length === 0 || !org.activeBranches || org.activeBranches.length === 0) {
                    return true;
                  }
                  return org.activeBranches.some(b => jobBranches.some((jb: string) => {
                    const hrBranch = jb.toLowerCase().trim();
                    const colBranch = b.toLowerCase().trim();
                    return hrBranch.includes(colBranch) || colBranch.includes(hrBranch);
                  }));
                });

                const approvedCount = selectedJob.approvedColleges?.includes('ALL') 
                  ? eligibleColleges.length 
                  : eligibleColleges.filter(org => selectedJob.approvedColleges?.includes(org.id)).length;
                const rejectedCount = eligibleColleges.filter(org => selectedJob.rejectedColleges?.includes(org.id)).length;
                const totalCollegesCount = eligibleColleges.length;
                const pendingCount = totalCollegesCount - approvedCount - rejectedCount;

                const filteredOrgs = eligibleColleges.filter(org => {
                  const isApproved = selectedJob.approvedColleges?.includes('ALL') || selectedJob.approvedColleges?.includes(org.id);
                  const isRejected = selectedJob.rejectedColleges?.includes(org.id);

                  // Search query match
                  const matchesSearch = org.name.toLowerCase().includes(collegeSearch.toLowerCase());
                  if (!matchesSearch) return false;

                  if (matrixTab === 'reviewed') {
                    return isApproved || isRejected;
                  } else if (matrixTab === 'pending') {
                    return !isApproved && !isRejected;
                  }
                  return true; // 'all'
                });

                return (
                  <div className="mt-4 border border-slate-100 rounded-[2rem] p-6 bg-slate-50/50 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">College Approvals Matrix</span>

                      {/* Metric filter buttons to solve too-full layout */}
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-black uppercase tracking-wider">
                        <button
                          type="button"
                          onClick={() => setMatrixTab('reviewed')}
                          className={`px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${matrixTab === 'reviewed'
                              ? 'bg-slate-900 text-white border-slate-950 shadow-md scale-102'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          Reviewed ({approvedCount + rejectedCount})
                        </button>

                        <button
                          type="button"
                          onClick={() => setMatrixTab('pending')}
                          className={`px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${matrixTab === 'pending'
                              ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-102'
                              : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/30'
                            }`}
                        >
                          Pending ({pendingCount})
                        </button>

                        <button
                          type="button"
                          onClick={() => setMatrixTab('all')}
                          className={`px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${matrixTab === 'all'
                              ? 'bg-slate-500 text-white border-slate-650 shadow-md scale-102'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/50'
                            }`}
                        >
                          All ({totalCollegesCount})
                        </button>
                      </div>
                    </div>

                    {/* Search box for filtering when there are mtype colleges */}
                    <div className="relative mb-3">
                      <input
                        type="text"
                        placeholder="🔍 Search filtered colleges by name..."
                        value={collegeSearch}
                        onChange={(e) => setCollegeSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                      {filteredOrgs.length > 0 ? (
                        filteredOrgs.map(org => {
                          const isApproved = selectedJob.approvedColleges?.includes('ALL') || selectedJob.approvedColleges?.includes(org.id);
                          const isRejected = selectedJob.rejectedColleges?.includes(org.id);
                          return (
                            <div key={org.id} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                              <span className="text-xs font-bold text-slate-700 truncate mr-2">{org.name}</span>
                              {isApproved ? (
                                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full shrink-0">✔ Approved</span>
                              ) : isRejected ? (
                                <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[9px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full shrink-0">✕ Rejected</span>
                              ) : (
                                <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[9px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full shrink-0">⏳ Pending</span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full py-8 text-center text-slate-400 text-xs font-bold bg-white rounded-2xl border border-slate-100/50 shadow-inner">
                          {matrixTab === 'reviewed' && (approvedCount + rejectedCount === 0) ? (
                            <span>No colleges have reviewed this job vacancy posting yet.<br /><span className="text-amber-500 hover:underline cursor-pointer font-black block mt-2 text-[10px] uppercase" onClick={() => setMatrixTab('pending')}>👉 Click here to view the pending queue</span></span>
                          ) : (
                            <span>No colleges found matching "{collegeSearch}" in this view.</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-4 text-slate-700 text-sm mb-8 leading-relaxed max-h-[30vh] overflow-y-auto pr-2">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Job Description</span>
                  <p>{selectedJob.description}</p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Required Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.requiredSkills.map((s: string) => (
                      <span key={s} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Interview Rounds</span>
                  <div className="space-y-2">
                    {selectedJob.rounds.map((round: any) => (
                      <div key={round.roundNumber} className="bg-slate-50 p-3 rounded-xl border border-slate-100/50 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800 mr-2">Stage {round.roundNumber}: {round.name}</span>
                          <span className="text-slate-400 font-bold uppercase">({round.type})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100">
                {/* Destructive Action (Far Left) */}
                <div>
                  <button
                    type="button"
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border border-rose-100/50 transition-all duration-350 active:scale-95 shadow-sm cursor-pointer outline-none"
                    onClick={() => handleDeleteJob(selectedJob.id)}
                  >
                    <span>🗑</span> Delete Opening
                  </button>
                </div>

                {/* Primary & Neutral Actions (Far Right) */}
                <div className="flex items-center gap-2">
                  {selectedJob.status === 'approved' && (
                    <button
                      type="button"
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg border border-amber-600 transition-all duration-350 active:scale-95 cursor-pointer outline-none"
                      onClick={() => handleCloseJob(selectedJob.id)}
                    >
                      <span>🔒</span> Archive Opening
                    </button>
                  )}
                  <button
                    type="button"
                    className="font-bold px-5 py-2.5 rounded-2xl text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/50 shadow-sm transition-all duration-350 active:scale-95 cursor-pointer outline-none"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}


