'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getCollegeAnalytics, exportCollegeAnalytics } from '@/services/college/placement.service';
import { CollegeReportsAnalytics } from '@/types/dashboard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Users, UserCheck, Briefcase, FileCheck, Target, 
  GraduationCap, Building, TrendingUp, PieChart as PieChartIcon, Calendar as CalendarIcon, Filter,
  Download, ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6'];

export default function CollegeReportsPage() {
  const [data, setData] = useState<CollegeReportsAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering state
  const [filterType, setFilterType] = useState<string>('all'); // all, month, year, custom
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Exporting state
  const [isExporting, setIsExporting] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  const handleExport = async (format: string) => {
    setIsExporting(true);
    setIsExportDropdownOpen(false);
    try {
      const params: { startDate?: string, endDate?: string } = {};
      const now = new Date();
      if (filterType === 'month') {
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        params.startDate = lastMonth.toISOString();
      } else if (filterType === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        params.startDate = startOfYear.toISOString();
      } else if (filterType === 'custom') {
        if (customStartDate) params.startDate = new Date(customStartDate).toISOString();
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          params.endDate = end.toISOString();
        }
      }

      const blob = await exportCollegeAnalytics(format, params);
      
      let extension = 'pdf';
      if (format === 'excel') extension = 'xlsx';
      else if (format === 'csv') extension = 'csv';
      
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `CareerHub_Placement_Report_${dateStr}.${extension}`;

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const params: { startDate?: string, endDate?: string } = {};
        
        const now = new Date();
        if (filterType === 'month') {
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          params.startDate = lastMonth.toISOString();
        } else if (filterType === 'year') {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          params.startDate = startOfYear.toISOString();
        } else if (filterType === 'custom') {
          if (customStartDate) params.startDate = new Date(customStartDate).toISOString();
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            params.endDate = end.toISOString();
          }
        }

        const res = await getCollegeAnalytics(params);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to fetch analytics');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch if not custom, or if custom and we explicitly apply (handled separately or simple debounce)
    fetchAnalytics();
  }, [filterType, customStartDate, customEndDate]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-rose-500 mb-4"><Target size={48} /></div>
          <h2 className="text-2xl font-black text-slate-800">No Analytics Available</h2>
          <p className="text-slate-500 mt-2">{error || 'Could not load data.'}</p>
        </div>
      </DashboardLayout>
    );
  }

  const { overview, placementTrend, funnel, interviews, offers, departmentAnalytics, studentPlacementStatus } = data;

  const funnelData = [
    { name: 'Eligible', value: funnel.eligible || 0, fill: '#6366F1' },
    { name: 'Applied', value: funnel.applied || 0, fill: '#3B82F6' },
    { name: 'Interviewed', value: funnel.interviewed || 0, fill: '#F59E0B' },
    { name: 'Offered', value: funnel.offered || 0, fill: '#10B981' },
    { name: 'Accepted', value: funnel.accepted || 0, fill: '#059669' },
  ];

  const interviewPieData = [
    { name: 'Completed', value: interviews.completed, color: '#10B981' },
    { name: 'Upcoming', value: interviews.upcoming, color: '#3B82F6' },
    { name: 'Cancelled', value: interviews.cancelled || 0, color: '#EF4444' },
  ];

  const offerPieData = [
    { name: 'Accepted', value: offers.accepted, color: '#10B981' },
    { name: 'Pending', value: offers.pending || 0, color: '#F59E0B' },
    { name: 'Declined', value: offers.declined || 0, color: '#EF4444' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8 pb-12">
        {/* Header & Filters */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <PieChartIcon className="text-emerald-500" size={32} />
              Reports & Analytics
            </h1>
            <p className="text-slate-500 font-medium">Comprehensive placement metrics and student performance insights.</p>
          </div>
          
          {/* Filters & Export */}
          <div className="flex items-center gap-3 relative z-20">
            <div className="flex flex-col gap-2 relative">
              <div className="flex items-center gap-2">
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">All Time</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Date</option>
                </select>
              </div>
              
              {filterType === 'custom' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 right-0 bg-white p-4 rounded-xl border border-slate-200 shadow-xl flex flex-col gap-3 min-w-[280px]"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                    <input 
                      type="date" 
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                    <input 
                      type="date" 
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Export Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                disabled={isExporting}
                className="flex items-center gap-2 bg-emerald-500 text-white text-sm rounded-xl px-4 py-2.5 font-bold shadow-sm hover:bg-emerald-600 focus:outline-none disabled:opacity-55 disabled:cursor-not-allowed transition-colors"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download Report
                    <ChevronDown size={16} />
                  </>
                )}
              </button>

              {isExportDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-xl border border-slate-200 shadow-xl min-w-[160px] py-1">
                  <button 
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    PDF Report
                  </button>
                  <button 
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Excel Report
                  </button>
                  <button 
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    CSV Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Overview KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard title="Total Students" value={overview.totalStudents} icon={Users} color="text-blue-500" bg="bg-blue-50" />
          <KPICard title="Eligible" value={overview.eligibleStudents || 0} icon={UserCheck} color="text-indigo-500" bg="bg-indigo-50" />
          <KPICard title="Placed" value={overview.placedStudents || 0} icon={GraduationCap} color="text-emerald-500" bg="bg-emerald-50" />
          <KPICard title="Placement Rate" value={`${(overview.placementRate || 0).toFixed(1)}%`} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-100" />
          <KPICard title="Offers Received" value={overview.offersReceived || 0} icon={Briefcase} color="text-amber-500" bg="bg-amber-50" />
          <KPICard title="Offers Accepted" value={overview.offersAccepted || 0} icon={FileCheck} color="text-teal-500" bg="bg-teal-50" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {/* Placement Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Placement Trend</h3>
              <p className="text-xs font-medium text-slate-500">Accepted offers over time</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={placementTrend}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Placement Funnel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Placement Funnel</h3>
              <p className="text-xs font-medium text-slate-500">From eligibility to acceptance</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Analytics Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
          
          {/* Interview Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-black text-slate-900 w-full text-left mb-6">Interview Analytics</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={interviewPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {interviewPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-4 p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completion Rate</span>
              <span className="text-lg font-black text-emerald-600">{(interviews.completionRate || 0).toFixed(1)}%</span>
            </div>
          </motion.div>

          {/* Offer Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-black text-slate-900 w-full text-left mb-6">Offer Analytics</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={offerPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {offerPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-4 p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Acceptance Rate</span>
              <span className="text-lg font-black text-emerald-600">{(offers.acceptanceRate || 0).toFixed(1)}%</span>
            </div>
          </motion.div>

          {/* Department Analytics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-black text-slate-900 mb-6">Department Stats</h3>
            <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
              <div className="space-y-4">
                {departmentAnalytics && departmentAnalytics.length > 0 ? departmentAnalytics.map((dept, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-700">{dept.department}</span>
                      <span className="text-emerald-600">{dept.placementRate.toFixed(1)}% Placed</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dept.placementRate}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase">
                      <span>{dept.students} Students</span>
                      <span>{dept.placed} Placed</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-slate-400 text-sm py-8 font-medium">No department data available.</div>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </DashboardLayout>
  );
}

function KPICard({ title, value, icon: Icon, color, bg }: { title: string, value: string | number, icon: any, color: string, bg: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center`}>
        <Icon size={20} />
      </div>
      <div>
        <span className="text-2xl font-black text-slate-900 block leading-tight">{value}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
    </motion.div>
  );
}
