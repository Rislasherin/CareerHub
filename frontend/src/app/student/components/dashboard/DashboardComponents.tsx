import React from 'react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { 
  Briefcase, Calendar, Star, TrendingUp, ChevronRight, ArrowUpRight, 
  Search, CheckCircle2, ShieldCheck, UserCircle, AlertCircle, MapPin, 
  Clock, FileText, Zap, Award
} from 'lucide-react';
import Link from 'next/link';
import { StudentDashboardStats } from '@/types/student-dashboard';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const StudentWelcome = ({ user, profileCompletion }: { user: any, profileCompletion: number }) => (
  <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 mt-4">
    <div>
      <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
        Good morning, {user?.firstName || 'Student'} 👋
      </h1>
      <p className="text-slate-500 font-medium">Here's what's happening with your career journey.</p>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Profile Strength</span>
        <div className="flex items-center gap-3">
          <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${profileCompletion}%` }} />
          </div>
          <span className="text-sm font-black text-slate-900">{profileCompletion}%</span>
        </div>
      </div>
      <div className="w-px h-10 bg-slate-200 mx-2" />
      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black uppercase overflow-hidden border border-indigo-100">
        {user?.firstName?.[0]}{user?.lastName?.[0]}
      </div>
    </div>
  </header>
);

export const StudentQuickStats = ({ stats }: { stats: StudentDashboardStats['stats'] }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <GlassCard className="p-6 rounded-2xl border-slate-100 flex flex-col justify-between h-32 hover:border-indigo-200 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Applications</span>
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center"><Briefcase size={16} /></div>
      </div>
      <h3 className="text-3xl font-black text-slate-900">{stats.applications}</h3>
    </GlassCard>
    
    <GlassCard className="p-6 rounded-2xl border-slate-100 flex flex-col justify-between h-32 hover:border-emerald-200 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interviews</span>
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center"><Calendar size={16} /></div>
      </div>
      <h3 className="text-3xl font-black text-slate-900">{stats.interviews}</h3>
    </GlassCard>

    <GlassCard className="p-6 rounded-2xl border-slate-100 flex flex-col justify-between h-32 hover:border-amber-200 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shortlisted</span>
        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center"><Award size={16} /></div>
      </div>
      <h3 className="text-3xl font-black text-slate-900">{stats.shortlisted}</h3>
    </GlassCard>

    <GlassCard className="p-6 rounded-2xl border-slate-100 flex flex-col justify-between h-32 hover:border-blue-200 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profile</span>
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><UserCircle size={16} /></div>
      </div>
      <h3 className="text-3xl font-black text-slate-900">{stats.profileCompletion}%</h3>
    </GlassCard>
  </div>
);

export const CareerAssistant = ({ nextAction }: { nextAction: StudentDashboardStats['nextAction'] }) => {
  if (!nextAction) return null;
  
  return (
    <div className="relative p-8 rounded-3xl bg-indigo-600 text-white overflow-hidden shadow-xl shadow-indigo-600/20 mb-8">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest border border-white/10 mb-2">
            <Zap size={14} /> Recommended Next Step
          </div>
          <h2 className="text-2xl font-black tracking-tight">{nextAction.title}</h2>
          <p className="text-indigo-100 font-medium max-w-xl text-sm leading-relaxed">
            {nextAction.description}
          </p>
        </div>
        <Link href={nextAction.actionLink}>
          <Button className="bg-white text-indigo-600 hover:bg-slate-50 border-none font-black text-xs uppercase tracking-widest py-3 px-6 whitespace-nowrap">
            {nextAction.actionText}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export const RecommendedJobs = ({ jobs }: { jobs: StudentDashboardStats['recommendedJobs'] }) => (
  <GlassCard className="p-8 rounded-3xl border-slate-100 flex flex-col h-full">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-black text-slate-900 tracking-tight">Recommended for You</h3>
      <Link href="/student/jobs" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1">
        View All <ChevronRight size={14} />
      </Link>
    </div>
    
    {jobs.length === 0 ? (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
          <Search size={24} />
        </div>
        <p className="text-slate-500 font-bold max-w-[200px]">No active job matches found at the moment.</p>
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        {jobs.map(job => (
          <Link href={`/student/jobs/${job.id}`} key={job.id} className="group p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all bg-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                <p className="text-xs font-bold text-slate-500 mt-1">{job.company}</p>
              </div>
              <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black tracking-wider">
                {job.matchPercentage}% Match
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-4">
              <span className="flex items-center gap-1.5"><MapPin size={12} /> {job.location}</span>
              <span className="flex items-center gap-1.5"><Briefcase size={12} /> {job.employmentType}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {job.skills.map(skill => (
                <span key={skill} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md border border-slate-100">
                  {skill}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    )}
  </GlassCard>
);

export const RecentApplications = ({ applications }: { applications: StudentDashboardStats['recentApplications'] }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'UNDER_REVIEW': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'SHORTLISTED': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'INTERVIEW_SCHEDULED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'SELECTED': case 'OFFERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <GlassCard className="p-8 rounded-3xl border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">My Applications</h3>
        <Link href="/student/applications" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1">
          View All <ChevronRight size={14} />
        </Link>
      </div>
      
      {applications.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-slate-500 font-bold mb-4">You haven't applied to any jobs yet.</p>
          <Link href="/student/jobs">
            <Button variant="outline" className="text-xs uppercase tracking-widest font-black">Explore Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                  <Briefcase size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{app.jobTitle}</h4>
                  <p className="text-xs font-medium text-slate-500">{app.company} • Applied {dayjs(app.appliedDate).fromNow()}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${getStatusColor(app.status)}`}>
                {app.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export const AIPracticeWidget = ({ data }: { data: StudentDashboardStats['aiPractice'] }) => (
  <GlassCard className="p-8 rounded-3xl border-slate-100 bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
        <Star className="text-amber-400 fill-amber-400" size={20} /> AI Practice
      </h3>
      <div className="px-2 py-1 bg-white/10 text-white rounded-md text-[10px] font-black tracking-widest uppercase">
        {data?.practicesCompleted || 0} Sessions
      </div>
    </div>
    
    {!data?.hasPracticed ? (
      <div className="text-center py-6">
        <p className="text-indigo-200 text-sm font-medium mb-6">Prepare for your next interview with AI-powered practice.</p>
        <Link href="/student/ai-practice">
          <Button className="bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs uppercase tracking-widest border-none w-full">
            Start Practice
          </Button>
        </Link>
      </div>
    ) : (
      <div>
        <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/10">
          <div>
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Latest Score</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">{data.latestScore}%</span>
              <span className={`text-sm font-bold mb-1 flex items-center ${
                (data.latestScore || 0) >= 80 ? 'text-emerald-400' :
                (data.latestScore || 0) >= 60 ? 'text-amber-400' :
                'text-rose-400'
              }`}>
                <TrendingUp size={14} className="mr-1"/> 
                {(data.latestScore || 0) >= 80 ? 'Excellent' :
                 (data.latestScore || 0) >= 60 ? 'Good' :
                 'Needs Practice'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Role</p>
            <p className="text-sm font-black">{data.jobRole}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Focus Area</p>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-sm font-medium text-indigo-100">
            {data.weakestArea}
          </div>
        </div>
        
        <Link href="/student/ai-practice">
          <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-black text-xs uppercase tracking-widest border-none w-full">
            Practice Again
          </Button>
        </Link>
      </div>
    )}
  </GlassCard>
);

export const ResumeWidget = ({ resume }: { resume: StudentDashboardStats['resume'] }) => (
  <GlassCard className="p-6 rounded-3xl border-slate-100">
    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Your Resume</h3>
    {!resume?.hasResume ? (
      <div className="text-center py-4">
        <p className="text-slate-500 text-xs font-bold mb-4">No resume uploaded yet.</p>
        <Link href="/student/resume">
          <Button variant="outline" className="text-[10px] uppercase tracking-widest font-black h-8">Create Resume</Button>
        </Link>
      </div>
    ) : (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <FileText size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">{resume.resumeName}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Updated {dayjs(resume.updatedAt).fromNow()}</p>
          </div>
        </div>
        {resume.atsScore !== undefined && (
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ATS Score</span>
            <span className="text-lg font-black text-emerald-600">{resume.atsScore}</span>
          </div>
        )}
      </div>
    )}
  </GlassCard>
);

export const UpcomingWidget = ({ events }: { events: StudentDashboardStats['upcomingEvents'] }) => (
  <GlassCard className="p-6 rounded-3xl border-slate-100">
    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Upcoming</h3>
    {events.length === 0 ? (
      <p className="text-slate-500 text-xs font-bold py-4 text-center">No upcoming interviews or events.</p>
    ) : (
      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase">{dayjs(event.date).format('MMM')}</span>
              <span className="text-lg font-black text-slate-900 leading-none">{dayjs(event.date).format('DD')}</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{event.title}</h4>
              <p className="text-xs font-semibold text-slate-500">{event.company}</p>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{dayjs(event.date).format('h:mm A')}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </GlassCard>
);

export const DashboardSkeletons = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-24 bg-slate-100 rounded-3xl" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
    </div>
    <div className="h-32 bg-slate-100 rounded-3xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="h-96 bg-slate-100 rounded-3xl" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
      <div className="space-y-8">
        <div className="h-72 bg-slate-100 rounded-3xl" />
        <div className="h-32 bg-slate-100 rounded-3xl" />
        <div className="h-48 bg-slate-100 rounded-3xl" />
      </div>
    </div>
  </div>
);
