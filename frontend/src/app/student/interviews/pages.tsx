'use client';
import { API_ROUTES } from '@/constants/api.routes';
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Calendar, Video, Clock, UserCircle, Building2, CheckCircle2, Clock3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/services/api/api.client'
import { toast } from 'sonner';

export default function StudentInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout>
      <div className="max-w-[1000px] mx-auto flex flex-col gap-8 pb-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Interviews</h1>
          <p className="text-slate-500 font-medium text-sm">
            Manage and join your upcoming scheduled interviews.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : interviews.length === 0 ? (
          <GlassCard className="p-20 text-center rounded-[2.5rem] border-slate-100/50">
            <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-lg">No upcoming interviews</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interviews.map((inv) => (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <GlassCard className="p-6 rounded-[2rem] border-slate-100 hover:border-indigo-200 transition-colors bg-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg">
                        {inv.type || 'TECHNICAL'} ROUND
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-3 leading-tight">{inv.title}</h3>
                    </div>
                    {inv.status === 'SCHEDULED' ? (
                       <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md"><Clock3 size={12}/> Upcoming</span>
                    ) : (
                       <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle2 size={12}/> {inv.status}</span>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                      <Building2 size={16} className="text-slate-400" /> {inv.companyName}
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                      <UserCircle size={16} className="text-slate-400" /> {inv.interviewerName}
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                      <Calendar size={16} className="text-slate-400" /> 
                      {new Date(inv.scheduledAt).toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                      <Clock size={16} className="text-slate-400" /> {inv.durationMinutes} mins
                    </div>
                  </div>

                  {inv.meetingLink && inv.status !== 'COMPLETED' && (
                    <a 
                      href={inv.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-200"
                    >
                      <Video size={18} /> Join Virtual Meeting
                    </a>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
