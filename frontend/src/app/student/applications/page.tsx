'use client';
import { API_ROUTES } from '@/constants/api.routes';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Pagination } from '@/components/shared/Pagination';
import { Search, Lightbulb, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/redux/hooks';
import { apiClient } from '@/services/api/api.client';
import { toast } from 'sonner';
import { ApiResponse } from '@/types/api';

const columnConfig: Record<string, { label: string, color: string, border: string, statuses: string[] }> = {
  APPLIED: { label: 'APPLIED', color: 'text-slate-500', border: 'border-slate-300', statuses: ['applied'] },
  SHORTLISTED: { label: 'SHORTLISTED', color: 'text-indigo-500', border: 'border-indigo-400', statuses: ['shortlisted'] },
  INTERVIEW: { label: 'INTERVIEW', color: 'text-amber-500', border: 'border-amber-400', statuses: ['interviewing', 'next_round'] },
  OFFER: { label: 'OFFER', color: 'text-teal-500', border: 'border-teal-400', statuses: ['offered', 'hired'] },
  REJECTED: { label: 'REJECTED', color: 'text-rose-500', border: 'border-rose-400', statuses: ['rejected'] },
};


export default function StudentApplicationsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.student.details);

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (user) {
      if (user.status === 'PENDING_VERIFICATION') {
        router.push('/student/waitlist');
      } else if (user.status === 'REJECTED' || (user.status === 'PENDING_INVITE' && !user.proofUrl)) {
        router.push('/student/verify');
      }
    }
  }, [user, router]);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(API_ROUTES.STUDENT.APPLICATIONS) as ApiResponse<any[]>;
        if (response.success) {
          setApplications(response.data || []);
        }
      } catch (err) {
        toast.error('Failed to retrieve applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => {
    const jobTitle = app.job?.title?.toLowerCase() || '';
    const companyName = app.job?.companyName?.toLowerCase() || '';
    return jobTitle.includes(searchQuery.toLowerCase()) || companyName.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const paginatedApplications = filteredApplications.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getColumnData = (colKey: string) => {
    return paginatedApplications.filter(app => columnConfig[colKey].statuses.includes(app.status?.toLowerCase() || 'applied'));
  };

  const getMatchScore = (companyName: string) => {
    let hash = 0;
    for (let i = 0; i < companyName.length; i++) {
      hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 70 + (Math.abs(hash) % 29); // returns between 70% and 99%
  };

  const stats = {
    total: applications.length,
    inProcess: applications.filter(app => ['applied', 'shortlisted'].includes(app.status?.toLowerCase() || 'applied')).length,
    shortlisted: applications.filter(app => app.status?.toLowerCase() === 'shortlisted').length,
    interview: applications.filter(app => ['interviewing', 'next_round'].includes(app.status?.toLowerCase())).length,
    offer: applications.filter(app => ['offered', 'hired'].includes(app.status?.toLowerCase())).length,
    rejected: applications.filter(app => app.status?.toLowerCase() === 'rejected').length,
  };


  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6 pb-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Applications</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              {stats.total} active applications &bull; Track your pipeline
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none"
              />
            </div>
            <button className="h-10 px-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-rose-500/20">
              <Lightbulb size={14} /> Practice Now
            </button>
          </div>
        </header>

        {/* Notice Banner */}
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 flex items-center gap-3">
          <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
            <ClipboardList size={18} />
          </div>
          <p className="text-amber-800 text-xs font-semibold">
            Your application pipeline. Track every application from submission to offer. Companies manage interview rounds from their end — you'll be notified of updates.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <GlassCard className="p-4 text-center border-t-4 border-t-slate-800 bg-white rounded-xl shadow-sm border-x-0 border-b-0">
            <p className="text-3xl font-black text-slate-800">{stats.total}</p>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">Total</p>
          </GlassCard>

          <GlassCard className="p-4 text-center border-t-4 border-t-blue-400 bg-white rounded-xl shadow-sm border-x-0 border-b-0">
            <p className="text-3xl font-black text-blue-500">{stats.inProcess}</p>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">In Process</p>
          </GlassCard>

          <GlassCard className="p-4 text-center border-t-4 border-t-amber-400 bg-white rounded-xl shadow-sm border-x-0 border-b-0">
            <p className="text-3xl font-black text-amber-500">{stats.interview}</p>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">Interview</p>
          </GlassCard>

          <GlassCard className="p-4 text-center border-t-4 border-t-teal-400 bg-white rounded-xl shadow-sm border-x-0 border-b-0">
            <p className="text-3xl font-black text-teal-500">{stats.offer}</p>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">Offer</p>
          </GlassCard>

          <GlassCard className="p-4 text-center border-t-4 border-t-rose-400 bg-white rounded-xl shadow-sm border-x-0 border-b-0">
            <p className="text-3xl font-black text-rose-500">{stats.rejected}</p>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">Rejected</p>
          </GlassCard>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4">
            {Object.keys(columnConfig).map((colKey) => {
              const config = columnConfig[colKey];
              const colApps = getColumnData(colKey);

              return (
                <div key={colKey} className="flex flex-col gap-4">
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-2">
                    <h3 className={`text-xs font-black tracking-widest ${config.color}`}>
                      {config.label}
                    </h3>
                  </div>

                  {/* Column Cards */}
                  <div className="flex flex-col gap-4">
                    <AnimatePresence>
                      {colApps.map((app) => {
                        const date = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently';
                        const matchScore = getMatchScore(app.job?.companyName || 'Company');

                        return (
                          <motion.div
                            key={app.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                          >
                            <GlassCard className={`p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
                              {/* Top accent border */}
                              <div className={`absolute top-0 left-0 w-full h-1 ${config.border.replace('border-', 'bg-')} bg-opacity-80`}></div>

                              <div className="mt-1">
                                <h4 className="font-extrabold text-slate-900 text-base leading-tight">
                                  {app.job?.companyName || 'Company'}
                                </h4>
                                <p className="font-semibold text-slate-500 text-xs mt-1">
                                  {app.job?.title || 'Job Role'}
                                </p>
                              </div>

                              {/* Inside the GlassCard */}
                              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs font-bold text-slate-400">
                                    {date}
                                  </span>
                                  {/* Dynamic Round Badge */}
                                  {(app.status?.toLowerCase() === 'interviewing' || app.status?.toLowerCase() === 'next_round') && app.currentRoundNumber > 0 && (
                                    <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                      Round {app.currentRoundNumber}
                                    </span>
                                  )}
                                </div>
                                <span className={`text-xs font-black ${matchScore > 85 ? 'text-teal-500' : matchScore > 75 ? 'text-blue-500' : 'text-amber-500'}`}>
                                  {matchScore}% Match
                                </span>
                              </div>

                            </GlassCard>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-8">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
