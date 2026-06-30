'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/shared/Button';
import {
  Users,
  Search,
  Bell,
  ChevronDown,
  MapPin,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Sparkles,
  Download,
  Calendar,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import { apiClient } from '@/services/api/api.client';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Candidate {
  id: string;
  jobId: string;
  jobTitle: string;
  collegeName: string;
  firstName: string;
  lastName: string;
  email: string;
  skills: string[];
  extraSkillsCount: number;
  matchScore: number;
  cgpa: number;
  dateApplied: string;
  degree: string;
  branch: string;
  graduationYear: string | number;
  resumeScore: number;
  hasApplied?: boolean;
}

export default function CandidatesPage() {
  const hrDetails = useAppSelector((state: RootState) => state.hr.details);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters and Sorting
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedCollege, setSelectedCollege] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFERED'>('ALL');
  const [sortBy, setSortBy] = useState<'AI_MATCH' | 'CGPA' | 'DATE_APPLIED'>('AI_MATCH');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Shortlisted Candidates State (mock action with local storage persistence)
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  // Load global applications from local storage
  const [appliedApplications, setAppliedApplications] = useState<{ studentId: string; jobId: string }[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('shortlisted_candidates');
      if (stored) {
        try {
          setShortlistedIds(JSON.parse(stored));
        } catch (e) { }
      }
      const storedRejected = localStorage.getItem('rejected_candidates');
      if (storedRejected) {
        try {
          setRejectedIds(JSON.parse(storedRejected));
        } catch (e) { }
      }
      const storedApps = localStorage.getItem('global_applications');
      if (storedApps) {
        try {
          setAppliedApplications(JSON.parse(storedApps));
        } catch (e) { }
      }
    }
  }, []);

  const toggleShortlist = (id: string) => {
    let nextIds: string[];
    const idStr = String(id);
    if (shortlistedIds.includes(idStr)) {
      nextIds = shortlistedIds.filter(x => x !== idStr);
      toast.success('Candidate removed from shortlist');
    } else {
      nextIds = [...shortlistedIds, idStr];
      toast.success('Candidate shortlisted successfully!');
    }
    setShortlistedIds(nextIds);
    localStorage.setItem('shortlisted_candidates', JSON.stringify(nextIds));
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<unknown, ApiResponse<Candidate[]>>('/hr/candidates');
      if (response.success) {
        setCandidates(response.data);
        // Seed if empty
        if (typeof window !== 'undefined') {
          const storedApps = localStorage.getItem('global_applications');
          let apps: { studentId: string; jobId: string }[] = [];
          if (storedApps) {
            try {
              apps = JSON.parse(storedApps);
            } catch (e) { }
          }
          if (apps.length === 0 && (response.data || []).length > 0) {
            const seedApps = (response.data || []).slice(0, 2).map((c) => ({
              studentId: String(c.id),
              jobId: String(c.jobId)
            }));
            localStorage.setItem('global_applications', JSON.stringify(seedApps));
            setAppliedApplications(seedApps);
          } else {
            setAppliedApplications(apps);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch candidates', error);
      toast.error('Failed to load real candidates data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Get only applied candidates, EXCLUDING rejected candidates
  const appliedCandidates = candidates.filter(c =>
    (c.hasApplied || appliedApplications.some(app => String(app.studentId) === String(c.id))) &&
    !rejectedIds.includes(String(c.id))
  );

  // Compute unique roles & colleges for drop downs
  const uniqueRoles = Array.from(new Set(appliedCandidates.map(c => c.jobTitle || 'Product Manager')));
  const uniqueColleges = Array.from(new Set(appliedCandidates.map(c => c.collegeName || 'IIT Bombay')));

  // Filter & Sort Logic
  const filteredCandidates = appliedCandidates
    .filter(c => {
      // Search
      const matchesSearch =
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.skills || []).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.collegeName || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Role Filter
      const matchesRole = selectedRole === 'ALL' || c.jobTitle === selectedRole;

      // College Filter
      const matchesCollege = selectedCollege === 'ALL' || c.collegeName === selectedCollege;

      // Status Tab Filter
      const isShortlisted = shortlistedIds.includes(String(c.id));
      let matchesTab = true;
      if (activeTab === 'SHORTLISTED') {
        matchesTab = isShortlisted;
      } else if (activeTab === 'APPLIED') {
        matchesTab = !isShortlisted;
      } else if (activeTab === 'INTERVIEW') {
        // Mock sub-stage for demo: higher matching candidates
        matchesTab = c.matchScore >= 90;
      } else if (activeTab === 'OFFERED') {
        matchesTab = false; // Initial stage is 0
      }

      return matchesSearch && matchesRole && matchesCollege && matchesTab;
    })
    .sort((a, b) => {
      if (sortBy === 'AI_MATCH') {
        return b.matchScore - a.matchScore;
      } else if (sortBy === 'CGPA') {
        return b.cgpa - a.cgpa;
      } else {
        const dateA = a.dateApplied ? new Date(a.dateApplied).getTime() : 0;
        const dateB = b.dateApplied ? new Date(b.dateApplied).getTime() : 0;
        return dateB - dateA;
      }
    });

  // Initials colors mapping helper
  const getInitialsColor = (firstName?: string) => {
    const char = (firstName || 'C').charAt(0).toUpperCase();
    const colors: Record<string, string> = {
      A: 'bg-indigo-500 text-white',
      B: 'bg-blue-500 text-white',
      C: 'bg-cyan-500 text-white',
      D: 'bg-emerald-500 text-white',
      E: 'bg-amber-500 text-white',
      F: 'bg-orange-500 text-white',
      G: 'bg-rose-500 text-white',
      H: 'bg-red-500 text-white',
      I: 'bg-pink-500 text-white',
      J: 'bg-purple-500 text-white',
      K: 'bg-violet-500 text-white',
      L: 'bg-sky-500 text-white',
      M: 'bg-fuchsia-500 text-white',
      N: 'bg-teal-500 text-white',
      O: 'bg-lime-500 text-white'
    };
    return colors[char] || 'bg-slate-500 text-white';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardLayout>
        <div className="max-w-[1440px] mx-auto p-4 lg:p-8 flex flex-col gap-6">

          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
              <span>CareerHub</span>
              <ChevronRight size={14} />
              <span className="text-slate-900">Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search candidates, jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                />
              </div>
              <Link href="/hr/jobs/new">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl px-6 h-11 border-none shadow-sm">
                  <Plus size={16} className="mr-2" /> Post Job
                </Button>
              </Link>
              <button className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 relative transition-all shadow-sm">
                <Bell size={20} />
              </button>
              <div className="w-11 h-11 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-black text-xs shadow-lg overflow-hidden border border-slate-100">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${hrDetails?.companyName || 'C'}`} alt="logo" />
              </div>
            </div>
          </header>

          {/* Title Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Candidate Pipeline</h1>
              <p className="text-slate-500 font-semibold text-sm mt-1">
                AI-matched candidates across all your active job postings
              </p>
            </div>
            <Button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-black text-xs uppercase tracking-wider rounded-2xl px-6 py-3.5 h-auto border-none flex items-center gap-2 shadow-md shadow-indigo-600/10">
              <Download size={16} /> Export List
            </Button>
          </div>

          {/* Filters & Sorting Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            {/* Left Filter Dropdowns & Status Tabs */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Job Post filter dropdown */}
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">All Job Posts</option>
                  {uniqueRoles.map((role, idx) => (
                    <option key={idx} value={role}>{role}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>


              {/* Divider */}
              <div className="h-6 w-[1px] bg-slate-200 hidden sm:block mx-1" />

              {/* Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'ALL', label: 'All', count: appliedCandidates.length },
                  { id: 'APPLIED', label: 'Applied', count: appliedCandidates.filter(c => !shortlistedIds.includes(String(c.id))).length },
                  { id: 'SHORTLISTED', label: 'Shortlisted', count: appliedCandidates.filter(c => shortlistedIds.includes(String(c.id))).length },
                  { id: 'INTERVIEW', label: 'Interview', count: appliedCandidates.filter(c => c.matchScore >= 90).length },
                  { id: 'OFFERED', label: 'Offered', count: 0 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab.id
                        ? 'bg-white text-indigo-650 shadow-sm border border-slate-205/10'
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Right Sort Dropdown */}
            <div className="relative self-end lg:self-auto">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="bg-white border border-slate-200 text-slate-750 font-bold text-xs rounded-xl px-4 py-2.5 flex items-center gap-1.5 shadow-sm hover:border-slate-300 transition-all"
              >
                Sort: {sortBy === 'AI_MATCH' ? 'AI Match \u2193' : sortBy === 'CGPA' ? 'CGPA \u2193' : 'Date Applied'}
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {showSortDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1.5 overflow-hidden"
                    >
                      {[
                        { id: 'AI_MATCH', label: 'Sort: AI Match \u2193' },
                        { id: 'CGPA', label: 'CGPA \u2193' },
                        { id: 'DATE_APPLIED', label: 'Date Applied' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSortBy(item.id as any);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all ${sortBy === item.id
                              ? 'bg-indigo-50 text-indigo-650'
                              : 'text-slate-650 hover:bg-slate-50'
                            }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Grid Layout */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading real candidates...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-20 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-6 shadow-inner">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900">No candidates found</h3>
              <p className="text-slate-400 font-semibold text-xs mt-1.5 max-w-sm">
                No real candidate records matched your search query or selected active filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => {
                const isShortlisted = shortlistedIds.includes(String(candidate.id));
                return (
                  <motion.div
                    key={candidate.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white border border-slate-150 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row with Initials and Match badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm uppercase ${getInitialsColor(candidate.firstName)}`}>
                          {(candidate.firstName || 'C').charAt(0)}{(candidate.lastName || 'S').charAt(0)}
                        </div>
                        <span className="bg-emerald-55 bg-opacity-10 bg-emerald-50 border border-emerald-100 text-emerald-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Sparkles size={10} fill="currentColor" /> {candidate.matchScore}% Match
                        </span>
                      </div>

                      {/* Name & Academic metadata */}
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {candidate.firstName} {candidate.lastName}
                      </h3>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mt-1">
                        {candidate.collegeName}
                      </p>
                      <p className="text-slate-500 font-semibold text-xs mt-0.5">
                        {candidate.degree} {candidate.branch} • {candidate.graduationYear}
                      </p>

                      {/* Job matching details */}
                      <div className="mt-3.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-600 text-xs font-bold flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase">Role Applied</span>
                        <span className="text-slate-800 text-[11px] truncate max-w-[150px]">{candidate.jobTitle}</span>
                      </div>

                      {/* Skills pills */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {(candidate.skills || []).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-slate-55 bg-opacity-50 bg-slate-50 border border-slate-200/60 text-slate-650 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.extraSkillsCount > 0 && (
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-650 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide">
                            +{candidate.extraSkillsCount}
                          </span>
                        )}
                      </div>

                      {/* Scores Metrics */}
                      <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">CGPA</span>
                          <span className="text-xl font-black text-slate-850 mt-0.5 block">{candidate.cgpa.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Resume Match</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xl font-black text-slate-850">{candidate.resumeScore}/100</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5">
                            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${candidate.resumeScore}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-6 pt-2">
                      <button
                        onClick={() => toggleShortlist(candidate.id)}
                        className={`h-11 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${isShortlisted
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-600'
                            : 'bg-indigo-50 border-indigo-50 text-indigo-600 hover:bg-indigo-100/50'
                          }`}
                      >
                        {isShortlisted ? (
                          <>
                            <Check size={14} strokeWidth={3} /> Shortlisted
                          </>
                        ) : (
                          'Shortlist'
                        )}
                      </button>
                      <Link
                        href={`/hr/candidates/${candidate.id}`}
                        className="h-11 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 flex items-center justify-center gap-1 transition-all"
                      >
                        Profile <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && filteredCandidates.length > 0 && (
            <div className="flex items-center justify-end gap-2 mt-8">
              <button disabled className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-350 cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm">
                &larr;
              </button>
              <button className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs transition-all shadow-md shadow-indigo-600/10">
                1
              </button>
              <button disabled className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-350 cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm">
                &rarr;
              </button>
            </div>
          )}

        </div>
      </DashboardLayout>
    </div>
  );
}
