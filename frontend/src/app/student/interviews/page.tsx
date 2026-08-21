'use client';
import { API_ROUTES } from '@/constants/api.routes';
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Pagination } from '@/components/shared/Pagination';
import { Calendar, Search, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/services/api/api.client';
import { toast } from 'sonner';

type TabType = 'All' | 'Upcoming' | 'Completed' | 'Cancelled';

export default function StudentInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res: any = await apiClient.get(API_ROUTES.STUDENT.INTERVIEWS);
        setInterviews(res.data || []);
      } catch (err) {
        toast.error('Failed to retrieve interviews');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Filter logic
  const filteredInterviews = interviews.filter((inv) => {
    const matchesSearch = inv.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTab = false;
    if (activeTab === 'All') {
      matchesTab = true;
    } else if (activeTab === 'Upcoming') {
      matchesTab = inv.status === 'SCHEDULED' || inv.status === 'RESCHEDULED';
    } else if (activeTab === 'Completed') {
      matchesTab = inv.status === 'COMPLETED';
    } else if (activeTab === 'Cancelled') {
      matchesTab = inv.status === 'CANCELLED';
    }

    return matchesSearch && matchesTab;
  }).sort((a: any, b: any) => {
    const timeA = new Date(a.scheduledAt).getTime();
    const timeB = new Date(b.scheduledAt).getTime();
    if (timeA === timeB) {
      // Secondary sort by ID if dates are identical
      return (b.id || '').localeCompare(a.id || '');
    }
    return timeA - timeB;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const paginatedInterviews = filteredInterviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    all: interviews.length,
    upcoming: interviews.filter(i => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED').length,
    completed: interviews.filter(i => i.status === 'COMPLETED').length,
    cancelled: interviews.filter(i => i.status === 'CANCELLED').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8 pb-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Interviews</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Scheduled & completed interview rounds
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

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 text-center border-t-4 border-t-teal-400 bg-white rounded-xl shadow-sm border-x-0 border-b-0">
            <p className="text-3xl font-black text-teal-500">{stats.upcoming}</p>
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">Upcoming</p>
          </GlassCard>
          
          <GlassCard className="p-6 text-center border-t-4 border-t-amber-400 bg-white rounded-xl shadow-sm border-x-0 border-b-0">
            <p className="text-3xl font-black text-amber-500">{stats.completed}</p>
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">Completed</p>
          </GlassCard>

          <GlassCard className="p-6 text-center border-t-4 border-t-slate-300 bg-white rounded-xl shadow-sm border-x-0 border-b-0">
            <p className="text-3xl font-black text-slate-400">{stats.cancelled}</p>
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">Cancelled</p>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
          {(['All', 'Upcoming', 'Completed', 'Cancelled'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List Section */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
            </div>
          ) : filteredInterviews.length === 0 ? (
            <GlassCard className="p-20 text-center rounded-2xl border-slate-100/50 bg-white">
              <Calendar size={48} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-lg">No {activeTab.toLowerCase()} interviews found</p>
            </GlassCard>
          ) : (
            <AnimatePresence mode="popLayout">
              {paginatedInterviews.map((inv) => {
                const dateObj = new Date(inv.scheduledAt);
                const isPast = dateObj.getTime() < new Date().getTime();
                const isUpcomingStatus = inv.status === 'SCHEDULED' || inv.status === 'RESCHEDULE_REQUESTED' || inv.status === 'CANCELLATION_REQUESTED';
                const isUpcoming = isUpcomingStatus && !isPast;
                const isPendingReview = isUpcomingStatus && isPast;
                
                return (
                  <motion.div
                    key={inv.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GlassCard className={`p-6 bg-white rounded-2xl border-l-4 ${isUpcoming ? 'border-l-rose-500' : isPendingReview ? 'border-l-blue-500' : 'border-l-slate-300'} border-y-slate-100 border-r-slate-100 shadow-sm hover:shadow-md transition-shadow relative`}>
                      
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <Calendar size={14} className="text-blue-500" />
                          </div>
                          <h3 className="font-extrabold text-slate-800 text-base">
                            {inv.companyName} &bull; {inv.title} &bull; {inv.type?.replace('_', ' ') || 'TECHNICAL'}
                          </h3>
                        </div>
                        
                        {/* Status Pill */}
                        {isUpcoming ? (
                          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider">
                            Upcoming
                          </span>
                        ) : isPendingReview ? (
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                            Under Review
                          </span>
                        ) : inv.status === 'COMPLETED' ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                            Completed
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                            Cancelled
                          </span>
                        )}
                      </div>

                      {/* Detail Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                          <p className="font-bold text-slate-800 text-sm">
                            {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                          <p className="font-bold text-slate-800 text-sm">
                            {dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mode</p>
                          <p className="font-bold text-slate-800 text-sm">
                            AI Interview
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 relative group overflow-hidden">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Venue</p>
                          <p className="font-bold text-slate-800 text-sm truncate">
                            CareerHub AI Platform
                          </p>
                          
                          {/* Join Link Overlay (Hover) */}
                          {isUpcoming && (
                            <button 
                              onClick={() => window.location.href = `/student/interviews/${inv.id}`}
                              className="absolute inset-0 bg-rose-500 text-white font-bold text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                            >
                              Join AI Interview
                            </button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="mt-4">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
