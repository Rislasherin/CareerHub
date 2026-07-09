'use client';
import { API_ROUTES } from '@/constants/api.routes';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Briefcase, Building2, MapPin, Clock, Calendar, CheckCircle2, XCircle, AlertCircle, Eye, Search, Trophy, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/redux/hooks';
import { apiClient } from '@/services/api/api.client';
import { toast } from 'sonner';
import { ApiResponse } from '@/types/api';

const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
  applied: { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Clock, label: 'Applied' },
  under_review: { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Eye, label: 'Under Review' },
  shortlisted: { color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: CheckCircle2, label: 'Shortlisted' },
  interviewing: { color: 'text-purple-600 bg-purple-50 border-purple-100', icon: Calendar, label: 'Interviewing' },
  rejected: { color: 'text-rose-600 bg-rose-50 border-rose-100', icon: XCircle, label: 'Rejected' },
  offered: { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: Trophy, label: 'Offered' },
  hired: { color: 'text-teal-600 bg-teal-50 border-teal-100', icon: CheckCircle2, label: 'Hired' },
};

export default function StudentApplicationsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.student.details);
  
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      if (user.status === 'PENDING_VERIFICATION') {
        router.push('/student/waitlist');
      } else if (user.status === 'REJECTED' || (user.status === 'PENDING_INVITE' && !user.proofUrl)) {
        router.push('/student/verify');
      }
    }
  }, [user, router]);

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

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => {
    const jobTitle = app.job?.title?.toLowerCase() || '';
    const companyName = app.job?.companyName?.toLowerCase() || '';
    return jobTitle.includes(searchQuery.toLowerCase()) || companyName.includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8 pb-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Applications</h1>
            <p className="text-slate-400 font-medium text-xs mt-1">
              Track the status of your job applications
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search company, job..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none"
              />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <GlassCard className="p-20 text-center rounded-[2.5rem] border-slate-100/50">
            <Briefcase size={40} className="text-slate-300 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-400 font-bold text-lg mb-1">No applications found</p>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">You haven't applied to any jobs yet or none matched your search.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((app) => {
              const job = app.job || {};
              const status = app.status || 'applied';
              const conf = statusConfig[status] || statusConfig['applied'];
              const Icon = conf.icon;

              const formattedDate = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'Recently';

              return (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative"
                >
                  <GlassCard className="p-6 h-full flex flex-col justify-between rounded-[2rem] border-slate-100/50 hover:border-rose-500/20 hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-300 bg-white">
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-500 text-lg uppercase shadow-sm">
                            {(job.companyName || 'C').charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-800 text-sm block">{job.companyName || 'Company'}</span>
                            <h3 className="font-black text-slate-900 text-base leading-tight mt-0.5">
                              {job.title || 'Job Title'}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Location, Type */}
                      <div className="flex flex-wrap gap-2 pt-1 text-slate-400 font-bold text-[11px]">
                        {job.location && (
                          <span className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" /> {job.location}
                          </span>
                        )}
                        {job.type && (
                          <span className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 flex items-center gap-1 capitalize">
                            <Briefcase size={12} className="text-slate-400" /> {job.type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      
                      {/* Date */}
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Calendar size={10} /> Applied on {formattedDate}
                      </div>

                      {/* Interview Details (If Interviewing) */}
                      {status === 'interviewing' && app.interview && (
                        <div className="mt-2 p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl relative overflow-hidden group-hover:border-indigo-200 transition-colors">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full"></div>
                          <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <Clock size={10} /> Upcoming Interview
                          </p>
                          <p className="font-bold text-slate-800 text-xs mb-0.5">{app.interview.title || 'Technical Discussion'}</p>
                          <p className="font-black text-indigo-700 text-xs">
                            {new Date(app.interview.scheduledAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </p>
                          {app.interview.meetingLink && (
                            <a 
                              href={app.interview.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                            >
                              <ExternalLink size={12} /> Join Meeting
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-100/40 flex items-center justify-between gap-3">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${conf.color}`}>
                        <Icon size={12} /> {conf.label}
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
