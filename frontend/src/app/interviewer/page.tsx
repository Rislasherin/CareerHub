'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Video, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  FileText, 
  User, 
  CheckCircle2,
  CalendarDays,
  Users,
  Briefcase
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { apiClient } from '@/services/api/api.client';
import { API_ROUTES } from '@/constants/api.routes';

export default function InterviewerDashboard() {
  const interviewer = useAppSelector(state => state.interviewer.details);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real schedule from our new backend endpoint!
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response: any = await apiClient.get(API_ROUTES.INTERVIEWER.DASHBOARD);
        setInterviews(response.data);
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const upcomingInterviews = interviews.filter(i => i.status === 'SCHEDULED');
  const pastInterviews = interviews.filter(i => i.status !== 'SCHEDULED');

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Welcome back, {interviewer?.firstName || 'Interviewer'}! 👋</h1>
            <p className="text-slate-500 font-medium">Manage your interview schedule and provide candidate feedback.</p>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-slate-900 rounded-[3rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-black mb-4 tracking-tight">Ready to evaluate?</h2>
              <p className="text-slate-400 font-medium text-lg max-w-lg mb-8">
                {upcomingInterviews.length > 0 
                  ? `You have ${upcomingInterviews.length} upcoming interviews scheduled. Review their profiles below.`
                  : "Your interview schedule is currently empty. You will receive notifications when HR assigns new candidates for evaluation."}
              </p>
            </div>
            <div className="hidden lg:block">
              <CalendarDays size={180} className="text-white/5" />
            </div>
          </div>
        </section>

        {/* Dynamic Empty States / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Assigned Interviews', value: upcomingInterviews.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
             { label: 'Pending Feedback', value: pastInterviews.filter(i => !i.feedback).length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
             { label: 'Completed Reviews', value: pastInterviews.filter(i => i.feedback).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           ].map((stat, i) => (
             <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                   <stat.icon size={28} />
                </div>
                <div>
                   <div className="text-3xl font-black text-slate-900">{loading ? '-' : stat.value}</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
             </div>
           ))}
        </div>

        {/* Dynamic Schedule Block */}
        {!loading && interviews.length > 0 ? (
          <div className="space-y-6">
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Upcoming Schedule</h3>
             <div className="grid gap-4">
                {upcomingInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} isUpcoming={true} />
                ))}
             </div>
          </div>
        ) : !loading && interviews.length === 0 ? (
          <section className="p-12 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center py-24 bg-slate-50/50">
             <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-300 mb-6">
                <Clock size={40} />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">Interviews haven't started yet</h3>
             <p className="text-slate-500 font-medium max-w-md">
                The placement season is in the registration phase. Once students are verified and companies post jobs, your interview schedule will appear here.
             </p>
          </section>
        ) : (
           <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
           </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Brand new component to render the scheduled candidates!
function InterviewCard({ interview, isUpcoming }: { interview: any; isUpcoming: boolean }) {
  const dateObj = new Date(interview.scheduledAt);
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
      
      {/* Left side: Date & Time block */}
      <div className="flex shrink-0 items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100/50 w-full md:w-56">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-indigo-600">
          <Calendar size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{formattedDate}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1">{formattedTime} • {interview.durationMinutes}m</p>
        </div>
      </div>

      {/* Middle: Info */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">{interview.type} ROUND</p>
          <h3 className="text-lg font-bold text-slate-900">{interview.title}</h3>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-2">
            <Briefcase size={14} /> {interview.job.title}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <User size={14} />
            </div>
            <span className="text-sm font-bold text-slate-900">{interview.candidate.name}</span>
          </div>
          {interview.candidate.resumeUrl && (
            <a href={interview.candidate.resumeUrl} target="_blank" rel="noreferrer" 
               className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors w-max">
              <FileText size={14} /> View Candidate Resume
            </a>
          )}
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex flex-col gap-3 shrink-0 md:w-48">
        {isUpcoming && interview.meetingLink ? (
          <a href={interview.meetingLink} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-3 px-4 rounded-xl shadow-sm transition-all">
            <Video size={16} /> Join Meeting
          </a>
        ) : isUpcoming && !interview.meetingLink ? (
          <button disabled className="w-full bg-slate-100 text-slate-400 text-sm font-bold py-3 px-4 rounded-xl cursor-not-allowed">
            No Link Provided
          </button>
        ) : null}
        
        <button className="flex items-center justify-center gap-2 w-full bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-700 text-sm font-bold py-3 px-4 rounded-xl shadow-sm transition-all group-hover:bg-slate-50">
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
