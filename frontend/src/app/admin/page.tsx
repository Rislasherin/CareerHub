'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/shared/Button';
import {
   Building2,
   GraduationCap,
   Briefcase,
   ChevronRight,
   CheckCircle,
   MoreVertical,
   Activity,
   CreditCard,
   LayoutDashboard,
   Users,
   TrendingUp,
   Cpu,
   ShieldCheck,
   Plus,
   RefreshCcw,
   Zap,
   ArrowUpRight,
   ShieldAlert,
   Clock,
   Circle,
   BarChart3,
   Star,
   Download,
   Search,
   ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminService } from '@/services/super-admin/super-admin.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

export default function SuperAdminDashboard() {
   const [stats, setStats] = useState<any>(null);
   const [isLoading, setIsLoading] = useState(true);

   // Colleges Table State
   const [colleges, setColleges] = useState<any[]>([]);
   const [collegePage, setCollegePage] = useState(1);
   const [collegeTotal, setCollegeTotal] = useState(0);
   const [collegeSearch, setCollegeSearch] = useState('');
   const [collegeStatus, setCollegeStatus] = useState('');
   const [isCollegesLoading, setIsCollegesLoading] = useState(false);

   const fetchStats = async () => {
      try {
         const res = await superAdminService.getStats();
         setStats(res);
      } catch (err) { }
   };

   const fetchColleges = async () => {
      setIsCollegesLoading(true);
      try {
         const res = await superAdminService.getOrganizations(collegeSearch, collegePage, 5, collegeStatus);
         setColleges(res.organizations || []);
         setCollegeTotal(res.total || 0);
      } catch (err) {}
      setIsCollegesLoading(false);
   };

   useEffect(() => {
      const init = async () => {
         setIsLoading(true);
         await Promise.all([fetchStats(), fetchColleges()]);
         setIsLoading(false);
      };
      init();
   }, []);

   useEffect(() => {
      fetchColleges();
   }, [collegePage, collegeSearch, collegeStatus]);

   const handleExportCSV = async () => {
      try {
         const res = await superAdminService.getOrganizations('', 1, 1000, '');
         const allColleges = res.organizations || [];
         
         if (allColleges.length === 0) {
            toast.info("No records to export");
            return;
         }

         const headers = ['Institution Name', 'City', 'State', 'Placement Contact Email', 'Placement Contact Phone', 'Registered Students', 'Status'];
         const rows = allColleges.map((col: any) => [
            `"${col.name?.replace(/"/g, '""') || ''}"`,
            `"${col.city || ''}"`,
            `"${col.state || ''}"`,
            `"${col.placementContactEmail || col.email || ''}"`,
            `"${col.placementContactPhone || ''}"`,
            col.countOfStudents || 0,
            `"${col.status || 'ACTIVE'}"`
         ]);

         const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
         const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
         const url = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.setAttribute('href', url);
         link.setAttribute('download', `careerhub_colleges_${new Date().toISOString().split('T')[0]}.csv`);
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         toast.success("Colleges list exported successfully");
      } catch (err) {
         toast.error("Failed to export colleges list");
      }
   };

   const monthlyRevenue = stats?.monthlyRevenue || [];
   const totalMonthlyRevenue = monthlyRevenue.reduce((sum: number, item: any) => sum + item.revenue, 0);

   const metrics = [
      { label: 'TOTAL COLLEGES', value: stats?.organizations ?? '0', trend: '', icon: Building2, color: 'text-cyan-400' },
      { label: 'ACTIVE STUDENTS', value: stats?.students?.toLocaleString() ?? '0', trend: '', icon: GraduationCap, color: 'text-emerald-400' },
      { label: 'MRR', value: stats?.mrr ? `₹${stats.mrr.toLocaleString('en-IN')}` : 'N/A', trend: '', icon: CreditCard, color: 'text-indigo-400' },
      { label: 'AI CALLS / DAY', value: stats?.aiCallsPerDay ?? 'N/A', trend: '', icon: Zap, color: 'text-amber-400' },
      { label: 'RENEWALS DUE', value: stats?.renewalsDue ?? '0', trend: 'Next 30 days', icon: Clock, color: 'text-rose-400' },
   ];

   return (
      <DashboardLayout>
         <div className="max-w-[1600px] mx-auto p-4 lg:p-8 flex flex-col gap-8">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                  <div className="flex items-center gap-3 mb-1">
                     <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        All Systems Operational
                     </div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">CareerHub Platform — Super Admin Control Center</p>
               </div>
               <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-all">
                     <ShieldAlert size={14} className="text-amber-500" />
                     {stats?.renewalsDue ?? 0} Renewals Due
                  </button>
               </div>
            </header>

            {/* Welcome Banner */}
            <section className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
               <div className="relative p-10 lg:p-14 rounded-[2.5rem] bg-[#121520] border border-white/5 overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                  <div className="space-y-6">
                     <div className="inline-flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        PLATFORM OVERVIEW
                     </div>
                     <h2 className="text-5xl font-black text-white tracking-tight leading-tight">
                        Good morning, {useAppSelector((state: RootState) => state.superAdmin.details?.firstName) || 'Admin'} 👋
                     </h2>
                     <p className="text-slate-400 font-medium text-lg max-w-2xl">
                        Placement Season {new Date().getFullYear()}-{new Date().getFullYear() + 1} is active. You are currently overseeing <span className="text-white font-bold">{stats?.organizations || 0} colleges</span>, <span className="text-white font-bold">{stats?.companies || 0} companies</span>, and <span className="text-white font-bold">{stats?.students?.toLocaleString() || 0} students</span>.
                     </p>
                     <div className="flex flex-wrap gap-4 pt-4">
                        <Button
                           onClick={() => window.location.href = '/admin/colleges'}
                           className="bg-cyan-500 text-[#0B0D17] hover:bg-cyan-400 px-8 py-4 h-auto rounded-2xl font-black shadow-xl shadow-cyan-500/10 border-none"
                        >
                           Manage Colleges
                        </Button>
                     </div>
                  </div>
                  <div className="hidden lg:block relative">
                     {/* Decorative Elements */}
                     <div className="w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/10 to-transparent border border-white/5 flex items-center justify-center relative">
                        <LayoutDashboard size={120} className="text-cyan-500/20" />
                        <div className="absolute top-0 right-0 p-4 bg-[#121520] border border-white/10 rounded-2xl shadow-2xl">
                           <TrendingUp size={32} className="text-emerald-400" />
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
               {metrics.map((metric, i) => (
                  <motion.div
                     key={metric.label}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="p-6 rounded-3xl bg-[#121520] border border-white/5 flex flex-col gap-4 group hover:border-cyan-500/30 transition-all cursor-default"
                  >
                     <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${metric.color} group-hover:scale-110 transition-transform`}>
                           <metric.icon size={20} />
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{metric.label}</div>
                     </div>
                     <div>
                        <div className="text-3xl font-black text-white mb-1">{metric.value}</div>
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] font-black ${metric.trend.includes('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {metric.trend.includes('+') ? '↑' : ''} {metric.trend}
                           </span>
                           {i === 0 && <span className="text-[9px] font-bold text-slate-600">this month</span>}
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Monthly Revenue Chart */}
               <div className="lg:col-span-2 p-8 lg:p-10 rounded-[2.5rem] bg-[#121520] border border-white/5 flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">MONTHLY REVENUE</h3>
                        <div className="text-4xl font-black text-white">
                           {totalMonthlyRevenue > 0 ? `₹${totalMonthlyRevenue.toLocaleString('en-IN')}` : 'N/A'}
                        </div>
                     </div>
                  </div>

                  {totalMonthlyRevenue > 0 ? (
                     <div className="flex-1 w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={monthlyRevenue}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#262930" />
                              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                              <Tooltip 
                                 formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                                 contentStyle={{ backgroundColor: '#121520', borderColor: '#262930', color: '#fff' }}
                              />
                              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center h-64 gap-4 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                        <BarChart3 size={40} className="text-slate-700 mb-2" />
                        <p className="text-sm font-bold text-slate-500">Revenue tracking unavailable</p>
                        <p className="text-[10px] font-medium text-slate-600 max-w-xs">Connect a payment gateway to begin tracking MRR and Monthly Revenue.</p>
                     </div>
                  )}
               </div>

               {/* Recent Activity */}
               <div className="p-8 lg:p-10 rounded-[2.5rem] bg-[#121520] border border-white/5 flex flex-col min-h-[350px]">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">RECENT ACTIVITY</h3>
                  </div>
                  {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                     <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                        {stats.recentActivities.map((act: any) => {
                           const date = new Date(act.timestamp);
                           const timeStr = date.toLocaleDateString('default', { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                           return (
                              <div key={act.id} className="flex gap-4 bg-white/[0.01] p-3 rounded-2xl border border-white/5 hover:bg-white/[0.03] transition-colors">
                                 <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                       <span className="text-xs font-bold text-white">{act.title}</span>
                                       <span className="text-[9px] text-slate-500">{timeStr}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">{act.description}</p>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center min-h-[250px] gap-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600 mb-2">
                           <Activity size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-500">No recent activity</p>
                        <p className="text-[10px] font-medium text-slate-600 max-w-[200px]">System events will appear here once tracked.</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Renewals */}
               <div className="p-8 lg:p-10 rounded-[2.5rem] bg-[#121520] border border-white/5 flex flex-col min-h-[300px]">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">RENEWALS DUE SOON</h3>
                  {stats?.renewalsDueSoon && stats.renewalsDueSoon.length > 0 ? (
                     <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                        {stats.renewalsDueSoon.map((renewal: any) => (
                           <div key={renewal.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors">
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-xs font-bold text-white">{renewal.collegeName}</span>
                                 <span className="text-[9px] font-bold text-slate-500 uppercase">{renewal.planType} Plan</span>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                 renewal.daysLeft <= 7 
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                 {renewal.daysLeft} days left
                              </span>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600 mb-2">
                           <Clock size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-500">No pending renewals</p>
                        <p className="text-[10px] font-medium text-slate-600">All college subscriptions are fully active and paid.</p>
                     </div>
                  )}
               </div>

               {/* Plan Distribution */}
               <div className="p-8 lg:p-10 rounded-[2.5rem] bg-[#121520] border border-white/5">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">PLAN DISTRIBUTION</h3>
                  <div className="space-y-10">
                     {stats?.planDistribution ? stats.planDistribution.map((plan: any, idx: number) => {
                        const total = stats.planDistribution.reduce((acc: number, p: any) => acc + p.count, 0);
                        const percentage = total > 0 ? (plan.count / total) * 100 : 0;
                        const colors = ['bg-cyan-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500'];
                        const textColors = ['text-cyan-400', 'text-amber-400', 'text-emerald-400', 'text-indigo-400'];
                        return (
                           <div key={idx} className="space-y-3">
                              <div className="flex justify-between items-end">
                                 <span className="text-sm font-bold text-white uppercase">{plan.planType} Plan</span>
                                 <span className={`text-[10px] font-black ${textColors[idx % 4]}`}>{plan.count} colleges</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                 <div className={`h-full ${colors[idx % 4]} rounded-full`} style={{ width: `${percentage}%` }} />
                              </div>
                           </div>
                        );
                     }) : <div className="text-sm font-bold text-slate-500">N/A</div>}
                  </div>
               </div>

               {/* Quick Actions */}
               <div className="p-8 lg:p-10 rounded-[2.5rem] bg-[#121520] border border-white/5">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">QUICK ACTIONS</h3>
                  <div className="grid grid-cols-1 gap-3">
                     <Button fullWidth className="bg-cyan-500 text-[#0B0D17] hover:bg-cyan-400 rounded-xl h-12 font-black text-xs uppercase tracking-widest border-none">
                        <Plus size={16} className="mr-2" /> Add College
                     </Button>
                     {[
                        { label: 'Manage AI Tokens', icon: Cpu },
                        { label: 'View Subscriptions', icon: Star },
                        { label: 'Broadcast to Colleges', icon: ShieldCheck },
                        { label: 'Platform Analytics', icon: BarChart3 },
                     ].map((item, i) => (
                        <button key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs font-bold border border-transparent hover:border-white/5">
                           <item.icon size={16} className="text-cyan-500/50" />
                           {item.label}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* Registered Colleges List Section with Search, Filtering & CSV Export */}
            <div className="p-8 lg:p-10 rounded-[2.5rem] bg-[#121520] border border-white/5 space-y-6">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">REGISTERED INSTITUTIONS OVERVIEW</h3>
                     <p className="text-slate-400 text-xs">Search, filter, and export the colleges list</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-all hover:bg-slate-800"
                     >
                        <Download size={14} className="text-cyan-400" />
                        Export CSV
                     </button>
                  </div>
               </div>

               {/* Table Filters */}
               <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1 group">
                     <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                     </div>
                     <input
                        type="text"
                        placeholder="Search colleges by name or city..."
                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs font-medium text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                        value={collegeSearch}
                        onChange={(e) => {
                           setCollegeSearch(e.target.value);
                           setCollegePage(1);
                        }}
                     />
                  </div>
                  <select
                     value={collegeStatus}
                     onChange={(e) => {
                        setCollegeStatus(e.target.value);
                        setCollegePage(1);
                     }}
                     className="px-6 py-3 rounded-2xl bg-[#0a0a0a] border border-white/5 text-xs font-bold text-slate-400 hover:text-white transition-all appearance-none outline-none focus:border-cyan-500/50 cursor-pointer min-w-[150px]"
                  >
                     <option value="">All Statuses</option>
                     <option value="ACTIVE">Active</option>
                     <option value="PENDING">Pending Approval</option>
                     <option value="BLOCKED">Blocked</option>
                  </select>
               </div>

               {/* Table Content */}
               <div className="border border-white/5 rounded-3xl overflow-hidden bg-[#0e101a]">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b border-white/5">
                              <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Institution</th>
                              <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Contact Email</th>
                              <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Students</th>
                              <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {isCollegesLoading ? (
                              <tr>
                                 <td colSpan={4} className="px-8 py-10 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                       <RefreshCcw className="animate-spin text-cyan-400" size={16} />
                                       <span className="text-xs font-bold text-slate-500">Loading records...</span>
                                    </div>
                                 </td>
                              </tr>
                           ) : colleges.length === 0 ? (
                              <tr>
                                 <td colSpan={4} className="px-8 py-10 text-center text-xs font-bold text-slate-500">
                                    No colleges matching filters
                                 </td>
                              </tr>
                           ) : (
                              colleges.map((college) => (
                                 <tr key={college.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="px-8 py-4">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-white/5">
                                             <Building2 size={14} className="text-slate-400 group-hover:text-cyan-400" />
                                          </div>
                                          <div className="flex flex-col">
                                             <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{college.name}</span>
                                             <span className="text-[10px] text-slate-500">{college.city || 'N/A'}</span>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-8 py-4 text-xs font-medium text-slate-300">
                                       {college.placementContactEmail || college.email || 'No email'}
                                    </td>
                                    <td className="px-8 py-4 text-xs font-bold text-slate-300">
                                       {college.countOfStudents || 0}
                                    </td>
                                    <td className="px-8 py-4">
                                       <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                          college.status?.toUpperCase() === 'BLOCKED'
                                             ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                             : college.status?.toUpperCase() === 'PENDING'
                                             ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                             : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                          }`}>
                                          {college.status || 'ACTIVE'}
                                       </span>
                                    </td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </div>

                  {/* Table Pagination */}
                  {collegeTotal > 5 && (
                     <div className="px-8 py-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-slate-500">
                           Page <span className="text-white">{collegePage}</span> of <span className="text-white">{Math.ceil(collegeTotal / 5)}</span>
                        </span>
                        <div className="flex items-center gap-2">
                           <button
                              onClick={() => setCollegePage(p => Math.max(1, p - 1))}
                              disabled={collegePage === 1}
                              className="p-1 rounded bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                           >
                              <ChevronLeft size={16} />
                           </button>
                           <button
                              onClick={() => setCollegePage(p => p + 1)}
                              disabled={collegePage >= Math.ceil(collegeTotal / 5)}
                              className="p-1 rounded bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                           >
                              <ChevronRight size={16} />
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </div>

         </div>
      </DashboardLayout>
   );
}
