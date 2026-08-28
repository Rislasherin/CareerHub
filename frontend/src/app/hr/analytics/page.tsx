'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import {
   Users,
   Briefcase,
   Calendar,
   ChevronRight,
   Download,
   TrendingUp,
   BarChart3,
   Clock,
   Target,
   Award,
   Building2,
   Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { apiClient } from '@/services/api/api.client';
import { API_ROUTES } from '@/constants/api.routes';
import { CompanyAnalytics } from '@/types/analytics';

export default function HRAnalyticsPage() {
   const hrDetails = useAppSelector((state: RootState) => state.hr.details);
   const [data, setData] = useState<CompanyAnalytics | null>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all' | 'custom'>('30d');
   const [customStartDate, setCustomStartDate] = useState<string>('');
   const [customEndDate, setCustomEndDate] = useState<string>('');

   const getFunnelColor = (label: string) => {
      switch (label.toLowerCase()) {
         case 'applied': return 'bg-blue-500';
         case 'under review': return 'bg-indigo-500';
         case 'shortlisted': return 'bg-purple-500';
         case 'interviewing': return 'bg-emerald-500';
         case 'offered': 
         case 'offered/hired': return 'bg-green-500';
         default: return 'bg-slate-500';
      }
   };

   useEffect(() => {
      const fetchAnalytics = async () => {
         setLoading(true);
         try {
            let endDate: Date | undefined = new Date();
            let startDate: Date | undefined;
            
            if (dateRange !== 'all') {
               if (dateRange === 'custom') {
                  if (customStartDate) startDate = new Date(customStartDate);
                  if (customEndDate) endDate = new Date(customEndDate);
                  else endDate = undefined;
               } else {
                  startDate = new Date();
                  if (dateRange === '7d') startDate.setDate(startDate.getDate() - 7);
                  if (dateRange === '30d') startDate.setDate(startDate.getDate() - 30);
                  if (dateRange === '90d') startDate.setDate(startDate.getDate() - 90);
               }
            } else {
               endDate = undefined;
            }

            const query = new URLSearchParams();
            if (startDate) query.append('startDate', startDate.toISOString());
            if (endDate) query.append('endDate', endDate.toISOString());

            const res = await apiClient.get(`${API_ROUTES.HR.ANALYTICS}?${query.toString()}`);
            setData(res.data as CompanyAnalytics);
         } catch (error) {
            console.error("Failed to load analytics", error);
         } finally {
            setLoading(false);
         }
      };
      fetchAnalytics();
   }, [dateRange, customStartDate, customEndDate]);

   const handleExportCSV = () => {
      if (!data) return;
      
      const csvRows = [];
      csvRows.push(['Metric', 'Value']);
      csvRows.push(['Total Applications', data.totalApplications]);
      csvRows.push(['Shortlist Rate (%)', data.shortlistRate || 'N/A']);
      csvRows.push(['Average Time to Hire (Days)', data.averageTimeToHireDays || 'N/A']);
      
      csvRows.push([]);
      csvRows.push(['Offer Outcomes']);
      csvRows.push(['Accepted', data.offerOutcomes?.accepted || 0]);
      csvRows.push(['Pending', data.offerOutcomes?.pending || 0]);
      csvRows.push(['Declined', data.offerOutcomes?.declined || 0]);
      
      csvRows.push([]);
      csvRows.push(['Hiring Funnel', 'Count']);
      (data.hiringFunnel || []).forEach(f => {
         csvRows.push([f.label, f.value]);
      });

      const csvString = csvRows.map(e => e.join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   return (
      <div className="min-h-screen bg-slate-50/50">
         <DashboardLayout>
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 flex flex-col gap-8">
               
               {/* Header */}
               <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                     <span>Company</span>
                     <ChevronRight size={14} />
                     <span className="text-slate-900">Analytics & Reports</span>
                  </div>

                  <div className="flex items-center gap-4">
                     <div className="flex bg-white rounded-xl border border-slate-200 p-1">
                        {[
                           { id: '7d', label: '7D' },
                           { id: '30d', label: '30D' },
                           { id: '90d', label: '3M' },
                           { id: 'all', label: 'ALL' },
                           { id: 'custom', label: 'Custom' }
                        ].map((range) => (
                           <button
                              key={range.id}
                              onClick={() => setDateRange(range.id as any)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                 dateRange === range.id 
                                 ? 'bg-indigo-50 text-indigo-600' 
                                 : 'text-slate-500 hover:text-slate-900'
                              }`}
                           >
                              {range.label}
                           </button>
                        ))}
                     </div>
                     {dateRange === 'custom' && (
                        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 px-2">
                           <input 
                              type="date" 
                              value={customStartDate} 
                              onChange={(e) => setCustomStartDate(e.target.value)} 
                              className="text-xs text-slate-600 font-bold outline-none bg-transparent"
                           />
                           <span className="text-slate-300">-</span>
                           <input 
                              type="date" 
                              value={customEndDate} 
                              onChange={(e) => setCustomEndDate(e.target.value)} 
                              className="text-xs text-slate-600 font-bold outline-none bg-transparent"
                           />
                        </div>
                     )}
                     <Button 
                        onClick={handleExportCSV}
                        variant="outline" 
                        className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl px-4 h-10 shadow-sm"
                     >
                        <Download size={16} className="mr-2 text-slate-400" /> Export CSV
                     </Button>
                  </div>
               </header>

               {/* Stats Overview */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                     { 
                        label: 'Total Applications', 
                        value: loading ? '...' : data?.totalApplications?.toString() || '0', 
                        icon: Users,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50',
                        border: 'border-blue-100'
                     },
                     { 
                        label: 'Time to Hire', 
                        value: loading ? '...' : data?.averageTimeToHireDays ? `${data.averageTimeToHireDays}d` : 'N/A', 
                        icon: Clock,
                        color: 'text-amber-600',
                        bg: 'bg-amber-50',
                        border: 'border-amber-100'
                     },
                     { 
                        label: 'Shortlist Rate', 
                        value: loading ? '...' : data?.shortlistRate ? `${data.shortlistRate}%` : '0%', 
                        icon: Target,
                        color: 'text-indigo-600',
                        bg: 'bg-indigo-50',
                        border: 'border-indigo-100'
                     },
                     { 
                        label: 'Avg. Score', 
                        value: loading ? '...' : (data?.averageCandidateScore !== undefined && data?.averageCandidateScore !== null) ? `${data?.averageCandidateScore}%` : '0%', 
                        icon: Award,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50',
                        border: 'border-emerald-100'
                     },
                  ].map((stat, i) => (
                     <div key={i} className={`p-6 rounded-[2rem] bg-white border ${stat.border} shadow-sm relative overflow-hidden`}>
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 shadow-inner`}>
                           <stat.icon size={24} />
                        </div>
                        <div className="space-y-1">
                           <div className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                           <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Hiring Funnel */}
                  <GlassCard className="p-8 rounded-[2rem] border-slate-100 shadow-sm col-span-1 lg:col-span-2 space-y-8">
                     <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hiring Funnel</h3>
                        <BarChart3 size={16} className="text-slate-400" />
                     </div>
                     <div className="space-y-6">
                        {loading ? (
                           <div className="text-xs font-bold text-slate-400 text-center py-10">Loading funnel...</div>
                        ) : (!data?.hiringFunnel || data.hiringFunnel.length === 0) ? (
                           <div className="text-xs font-bold text-slate-400 text-center py-10">No funnel data available</div>
                        ) : (
                           data.hiringFunnel.map((f, i) => {
                              const maxValue = Math.max(...data.hiringFunnel.map(x => x.value), 1);
                              return (
                                 <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                       <span className="text-[10px] font-bold text-slate-500 uppercase">{f.label}</span>
                                       <span className="text-xs font-black text-slate-900">{f.value}</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                       <div 
                                          className={`h-full ${getFunnelColor(f.label)} rounded-full transition-all duration-1000`} 
                                          style={{ width: `${(f.value / maxValue) * 100}%` }} 
                                       />
                                    </div>
                                 </div>
                              );
                           })
                        )}
                     </div>
                  </GlassCard>

                  {/* Offer Outcomes */}
                  <div className="space-y-6">
                     <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.2),transparent_70%)] pointer-events-none" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 relative z-10">Offer Outcomes</h3>
                        
                        <div className="flex flex-col gap-6 relative z-10">
                           <div className="flex justify-between items-center pb-4 border-b border-white/10">
                              <span className="text-sm font-bold text-slate-300">Accepted</span>
                              <span className="text-xl font-black text-emerald-400">{loading ? '...' : data?.offerOutcomes?.accepted || 0}</span>
                           </div>
                           <div className="flex justify-between items-center pb-4 border-b border-white/10">
                              <span className="text-sm font-bold text-slate-300">Pending</span>
                              <span className="text-xl font-black text-amber-400">{loading ? '...' : data?.offerOutcomes?.pending || 0}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-slate-300">Declined</span>
                              <span className="text-xl font-black text-rose-400">{loading ? '...' : data?.offerOutcomes?.declined || 0}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Colleges */}
                  <GlassCard className="p-8 rounded-[2rem] border-slate-100 shadow-sm space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Colleges by Applications</h3>
                        <Building2 size={16} className="text-slate-400" />
                     </div>
                     <div className="space-y-4">
                        {loading ? (
                           <div className="text-xs font-bold text-slate-400 text-center py-6">Loading colleges...</div>
                        ) : (!data?.topColleges || data.topColleges.length === 0) ? (
                           <div className="text-xs font-bold text-slate-400 text-center py-6">No college data available</div>
                        ) : (
                           data.topColleges.map((c, i) => (
                              <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                                 <span className="text-sm font-bold text-slate-700 truncate max-w-[70%]">{c.collegeName}</span>
                                 <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{c.applicationCount}</span>
                              </div>
                           ))
                        )}
                     </div>
                  </GlassCard>

                  {/* Skill Demand */}
                  <GlassCard className="p-8 rounded-[2rem] border-slate-100 shadow-sm space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Most Demanded Skills</h3>
                        <TrendingUp size={16} className="text-slate-400" />
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {loading ? (
                           <div className="text-xs font-bold text-slate-400 w-full text-center py-6">Loading skills...</div>
                        ) : (!data?.skillDemand || data.skillDemand.length === 0) ? (
                           <div className="text-xs font-bold text-slate-400 w-full text-center py-6">No skill data available</div>
                        ) : (
                           data.skillDemand.map((s, i) => (
                              <div key={i} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-2">
                                 <span className="text-sm font-bold">{s.skill}</span>
                                 <span className="text-[10px] font-black opacity-60 bg-emerald-200/50 px-2 py-0.5 rounded-md">{s.demand} jobs</span>
                              </div>
                           ))
                        )}
                     </div>
                  </GlassCard>
               </div>

            </div>
         </DashboardLayout>
      </div>
   );
}
