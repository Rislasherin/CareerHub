'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import {
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  GraduationCap,
  Search,
  Building2,
  Sparkles,
  ChevronRight,
  Clock,
  Star,
  Award,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Filter,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setStudentDetails } from '@/redux/slices/studentSlice';
import { apiClient } from '@/services/api/api.client';
import { toast } from 'sonner';

const calculateProfileCompleteness = (u: type) => {
  if (!u) return 0;
  const fields = [
    u.firstName,
    u.lastName,
    u.email,
    u.rollNumber,
    u.department || u.branch,
    u.phoneNumber,
    u.linkedinUrl,
    u.githubUrl,
    u.city,
    u.degree,
    u.graduationYear,
    u.cgpa,
    u.skills?.languages?.length || u.skills?.frameworks?.length
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};

export default function StudentJobsFeed() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.student.details);

  const [jobs, setJobs] = useState<type[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'BEST_MATCH' | 'NEW_TODAY' | 'SAVED'>('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [packageFilter, setPackageFilter] = useState('ALL');

  // Details Modal
  const [selectedJob, setSelectedJob] = useState<type | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('saved_jobs');
      if (stored) {
        try {
          setSavedJobs(JSON.parse(stored));
        } catch (e) { }
      }
    }
  }, []);

  useEffect(() => {
    if (user?.appliedJobs) {
      setAppliedJobs(user.appliedJobs);
    }
  }, [user]);

  const handleToggleSave = (jobId: string) => {
    let nextSaved: string[];
    const idStr = String(jobId);
    if (savedJobs.includes(idStr)) {
      nextSaved = savedJobs.filter(id => id !== idStr);
      toast.success('Job removed from saved list');
    } else {
      nextSaved = [...savedJobs, idStr];
      toast.success('Job saved successfully! You can access it in the Saved tab.');
    }
    setSavedJobs(nextSaved);
    localStorage.setItem('saved_jobs', JSON.stringify(nextSaved));
  };

  useEffect(() => {
    // Redirect if not verified
    if (user) {
      if (user.status === 'PENDING_VERIFICATION') {
        router.push('/student/waitlist');
      } else if (user.status === 'REJECTED' || (user.status === 'PENDING_INVITE' && !user.proofUrl)) {
        router.push('/student/verify');
      }
    }
  }, [user, router]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response: type = await apiClient.get('/student/jobs');
      if (response.success) {
        setJobs(response.data || []);
      }
    } catch (err: type) {
      toast.error(err?.error?.message || err?.message || 'Failed to retrieve jobs feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    try {
      const idStr = String(jobId);
      const response: type = await apiClient.post(`/student/jobs/${idStr}/apply`);
      if (response.success) {
        const nextApplied = [...appliedJobs, idStr];
        setAppliedJobs(nextApplied);
        if (user) {
          dispatch(setStudentDetails({
            ...user,
            appliedJobs: nextApplied
          }));
        }
        toast.success('Application Submitted Successfully! Your verified profile and resume have been shared with the recruitment team.', {
          duration: 5000,
        });
      }
    } catch (err: type) {
      toast.error(err?.error?.message || err?.message || 'Failed to submit application');
    } finally {
      setApplyingId(null);
    }
  };

  // Dynamic counts for tabs
  const allCount = jobs.length;
  const bestCount = jobs.filter(j => (j.matchScore || 0) >= 80).length;
  const newTodayCount = jobs.filter(j => {
    if (!j.createdAt) return false;
    const createdDate = new Date(j.createdAt);
    const today = new Date();
    return createdDate.getDate() === today.getDate() &&
      createdDate.getMonth() === today.getMonth() &&
      createdDate.getFullYear() === today.getFullYear();
  }).length;
  const savedCount = savedJobs.length;

  // Filter Logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.requiredSkills || []).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesTab = true;
    if (activeTab === 'BEST_MATCH') {
      matchesTab = (job.matchScore || 0) >= 80;
    } else if (activeTab === 'NEW_TODAY') {
      if (!job.createdAt) matchesTab = false;
      else {
        const createdDate = new Date(job.createdAt);
        const today = new Date();
        matchesTab = createdDate.getDate() === today.getDate() &&
          createdDate.getMonth() === today.getMonth() &&
          createdDate.getFullYear() === today.getFullYear();
      }
    } else if (activeTab === 'SAVED') {
      matchesTab = savedJobs.includes(String(job.id || job._id));
    }

    const matchesRole = roleFilter === 'ALL' || job.type.toUpperCase() === roleFilter.toUpperCase();

    let matchesPackage = true;
    if (packageFilter !== 'ALL') {
      // packageFilter values: 'UNDER_10', '10_20', '20_PLUS'
      const salaryNum = parseFloat(job.salaryCTC) || parseFloat(String(job.minSalary)) / 100000 || 0;
      if (packageFilter === 'UNDER_10') {
        matchesPackage = salaryNum < 10;
      } else if (packageFilter === '10_20') {
        matchesPackage = salaryNum >= 10 && salaryNum <= 20;
      } else if (packageFilter === '20_PLUS') {
        matchesPackage = salaryNum > 20;
      }
    }

    return matchesSearch && matchesTab && matchesRole && matchesPackage;
  });

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-12">

        {/* --- Header --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Job Feed</h1>
            <p className="text-slate-400 font-medium text-xs mt-1">
              {filteredJobs.length} openings matched to your profile
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search jobs, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none"
              />
            </div>

            {/* Notification Bell */}
            <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all">
              <Bell size={18} />
            </button>

            {/* Upload Resume Button */}
            <button className="h-10 bg-[#E11D48] hover:bg-[#BE123C] text-white px-5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all">
              <Sparkles size={14} className="animate-pulse" /> Upload Resume
            </button>
          </div>
        </header>

        {/* --- Tabs & Quick Dropdowns Bar --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', label: `All (${allCount})` },
              { id: 'BEST_MATCH', label: `Best Match (${bestCount})` },
              { id: 'NEW_TODAY', label: `New Today (${newTodayCount})` },
              { id: 'SAVED', label: `Saved (${savedCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as type)}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide transition-all ${activeTab === tab.id
                    ? 'bg-[#E11D48] text-white shadow-md shadow-rose-500/15'
                    : 'text-slate-400 hover:text-slate-700 bg-transparent'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2.5">
            {/* Roles/Type Dropdown */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 outline-none cursor-pointer focus:border-slate-300"
            >
              <option value="ALL">All Roles</option>
              <option value="FULL_TIME">Full-Time</option>
              <option value="INTERNSHIP">Internship</option>
            </select>

            {/* Package Dropdown */}
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 outline-none cursor-pointer focus:border-slate-300"
            >
              <option value="ALL">type Package</option>
              <option value="UNDER_10">Under ₹10 LPA</option>
              <option value="10_20">₹10LPA - ₹20LPA</option>
              <option value="20_PLUS">Over ₹20 LPA</option>
            </select>
          </div>
        </div>

        {/* --- Main Feed --- */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <GlassCard className="p-20 text-center rounded-[2.5rem] border-slate-100/50">
            <Briefcase size={40} className="text-slate-300 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-400 font-bold text-lg mb-1">No vacancies found</p>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">There are no approved job posts matching your filter criteria at this time.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => {
              const hasApplied = appliedJobs.includes(job.id);
              const isEligible = job.isEligible !== undefined ? job.isEligible : true;

              // Overlap check for skill match representation (e.g., "Skill match (3/5)")
              const studentSkillSet = new Set<string>();
              if (user?.skills) {
                const sObj = user.skills;
                (sObj.languages || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                (sObj.frameworks || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                (sObj.databases || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                (sObj.cloudDevops || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                (sObj.otherTools || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                (sObj.aiMl || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
              }
              const requiredSkills = job.requiredSkills || [];
              const matchedCount = requiredSkills.filter((s: string) => studentSkillSet.has(s.toLowerCase().trim())).length;
              const totalRequired = requiredSkills.length;

              const formattedDeadline = job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'Dec 22, 2024';

              return (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative"
                >
                  <GlassCard className="p-6 h-full flex flex-col justify-between rounded-[2rem] border-slate-100/50 hover:border-rose-500/20 hover:shadow-2xl hover:shadow-rose-500/5 hover:-translate-y-1 transition-all duration-300 bg-white">
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-500 text-lg uppercase shadow-sm">
                            {(job.companyName || 'Campus Recruiter').charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-800 text-sm">{job.companyName || 'Campus Recruiter'}</span>
                              <span className="text-[10px] text-slate-400 font-bold">• Engineering</span>
                            </div>
                            <h3 className="font-black text-slate-900 text-base leading-tight mt-0.5">
                              {job.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 items-end">
                          {hasApplied ? (
                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest leading-none">
                              Applied
                            </span>
                          ) : isEligible ? (
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest leading-none">
                              MATCH
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-1">
                              <AlertCircle size={10} /> Ineligible
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Location, Type, Mode, Openings */}
                      <div className="flex flex-wrap gap-2 pt-1 text-slate-400 font-bold text-[11px]">
                        <span className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" /> {job.location || 'Bangalore'}
                        </span>
                        <span className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 flex items-center gap-1 capitalize">
                          <Briefcase size={12} className="text-slate-400" /> {job.type?.replace('_', ' ')}
                        </span>
                        <span className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 flex items-center gap-1 capitalize">
                          <Clock size={12} className="text-slate-400" /> {job.workMode || 'Hybrid'}
                        </span>
                        <span className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 flex items-center gap-1">
                          <Award size={12} className="text-slate-400" /> {job.openingsCount || 5} openings
                        </span>
                      </div>

                      {/* Skill match progress bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-[11px] font-black text-slate-600">
                          <span>Skill match ({matchedCount}/{totalRequired || 1})</span>
                          <span className="text-indigo-600">{job.matchScore}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${job.matchScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Required Skills list pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {requiredSkills.map((skill: string) => {
                          const hasSkill = studentSkillSet.has(skill.toLowerCase().trim());
                          return hasSkill ? (
                            <span key={skill} className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-blue-100">
                              ✓ {skill}
                            </span>
                          ) : (
                            <span key={skill} className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-rose-100">
                              {skill}
                            </span>
                          );
                        })}
                        {requiredSkills.length === 0 && (
                          <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                            ✓ No Specific Skills Required
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-100/40 flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-slate-900 text-lg leading-none">
                          {job.salaryType === 'per_month'
                            ? `₹${(job.minSalary / 1000).toFixed(0)}K - ₹${(job.maxSalary / 1000).toFixed(0)}K / mo`
                            : `₹${(job.minSalary / 100000).toFixed(1)} - ₹${(job.maxSalary / 100000).toFixed(1)} LPA`
                          }
                        </span>
                        {!hasApplied && (
                          <span className="text-[10px] text-amber-600 font-bold mt-1">
                            Closes {formattedDeadline}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Detail/Save Button */}
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowDetails(true);
                          }}
                          className="w-10 h-10 bg-white border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-center text-slate-400 hover:text-amber-500 transition-colors"
                        >
                          <Star size={18} />
                        </button>

                        {hasApplied ? (
                          <button className="h-10 bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-not-allowed">
                            ✓ Applied
                          </button>
                        ) : (
                          <Button
                            disabled={!isEligible}
                            isLoading={applyingId === job.id}
                            onClick={() => handleApply(job.id)}
                            className={`h-10 px-6 rounded-xl text-xs font-black uppercase tracking-wider border-none ${!isEligible
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none hover:bg-slate-100'
                                : 'bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-md shadow-rose-500/20'
                              }`}
                          >
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* --- Side Drawer Detail View --- */}
        <AnimatePresence>
          {showDetails && selectedJob && (() => {
            const isEligible = selectedJob.isEligible !== undefined ? selectedJob.isEligible : true;
            return (
              <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
                >
                  {/* Scrollable Content Container */}
                  <div className="p-8 lg:p-10 flex-1 overflow-y-auto no-scrollbar">
                    {/* Top Close bar */}
                    <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center font-black text-[#D97706] text-xl uppercase shadow-sm shrink-0">
                          {(selectedJob.companyName || 'Campus Recruiter').charAt(0)}
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold text-xs block">
                            {selectedJob.companyName || 'Campus Recruiter'}
                          </span>
                          <h2 className="text-2xl font-black text-slate-900 leading-tight mt-1">
                            {selectedJob.title}
                          </h2>
                          {/* Tag Pills */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200/50">
                              {selectedJob.category || selectedJob.department || 'Engineering'}
                            </span>
                            <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200/50">
                              {selectedJob.type?.replace('_', ' ') || 'Full-time'}
                            </span>
                            <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200/50">
                              {selectedJob.workMode || 'On-site'}
                            </span>
                            <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200/50 flex items-center gap-1">
                              <MapPin size={10} /> {selectedJob.location || 'Bangalore'}
                            </span>
                            {selectedJob.deadline && (() => {
                              const daysLeft = Math.ceil((new Date(selectedJob.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                              return daysLeft > 0 ? (
                                <span className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-rose-100 flex items-center gap-1">
                                  <Clock size={10} /> {daysLeft} days left
                                </span>
                              ) : null;
                            })()}
                            <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
                              ✓ Approved
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowDetails(false)}
                        className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors flex items-center justify-center border border-slate-200 shadow-sm"
                      >
                        ✕
                      </button>
                    </div>

                    {/* 2-Column Grid */}
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Left Column (Job Details) */}
                      <div className="w-full lg:w-3/5 space-y-8">
                        {/* Job Details Blocks */}
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Job Details</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: 'Department', val: selectedJob.category || selectedJob.department || 'Engineering' },
                              { label: 'Job Type', val: selectedJob.type?.replace('_', ' ') || 'Full-time' },
                              { label: 'Work Mode', val: selectedJob.workMode || 'On-site' },
                              { label: 'Location', val: selectedJob.location || 'Bangalore' },
                              { label: 'Openings', val: `${selectedJob.openingsCount || 1} positions` },
                              { label: 'Posted On', val: selectedJob.createdAt ? new Date(selectedJob.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently' },
                              { label: 'Experience', val: selectedJob.experienceRequired || 'Fresher (0 years)' },
                              { label: 'Posted By', val: `${selectedJob.companyName || 'Company'} HR` }
                            ].map(item => (
                              <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                                <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">{item.label}</span>
                                <span className="font-extrabold text-slate-800">{item.val}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Required Skills Section */}
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Required Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {(selectedJob.requiredSkills || []).map((skill: string) => (
                              <span key={skill} className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-xs font-bold border border-rose-100 flex items-center gap-1.5">
                                <span className="w-[2.5px] h-3.5 bg-rose-500 rounded-sm inline-block shrink-0"></span>
                                {skill}
                              </span>
                            ))}
                          </div>
                          {/* Summary match */}
                          {(() => {
                            const studentSkillSet = new Set<string>();
                            if (user?.skills) {
                              const sObj = user.skills;
                              (sObj.languages || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                              (sObj.frameworks || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                              (sObj.databases || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                              (sObj.cloudDevops || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                              (sObj.otherTools || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                              (sObj.aiMl || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                            }
                            const requiredSkills = selectedJob.requiredSkills || [];
                            const matchedCount = requiredSkills.filter((s: string) => studentSkillSet.has(s.toLowerCase().trim())).length;
                            const missingCount = requiredSkills.length - matchedCount;

                            return (
                              <div className="flex items-center gap-4 mt-3 text-xs font-bold">
                                <span className="text-emerald-600 flex items-center gap-1">
                                  ✓ {matchedCount} skills you have
                                </span>
                                <span className="text-rose-600 flex items-center gap-1">
                                  ❙ {missingCount} skills to improve
                                </span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Eligibility Criteria */}
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Eligibility Criteria</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                              <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">Min CGPA</span>
                              <span className="font-extrabold text-slate-800">{selectedJob.eligibility?.minCGPA || '7.0'}+</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                              <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">Graduation Year</span>
                              <span className="font-extrabold text-slate-800">{selectedJob.eligibility?.graduationYear || '2025'}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                              <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">Degree</span>
                              <span className="font-extrabold text-slate-800">{selectedJob.eligibility?.degree || 'B.Tech / B.E.'}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                              <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">Active Backlogs</span>
                              <span className="font-extrabold text-slate-800">
                                {selectedJob.eligibility?.allowedBacklogs !== undefined ? (selectedJob.eligibility.allowedBacklogs === 0 ? 'Not Allowed' : `Allowed: ${selectedJob.eligibility.allowedBacklogs}`) : 'Not Allowed'}
                              </span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs col-span-2">
                              <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">Eligible Branches</span>
                              <span className="font-extrabold text-slate-800">
                                {(selectedJob.eligibility?.eligibleBranches || []).join(' / ') || 'All Branches'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Hiring Rounds */}
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Hiring Rounds</h4>
                          <div className="space-y-2.5">
                            {(() => {
                              const rounds = selectedJob.rounds?.length ? selectedJob.rounds : [];

                              if (rounds.length === 0) {
                                return (
                                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                                    <span className="text-slate-500 font-bold text-xs">Interview stages not specified</span>
                                  </div>
                                );
                              }

                              return rounds.map((round: type, idx: number) => (
                                <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                                      {round.roundNumber || idx + 1}
                                    </div>
                                    <div>
                                      <span className="font-black text-slate-850 text-xs block">{round.name}</span>
                                      <span className="text-slate-400 font-bold text-[10px] block mt-0.5 capitalize">{round.description || round.type?.replace('_', ' ')}</span>
                                    </div>
                                  </div>
                                  <span className="bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider">
                                    {round.type ? round.type.replace('_', ' ') : 'Platform'}
                                  </span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>

                        {/* About the company */}
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">About the Company</h4>
                          <p className="text-slate-500 font-semibold text-xs leading-relaxed">
                            {selectedJob.companyDescription || selectedJob.description || `${selectedJob.companyName || 'The company'} is a leading organization actively hiring talented candidates.`}
                          </p>
                        </div>
                      </div>

                      {/* Right Column (AI Match Score & Eligibility Checks) */}
                      <div className="w-full lg:w-2/5 space-y-6 lg:border-l lg:border-slate-100 lg:pl-6">
                        {/* AI Match Score Card */}
                        <div className="border border-slate-150 rounded-[2rem] p-6 space-y-5 bg-white shadow-sm">
                          <div>
                            <span className="text-slate-900 font-black text-xs block">AI Match Score</span>
                            <div className="flex items-baseline gap-2 mt-4">
                              <span className="text-5xl font-black text-[#F97316]">
                                {selectedJob.matchScore}%
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">Based on your resume & skills</span>
                            </div>
                          </div>

                          {/* Progress bars matching mockup */}
                          {(() => {
                            const studentSkillSet = new Set<string>();
                            if (user?.skills) {
                              const sObj = user.skills;
                              (sObj.languages || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                              (sObj.frameworks || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                              (sObj.databases || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                              (sObj.cloudDevops || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                              (sObj.otherTools || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                              (sObj.aiMl || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
                            }
                            const requiredSkills = selectedJob.requiredSkills || [];
                            const matchedCount = requiredSkills.filter((s: string) => studentSkillSet.has(s.toLowerCase().trim())).length;
                            const skillPercent = requiredSkills.length > 0 ? Math.round((matchedCount / requiredSkills.length) * 100) : 100;

                            const cgpaEligible = user?.cgpa && parseFloat(String(user.cgpa)) >= (selectedJob.eligibility?.minCGPA || 0);
                            const branchEligible = !selectedJob.eligibility?.eligibleBranches || selectedJob.eligibility.eligibleBranches.length === 0 || selectedJob.eligibility.eligibleBranches.some((b: string) => b.toLowerCase().trim() === (user?.branch || '').toLowerCase().trim());

                            return (
                              <div className="space-y-3 pt-2">
                                {/* Skill Match */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className="text-slate-400">Skill Match</span>
                                    <span className={skillPercent > 50 ? 'text-emerald-600' : 'text-rose-600'}>{skillPercent}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-1">
                                    <div className={`h-full rounded-full ${skillPercent > 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${skillPercent}%` }} />
                                  </div>
                                </div>

                                {/* CGPA Score */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className="text-slate-400">CGPA Score</span>
                                    <span className={cgpaEligible ? 'text-emerald-600' : 'text-rose-600'}>{cgpaEligible ? '100%' : '0%'}</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-1">
                                    <div className={`h-full rounded-full ${cgpaEligible ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: cgpaEligible ? '100%' : '0%' }} />
                                  </div>
                                </div>

                                {/* Branch Match */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className="text-slate-400">Branch Match</span>
                                    <span className={branchEligible ? 'text-emerald-600' : 'text-rose-600'}>{branchEligible ? '100%' : '0%'}</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-1">
                                    <div className={`h-full rounded-full ${branchEligible ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: branchEligible ? '100%' : '0%' }} />
                                  </div>
                                </div>

                                {/* Profile Completeness */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className="text-slate-400">Profile Completeness</span>
                                    <span className="text-emerald-600">{calculateProfileCompleteness(user)}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-1">
                                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${calculateProfileCompleteness(user)}%` }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Eligibility checklist card */}
                        <div className="border border-slate-150 rounded-[2rem] p-6 space-y-4 bg-white shadow-sm">
                          <span className="text-slate-900 font-black text-xs block">Eligibility Check</span>
                          {(() => {
                            const cgpaEligible = user?.cgpa && parseFloat(String(user.cgpa)) >= (selectedJob.eligibility?.minCGPA || 0);
                            const branchEligible = !selectedJob.eligibility?.eligibleBranches || selectedJob.eligibility.eligibleBranches.length === 0 || selectedJob.eligibility.eligibleBranches.some((b: string) => b.toLowerCase().trim() === (user?.branch || '').toLowerCase().trim());
                            const backlogsEligible = (user?.activeBacklogs || 0) <= (selectedJob.eligibility?.allowedBacklogs !== undefined ? selectedJob.eligibility.allowedBacklogs : 0);

                            return (
                              <div className="space-y-2.5 text-xs font-bold text-slate-600">
                                <div className="flex items-center gap-2">
                                  <span className={cgpaEligible ? 'text-emerald-600' : 'text-rose-600'}>{cgpaEligible ? '✓' : '✗'}</span>
                                  <span>CGPA {user?.cgpa || 'N/A'} (req: {selectedJob.eligibility?.minCGPA || '0'}+)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-600">✓</span>
                                  <span>Graduation year {user?.graduationYear || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={branchEligible ? 'text-emerald-600' : 'text-rose-600'}>{branchEligible ? '✓' : '✗'}</span>
                                  <span>Branch: {user?.branch || user?.department || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={backlogsEligible ? 'text-emerald-600' : 'text-rose-600'}>{backlogsEligible ? '✓' : '✗'}</span>
                                  <span>{backlogsEligible ? 'No active backlogs' : `Active Backlogs: ${user?.activeBacklogs}`}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Application Deadline Card */}
                        <div className="border border-slate-150 rounded-[2rem] p-6 space-y-1.5 bg-white shadow-sm">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Application Deadline</span>
                          <h4 className="text-lg font-black text-slate-900">
                            {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline specified'}
                          </h4>
                          {selectedJob.deadline && (() => {
                            const daysLeft = Math.ceil((new Date(selectedJob.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                            if (daysLeft > 0) {
                              return <span className="text-[10px] text-slate-400 font-bold block">{daysLeft} days remaining • Apply soon!</span>;
                            } else {
                              return <span className="text-[10px] text-rose-500 font-bold block">Deadline passed</span>;
                            }
                          })()}
                        </div>

                        {/* Package Card */}
                        <div className="border border-slate-150 rounded-[2rem] p-6 space-y-1 bg-white shadow-sm">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Package</span>
                          <h4 className="text-xl font-black text-slate-900">
                            {selectedJob.salaryType === 'per_month'
                              ? `₹${(selectedJob.minSalary / 1000).toFixed(0)}K - ₹${(selectedJob.maxSalary / 1000).toFixed(0)}K`
                              : `₹${(selectedJob.minSalary / 100000).toFixed(1)} - ₹${(selectedJob.maxSalary / 100000).toFixed(1)} LPA`
                            }
                          </h4>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            {selectedJob.salaryType === 'per_month' ? 'Per Month (Fixed)' : 'Per Year (Fixed + ESOPs)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Controls fixed at the bottom */}
                  <div className="flex items-center gap-3 p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                    <button
                      onClick={() => handleToggleSave(selectedJob.id || selectedJob._id)}
                      className={`h-12 w-32 border rounded-2xl flex items-center justify-center text-xs font-black uppercase gap-1.5 transition-all shadow-sm shrink-0 ${savedJobs.includes(String(selectedJob.id || selectedJob._id))
                          ? 'bg-rose-50 border-rose-200 text-[#E11D48] hover:bg-rose-100/50'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                        }`}
                    >
                      <Star size={16} fill={savedJobs.includes(String(selectedJob.id || selectedJob._id)) ? '#E11D48' : 'none'} className={savedJobs.includes(String(selectedJob.id || selectedJob._id)) ? 'text-[#E11D48]' : 'text-slate-400'} />
                      {savedJobs.includes(String(selectedJob.id || selectedJob._id)) ? 'Saved' : 'Save Job'}
                    </button>

                    {appliedJobs.includes(String(selectedJob.id || selectedJob._id)) ? (
                      <button className="h-12 flex-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-not-allowed shadow-sm">
                        ✓ Application Submitted
                      </button>
                    ) : (
                      <Button
                        disabled={!isEligible}
                        isLoading={applyingId === (selectedJob.id || selectedJob._id)}
                        onClick={() => handleApply(selectedJob.id || selectedJob._id)}
                        className={`h-12 flex-1 rounded-2xl font-black text-white text-xs uppercase tracking-widest border-none transition-all shadow-lg ${!isEligible
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none hover:bg-slate-200'
                            : 'bg-[#E11D48] hover:bg-[#BE123C] shadow-rose-500/20'
                          }`}
                      >
                        Apply Now →
                      </Button>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
