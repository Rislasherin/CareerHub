'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/redux/hooks';
import { getStudentDashboardStats } from '@/services/student/dashboard.service';
import { StudentDashboardStats } from '@/types/student-dashboard';
import { 
  StudentWelcome, 
  StudentQuickStats, 
  CareerAssistant, 
  RecommendedJobs, 
  RecentApplications, 
  AIPracticeWidget, 
  ResumeWidget, 
  UpcomingWidget, 
  DashboardSkeletons 
} from './components/dashboard/DashboardComponents';

export default function StudentDashboard() {
  const router = useRouter();
  const user = useAppSelector((state) => state.student.details);
  
  const [data, setData] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardData = await getStudentDashboardStats();
      setData(dashboardData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.status === 'PENDING_VERIFICATION') {
        router.push('/student/waitlist');
      } else if (user.status === 'REJECTED' || (user.status === 'PENDING_INVITE' && !user.proofUrl)) {
        router.push('/student/verify');
      } else if (user.status === 'ACTIVE') {
        fetchDashboardData();
      }
    }
  }, [user, router]);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {loading || !data ? (
          <DashboardSkeletons />
        ) : (
          <div className="flex flex-col gap-6">
            <StudentWelcome user={user} profileCompletion={data.stats.profileCompletion} />
            <CareerAssistant nextAction={data.nextAction} />
            <StudentQuickStats stats={data.stats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8 flex flex-col">
                <div className="flex-1 min-h-0"><RecommendedJobs jobs={data.recommendedJobs} /></div>
                <div className="flex-1 min-h-0"><RecentApplications applications={data.recentApplications} /></div>
              </div>
              <div className="space-y-8">
                <AIPracticeWidget data={data.aiPractice} />
                <ResumeWidget resume={data.resume} />
                <UpcomingWidget events={data.upcomingEvents} />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
