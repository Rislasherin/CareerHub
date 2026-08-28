'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Building2, Users, Search, 
  Filter, CheckCircle2, XCircle, MoreVertical, 
  ChevronRight, CalendarDays, ExternalLink 
} from 'lucide-react';
import { getCollegeInterviews } from '@/services/college/placement.service';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
};

const formatTime = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dateStr));
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

const isFuture = (date: Date) => {
  return date.getTime() > new Date().getTime();
};

interface Interview {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  student: {
    firstName: string;
    lastName: string;
    rollNumber: string;
  };
  job: {
    title: string;
  };
  company: {
    companyName: string;
  };
}

export default function CollegeInterviewTracker() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      const response = await getCollegeInterviews();
      if (response.success) {
        setInterviews(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const filteredInterviews = useMemo(() => {
    return interviews.filter(int => {
      const matchesSearch = 
        `${int.student?.firstName} ${int.student?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        int.company?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        int.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || int.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [interviews, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      today: interviews.filter(i => isToday(new Date(i.scheduledAt))).length,
      upcoming: interviews.filter(i => isFuture(new Date(i.scheduledAt)) && i.status === 'SCHEDULED').length,
      completed: interviews.filter(i => i.status === 'COMPLETED').length,
      total: interviews.length
    };
  }, [interviews]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Scheduled' };
      case 'IN_PROGRESS': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', label: 'In Progress' };
      case 'COMPLETED': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Completed' };
      case 'CANCELLED': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', label: 'Cancelled' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', label: status };
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Interview Tracker</h1>
            <p className="text-slate-500 font-medium">Monitor upcoming and past interviews for your students.</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Interviews Today', value: stats.today, icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Upcoming', value: stats.upcoming, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Total Tracked', value: stats.total, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</span>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900">{stat.value}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by student, company, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar items-center">
            {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  statusFilter === status 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {status === 'ALL' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Company & Role</th>
                  <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                  <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredInterviews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-500 font-medium">
                        No interviews found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInterviews.map((interview) => {
                      const statusConfig = getStatusConfig(interview.status);
                      return (
                        <motion.tr 
                          key={interview.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="p-6">
                            <div className="font-bold text-slate-900">
                              {interview.student?.firstName} {interview.student?.lastName}
                            </div>
                            <div className="text-xs font-medium text-slate-500 mt-0.5">{interview.student?.rollNumber || 'N/A'}</div>
                          </td>
                          <td className="p-6">
                            <div className="font-bold text-slate-900">{interview.company?.companyName}</div>
                            <div className="text-xs font-medium text-slate-500 mt-0.5">{interview.job?.title}</div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <Calendar size={14} className="text-slate-400" />
                              {formatDate(interview.scheduledAt)}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                              <Clock size={12} />
                              {formatTime(interview.scheduledAt)} • {interview.durationMinutes}m
                            </div>
                          </td>
                          <td className="p-6">
                            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-[11px] font-black text-slate-600 uppercase tracking-widest">
                              {interview.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-6">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-widest ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                              {statusConfig.label}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
