'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Search, MapPin, Star, GraduationCap, Calendar, Mail, Phone, Clock, FileText, ChevronRight, X, ExternalLink, CheckCircle2, Eye, Trophy, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/redux/hooks';
import { apiClient } from '@/services/api/api.client';
import { API_ROUTES } from '@/constants/api.routes';
import { toast } from 'sonner';
import { ApiResponse } from '@/types/api';

const statusTabs = [
  { id: 'APPLIED', label: 'Applied', icon: Clock },
  { id: 'SHORTLISTED', label: 'Shortlisted', icon: CheckCircle2 },
  { id: 'NEXT_ROUND', label: 'Next Round', icon: CheckCircle2 },
  { id: 'INTERVIEWING', label: 'Interviewing', icon: Calendar },
  { id: 'OFFERED', label: 'Offered', icon: Trophy },
  { id: 'HIRED', label: 'Hired', icon: CheckCircle2 },
  { id: 'REJECTED', label: 'Rejected', icon: XCircle }
];

export default function JobApplicantsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.id as string;
  const targetApplicantId = searchParams.get('applicant');

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('APPLIED');

  // Drawer state
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewers, setInterviewers] = useState<any[]>([]);
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
    if (jobId) {
      fetchApplications();
      fetchInterviewers();
    }
  }, [jobId]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`${API_ROUTES.HR.JOBS}/${jobId}/applications`) as ApiResponse<any[]>;
      if (response.success) {
        setApplications(response.data || []);
        
        // Auto-select applicant if passed in query string
        if (targetApplicantId && response.data) {
          const targetApp = response.data.find((a: any) => a.id === targetApplicantId);
          if (targetApp) {
            setSelectedApp(targetApp);
            setShowDetails(true);
            setActiveTab(targetApp.status || 'APPLIED');
          }
        }
      }
    } catch (err) {
      toast.error('Failed to retrieve applications');
    } finally {
      setLoading(false);
    }
  };
  const fetchInterviewers = async () => {
    try {
      const response = await apiClient.get(API_ROUTES.HR.INTERVIEWERS) as ApiResponse<any>;
      if (response.success) {
        setInterviewers(response.data?.interviewers || []);
      }
    } catch (err) {
      toast.error('Failed to load interviewers');
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);
    try {
      const payload = {
        applicationId: selectedApp.id,
        ...interviewForm,
        roundNumber: Number(interviewForm.roundNumber),
        durationMinutes: Number(interviewForm.durationMinutes)
      };

      const response = await apiClient.post(API_ROUTES.HR.INTERVIEWS, payload) as ApiResponse<any>;

      if (response.success) {
        toast.success('Interview scheduled successfully');
        setShowInterviewModal(false);
        setApplications(apps => apps.map(app =>
          app.id === selectedApp.id ? { ...app, status: 'INTERVIEWING' } : app
        ));

        if (selectedApp) {
          setSelectedApp({ ...selectedApp, status: 'INTERVIEWING' });
        }

        setInterviewForm({
          interviewerId: '', title: '', type: 'TECHNICAL', roundNumber: 1, scheduledAt: '', durationMinutes: 60, meetingLink: ''
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setUpdating(false);
    }
  };

  const updateStatus = async (applicationId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const response = await apiClient.patch(`${API_ROUTES.HR.APPLICATIONS}/${applicationId}/status`, { status: newStatus }) as ApiResponse<any>;
      if (response.success) {
        toast.success(`Candidate status updated to ${newStatus.replace('_', ' ')}`);
        // Optimistic update
        setApplications(apps => apps.map(app => app.id === applicationId ? { ...app, status: newStatus } : app));
        if (selectedApp && selectedApp.id === applicationId) {
          setSelectedApp({ ...selectedApp, status: newStatus });
        }
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const student = app.student || {};
    const matchesTab = (app.status || 'APPLIED') === activeTab;
    const searchString = `${student.firstName} ${student.lastName} ${student.email} ${student.skills?.languages?.join(' ')}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6 pb-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-2">
              <span className="hover:text-slate-700 cursor-pointer transition-colors" onClick={() => router.push('/hr/jobs')}>Jobs</span>
              <ChevronRight size={12} />
              <span className="text-slate-800">Applicants</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Job Applicants</h1>
            <p className="text-slate-400 font-medium text-xs mt-1">
              Review and manage candidates pipeline
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search candidates, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none"
              />
            </div>
          </div>
        </header>

        {/* Pipeline Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-slate-100">
          {statusTabs.map(tab => {
            const count = applications.filter(a => (a.status || 'APPLIED') === tab.id).length;
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide whitespace-nowrap transition-all ${isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                  }`}
              >
                <Icon size={14} />
                <span className="capitalize">{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Board View */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredApps.length === 0 ? (
          <GlassCard className="p-20 text-center rounded-[2.5rem] border-slate-100/50 mt-4">
            <Eye size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-lg mb-1">No candidates in this stage</p>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">Try selecting another pipeline stage or adjust your search.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-2">
            {filteredApps.map(app => {
              const student = app.student || {};
              const skills = Array.isArray(student.skills?.languages) ? student.skills.languages : [];
              const formattedDate = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently';

              return (
                <motion.div layout key={app.id}>
                  <GlassCard
                    className="p-5 flex flex-col justify-between h-full rounded-[1.5rem] bg-white border-slate-100/50 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedApp(app);
                      setShowDetails(true);
                    }}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <img
                            src={student.profileImage || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=4f46e5&color=fff`}
                            alt="Profile"
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                          />
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                              {student.firstName} {student.lastName}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                              {student.branch || student.department || 'B.Tech'} • {student.graduationYear || '2025'}
                            </span>
                            <div className="flex items-center gap-1 mt-1 text-[10px] font-black text-emerald-600">
                              <Star size={10} className="fill-emerald-600" />
                              <span>{student.cgpa || 0} CGPA</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          {formattedDate}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {skills.slice(0, 3).map((s: string) => (
                          <span key={s} className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-slate-500">
                            {s}
                          </span>
                        ))}
                        {skills.length > 3 && (
                          <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-[9px] font-black text-slate-500">
                            +{skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Click to view details</span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Side Drawer Profile View */}
        <AnimatePresence>
          {showDetails && selectedApp && (() => {
            const student = selectedApp.student || {};
            const skills = student.skills || {};

            return (
              <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/20 backdrop-blur-sm">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                  className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden"
                >
                  {/* Drawer Header */}
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-lg font-black text-slate-900">Candidate Profile</h2>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Drawer Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">

                    {/* Basic Info Header */}
                    <div className="flex gap-5">
                      <img
                        src={student.profileImage || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=4f46e5&color=fff`}
                        alt="Profile"
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                      />
                      <div className="flex-1 pt-1">
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">
                          {student.firstName} {student.lastName}
                        </h2>
                        <span className="text-indigo-600 font-bold text-sm block mt-0.5">
                          {student.degree || 'B.Tech'} in {student.branch || student.department} ({student.graduationYear || 2025})
                        </span>
                        <div className="flex flex-col gap-1.5 mt-3 text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {student.email}</span>
                          {student.phoneNumber && <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {student.phoneNumber}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CGPA</span>
                        <span className="block text-lg font-black text-slate-800">{student.cgpa || 'N/A'}</span>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">10th %</span>
                        <span className="block text-lg font-black text-slate-800">{student.tenthPercentage || 'N/A'}%</span>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">12th %</span>
                        <span className="block text-lg font-black text-slate-800">{student.twelfthPercentage || 'N/A'}%</span>
                      </div>
                    </div>

                    {/* Resume Snapshot */}
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Resume Snapshot</h4>
                      {selectedApp.resumeUrl ? (
                        <a
                          href={selectedApp.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl group hover:bg-indigo-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-indigo-500">
                              <FileText size={20} />
                            </div>
                            <div>
                              <span className="block font-bold text-sm text-indigo-900">View Resume (PDF)</span>
                              <span className="block text-[10px] font-semibold text-indigo-500 mt-0.5">Uploaded at time of application</span>
                            </div>
                          </div>
                          <ExternalLink size={16} className="text-indigo-400 group-hover:text-indigo-600" />
                        </a>
                      ) : (
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                          <span className="text-slate-400 text-xs font-bold">No resume attached</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Skills & Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {['languages', 'frameworks', 'databases', 'cloudDevops', 'otherTools'].map(category => {
                          const catSkills = skills[category];
                          if (!Array.isArray(catSkills)) return null;
                          return catSkills.map((s: string) => (
                            <span key={s} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600">
                              {s}
                            </span>
                          ));
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="p-6 border-t border-slate-100 bg-white">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Update Pipeline Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.status === 'REJECTED' ? (
                        <span className="text-rose-500 font-bold text-xs bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl flex items-center gap-2">
                          <XCircle size={14} /> Candidate Rejected
                        </span>
                      ) : selectedApp.status === 'HIRED' ? (
                        <span className="text-emerald-500 font-bold text-xs bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2">
                          <Trophy size={14} /> Candidate Hired
                        </span>
                      ) : (
                        <>
                          {selectedApp.status === 'APPLIED' && (
                            <Button
                              isLoading={updating}
                              onClick={() => updateStatus(selectedApp.id, 'SHORTLISTED')}
                              className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 font-bold text-xs"
                            >
                              Shortlist Candidate
                            </Button>
                          )}

                          {(selectedApp.status === 'SHORTLISTED' || selectedApp.status === 'NEXT_ROUND' || selectedApp.status === 'INTERVIEWING') && (
                            <Button
                              isLoading={updating}
                              onClick={() => {
                                setSelectedApp(selectedApp);
                                setShowInterviewModal(true);
                              }}
                              className="bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 font-bold text-xs"
                            >
                              Schedule {selectedApp.status === 'INTERVIEWING' ? 'Next ' : ''}Interview
                            </Button>
                          )}

                          {selectedApp.status === 'INTERVIEWING' && (
                            <Button
                              isLoading={updating}
                              onClick={() => updateStatus(selectedApp.id, 'NEXT_ROUND')}
                              className="bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 font-bold text-xs"
                            >
                              Move to Next Round
                            </Button>
                          )}

                          {(selectedApp.status === 'INTERVIEWING' || selectedApp.status === 'NEXT_ROUND') && (
                            <Button
                              isLoading={updating}
                              onClick={() => updateStatus(selectedApp.id, 'OFFERED')}
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs"
                            >
                              Rollout Offer
                            </Button>
                          )}

                          {selectedApp.status === 'OFFERED' && (
                            <Button
                              isLoading={updating}
                              onClick={() => updateStatus(selectedApp.id, 'HIRED')}
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs"
                            >
                              Mark as Hired
                            </Button>
                          )}

                          <Button
                            isLoading={updating}
                            onClick={() => updateStatus(selectedApp.id, 'REJECTED')}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold text-xs ml-auto"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>

        {/* Schedule Interview Modal */}
        <AnimatePresence>
          {showInterviewModal && selectedApp && (
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
                    <p className="text-sm text-slate-500">For {selectedApp.student?.firstName} {selectedApp.student?.lastName}</p>
                  </div>
                  <button onClick={() => setShowInterviewModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Interview Title</label>
                    <input
                      type="text" required placeholder="e.g., Round 1: Technical Discussion"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      value={interviewForm.title} onChange={e => setInterviewForm({ ...interviewForm, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Round Number</label>
                      <input
                        type="number" min="1" required
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        value={interviewForm.roundNumber} onChange={e => setInterviewForm({ ...interviewForm, roundNumber: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Interview Type</label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        value={interviewForm.type} onChange={e => setInterviewForm({ ...interviewForm, type: e.target.value })}
                      >
                        <option value="TECHNICAL">Technical</option>
                        <option value="HR">HR</option>
                        <option value="BEHAVIORAL">Behavioral</option>
                        <option value="MACHINE_CODING">Machine Coding</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Assign Interviewer</label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        value={interviewForm.interviewerId} onChange={e => setInterviewForm({ ...interviewForm, interviewerId: e.target.value })}
                      >
                        <option value="" disabled>Select...</option>
                        {interviewers.map(inv => (
                          <option key={inv.id} value={inv.id}>{inv.name || inv.firstName + ' ' + inv.lastName} ({inv.email})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                      <input
                        type="datetime-local" required
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        value={interviewForm.scheduledAt} onChange={e => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Mins)</label>
                      <input
                        type="number" min="15" step="15" required
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        value={interviewForm.durationMinutes} onChange={e => setInterviewForm({ ...interviewForm, durationMinutes: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Link (Optional)</label>
                    <input
                      type="url" placeholder="https://meet.google.com/..."
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      value={interviewForm.meetingLink} onChange={e => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
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

      </div>
    </DashboardLayout>
  );
}
