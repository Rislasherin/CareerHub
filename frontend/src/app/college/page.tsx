'use client';
import { API_ROUTES } from '@/constants/api.routes';
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Users,
  ShieldCheck,
  Calendar,
  Briefcase,
  FileText,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Activity,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileSearch,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/shared/Button';
import { apiClient } from '@/services/api/api.client';
import { useAppSelector } from '@/redux/hooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function CollegeDashboard() {
  const [stats, setStats] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const collegeName = useAppSelector(state => state.collegeAdmin.details?.collegeName);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response: any = await apiClient.get(API_ROUTES.COLLEGE.DASHBOARD_STATS);
        if (response.success) {
          setStats(response.data);
        } else {
          setError('Failed to load dashboard data.');
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
        setError('Unable to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-slate-500 font-medium">Loading dashboard insights...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl flex items-center gap-3">
            <AlertTriangle size={20} />
            <span className="font-bold">{error}</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const summaryCards = [
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Placement Ready', value: stats?.placementReady ?? 0, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Jobs', value: stats?.activeJobs ?? 0, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Applications', value: stats?.totalApplications ?? 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Needs Attention', value: stats?.studentsNeedingAttention ?? 0, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto flex flex-col gap-10 pb-12">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Good morning, {collegeName || 'Admin'}
            </h1>
            <p className="text-slate-500 font-medium">Here's what needs your attention today and veryday.</p>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      
          {summaryCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-6`}>
                <card.icon size={24} />
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-black text-slate-900 block">{card.value}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{card.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* First Row: Students Needing Attention & Latest Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Students Needing Attention */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Students Needing Attention</h2>
              <Link href="/college/placement-readiness" className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700">
                View Readiness <ChevronRight size={14} />
              </Link>
            </div>
            
            {stats?.studentsNeedingAttentionList?.length > 0 ? (
              <div className="space-y-4">
                {stats.studentsNeedingAttentionList.map((student: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-slate-900">{student.name}</span>
                      <span className="text-xs font-medium text-slate-500">{student.department} • {student.mainGap}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                      student.status === 'AT_RISK' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {student.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <CheckCircle2 size={32} className="text-emerald-400 mb-3" />
                <p className="text-sm font-bold text-slate-600">All caught up!</p>
                <p className="text-xs text-slate-400">No students currently flagged as At Risk.</p>
              </div>
            )}
          </div>

          {/* Latest Job Opportunities */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Latest Job Opportunities</h2>
              <Link href="/college/jobs" className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700">
                View All Jobs <ChevronRight size={14} />
              </Link>
            </div>

            {stats?.latestJobs?.length > 0 ? (
              <div className="space-y-4">
                {stats.latestJobs.map((job: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-slate-900">{job.title}</span>
                      <span className="text-xs font-medium text-slate-500">{job.companyName}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-slate-400">{dayjs(job.postedDate).fromNow()}</span>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{job.applicationsCount} applicants</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Briefcase size={32} className="text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-600">No active jobs</p>
                <p className="text-xs text-slate-400">There are no approved job postings right now.</p>
              </div>
            )}
          </div>

        </div>

        {/* Second Row: Application Activity & Student Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Application Activity Snapshot */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Application Activity</h2>
              <Link href="/college/reports" className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700">
                Detailed Analytics <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Under Review', count: stats?.applicationActivity?.underReview || 0, color: 'bg-amber-500' },
                { label: 'Interview Stage', count: stats?.applicationActivity?.interviewStage || 0, color: 'bg-indigo-500' },
                { label: 'Selected', count: stats?.applicationActivity?.selected || 0, color: 'bg-emerald-500' },
                { label: 'Rejected', count: stats?.applicationActivity?.rejected || 0, color: 'bg-rose-500' },
              ].map((item, i) => {
                const total = stats?.applicationActivity?.total || 0;
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="text-slate-900">{item.count} <span className="text-slate-400 font-medium">({percentage}%)</span></span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Engagement */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Student Engagement</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-indigo-50 flex flex-col items-center text-center justify-center gap-3">
                <span className="text-4xl font-black text-indigo-600">{stats?.studentEngagement?.profileCompleted ?? 0}%</span>
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Profile Completed</span>
              </div>
              <div className="p-6 rounded-2xl bg-emerald-50 flex flex-col items-center text-center justify-center gap-3">
                <span className="text-4xl font-black text-emerald-600">{stats?.studentEngagement?.resumeCompleted ?? 0}%</span>
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Resume Uploaded</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Activity size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Push for higher engagement</h4>
                <p className="text-xs text-slate-500 mt-1">Students with completed profiles and resumes are 3x more likely to be shortlisted for interviews.</p>
              </div>
            </div>
          </div>
          
        </div>

        {/* Third Row: Skill Gaps & Action Center */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* College Skill Gaps */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">College Skill Gaps</h2>
              <Link href="/college/placement-readiness" className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700">
                View Insights <ChevronRight size={14} />
              </Link>
            </div>
            
            {stats?.skillGaps?.length > 0 ? (
              <div className="space-y-4">
                {stats.skillGaps.map((gap: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-bold text-slate-900">{gap.skill}</span>
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full">{gap.studentsMissing} students missing</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <TrendingUp size={32} className="text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-600">No skill gaps identified</p>
                <p className="text-xs text-slate-400">Students possess all skills currently demanded.</p>
              </div>
            )}
          </div>

          {/* Action Center */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Action Center</h2>
            </div>
            
            <div className="space-y-4">
              {stats?.studentsNeedingAttention > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 flex items-start gap-4">
                  <div className="mt-0.5">
                    <AlertTriangle size={18} className="text-rose-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-rose-900">{stats.studentsNeedingAttention} students need placement intervention</h4>
                    <Link href="/college/placement-readiness" className="text-xs font-black uppercase tracking-wider text-rose-600 mt-2 inline-flex items-center gap-1">
                      Review Readiness <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              )}
              
              {stats?.placementReady > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50 flex items-start gap-4">
                  <div className="mt-0.5">
                    <UserCheck size={18} className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-emerald-900">{stats.placementReady} students are placement-ready</h4>
                    <Link href="/college/students" className="text-xs font-black uppercase tracking-wider text-emerald-600 mt-2 inline-flex items-center gap-1">
                      View Students <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              )}

              {stats?.activeJobs > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50 flex items-start gap-4">
                  <div className="mt-0.5">
                    <Briefcase size={18} className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-blue-900">{stats.activeJobs} active job opportunities available</h4>
                    <Link href="/college/jobs" className="text-xs font-black uppercase tracking-wider text-blue-600 mt-2 inline-flex items-center gap-1">
                      View Jobs <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}



