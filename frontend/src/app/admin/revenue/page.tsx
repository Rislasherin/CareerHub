'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Table, Column } from '@/components/shared/Table';
import {
  Download,
  AlertTriangle,
  Search
} from 'lucide-react';
import { superAdminService } from '@/services/super-admin/super-admin.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function SuperAdminRevenuePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRevenueData = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getRevenueAnalytics(page, 5, search, statusFilter, planFilter);
      setData(res);
    } catch (err) {
      toast.error('Failed to fetch revenue analytics');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRevenueData();
  }, [page, search, statusFilter, planFilter]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handlePlanFilterChange = (val: string) => {
    setPlanFilter(val);
    setPage(1);
  };

  const formatCurrency = (val: any) => {
    if (val === 'N/A' || val === undefined || val === null) return 'N/A';
    if (typeof val === 'number') {
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return val;
  };

  const handleExportCSV = async () => {
    try {
      const res = await superAdminService.getRevenueAnalytics(1, 1000, search, statusFilter, planFilter);
      const transactions = res.transactions || [];
      if (transactions.length === 0) {
        toast.error('No transaction records to export');
        return;
      }

      const csvRows = [];
      csvRows.push(['Invoice Number', 'College', 'Plan', 'Amount', 'Date', 'Payment Method', 'Status']);

      for (const tx of transactions) {
        const amountStr = tx.amount === null ? 'N/A' : `₹${tx.amount}`;
        const dateFormatted = new Date(tx.date).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric'
        });
        csvRows.push([
          tx.invoiceNumber,
          tx.collegeName,
          tx.plan,
          amountStr,
          dateFormatted,
          tx.paymentMethod || 'N/A',
          tx.status
        ]);
      }

      const csvString = csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `revenue_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV exported successfully');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const columns: Column<any>[] = useMemo(() => [
    {
      header: 'INVOICE / TXN ID',
      render: (tx) => (
        <span className="text-xs font-mono font-bold text-slate-400">{tx.invoiceNumber}</span>
      )
    },
    {
      header: 'COLLEGE',
      render: (tx) => (
        <span className="text-sm font-bold text-white">{tx.collegeName}</span>
      )
    },
    {
      header: 'PLAN',
      render: (tx) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
          tx.plan === 'PRO' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
        }`}>
          {tx.plan}
        </span>
      )
    },
    {
      header: 'AMOUNT',
      render: (tx) => (
        <span className="text-sm font-black text-emerald-400">
          {formatCurrency(tx.amount)}
        </span>
      )
    },
    {
      header: 'DATE',
      render: (tx) => (
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )
    },
    {
      header: 'PAYMENT METHOD',
      render: (tx) => (
        <span className="text-xs text-slate-400">{tx.paymentMethod || 'N/A'}</span>
      )
    },
    {
      header: 'STATUS',
      render: (tx) => {
        let styles = 'bg-slate-500/10 text-slate-400';
        if (tx.status === 'PAID') styles = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        if (tx.status === 'PENDING') styles = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
        if (tx.status === 'OVERDUE') styles = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
        
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${styles}`}>
            {tx.status}
          </span>
        );
      }
    }
  ], []);

  const summary = data?.summary;
  const transactions = data?.transactions || [];
  const totalInvoices = data?.total || 0;
  const monthlyRevenue = data?.monthlyRevenue || [];
  const planRevenue = data?.planRevenue || [];
  const topColleges = data?.topColleges || [];

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 flex flex-col gap-8 text-white">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">Revenue</h1>
            <p className="text-slate-500 text-sm font-medium">Financial performance & revenue overview</p>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <GlassCard className="p-6 border-cyan-500/20 rounded-[2rem] bg-[#0E101A] flex flex-col justify-center min-h-[140px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Revenue (YTD)</span>
            <div className="text-4xl font-black text-white tracking-tight">
              {formatCurrency(summary?.totalRevenue)}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
              N/A growth
            </span>
          </GlassCard>

          <GlassCard className="p-6 border-emerald-500/20 rounded-[2rem] bg-[#0E101A] flex flex-col justify-center min-h-[140px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">MRR</span>
            <div className="text-4xl font-black text-white tracking-tight">
              {formatCurrency(summary?.mrr)}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
              N/A growth
            </span>
          </GlassCard>

          <GlassCard className="p-6 border-amber-500/20 rounded-[2rem] bg-[#0E101A] flex flex-col justify-center min-h-[140px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">ARR (PROJECTED)</span>
            <div className="text-4xl font-black text-white tracking-tight">
              {formatCurrency(summary?.arr)}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
              N/A status
            </span>
          </GlassCard>

          <GlassCard className="p-6 border-purple-500/20 rounded-[2rem] bg-[#0E101A] flex flex-col justify-center min-h-[140px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Avg Revenue / College</span>
            <div className="text-4xl font-black text-white tracking-tight">
              {formatCurrency(summary?.averageRevenuePerCollege)}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
              N/A growth
            </span>
          </GlassCard>

        </div>

        {/* Charts & Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Monthly Revenue Chart */}
          <GlassCard className="lg:col-span-2 p-6 border-white/5 rounded-[2rem] bg-[#0E101A] flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Monthly Revenue Breakdown</h3>
            </div>
            {monthlyRevenue && monthlyRevenue.some((item: any) => item.revenue > 0) ? (
              <div className="flex-1 w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262930" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#0e101a', borderColor: '#262930', color: '#fff' }}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <span className="text-sm font-medium text-slate-500">No revenue data available</span>
              </div>
            )}
          </GlassCard>

          {/* Revenue By Plan & Top Colleges */}
          <div className="flex flex-col gap-6">
            
            <GlassCard className="p-6 border-white/5 rounded-[2rem] bg-[#0E101A] flex flex-col min-h-[180px]">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Revenue By Plan</h3>
              {planRevenue && planRevenue.some((item: any) => item.amount > 0) ? (
                <div className="space-y-4">
                  {planRevenue.map((plan: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-white/[0.02] p-3 border border-white/5 rounded-xl">
                      <div>
                        <span className="text-sm font-bold text-white">{plan.planType === 'PRO' ? 'Pro Plans' : 'Basic Plans'}</span>
                        <span className="text-[10px] text-slate-500 ml-2">({plan.collegeCount} colleges)</span>
                      </div>
                      <span className="text-sm font-black text-blue-400">{formatCurrency(plan.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                  <span className="text-sm font-medium text-slate-500">Revenue by plan unavailable</span>
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-6 border-white/5 rounded-[2rem] bg-[#0E101A] flex flex-col min-h-[180px]">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Top Revenue Colleges</h3>
              {topColleges && topColleges.length > 0 ? (
                <div className="space-y-3">
                  {topColleges.map((col: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-white/[0.02] p-3 border border-white/5 rounded-xl">
                      <span className="text-sm font-bold text-white">{idx + 1}. {col.collegeName}</span>
                      <span className="text-sm font-black text-emerald-400">{formatCurrency(col.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                  <span className="text-sm font-medium text-slate-500">No revenue data available</span>
                </div>
              )}
            </GlassCard>

          </div>

        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by college name..."
              className="w-full bg-[#121520] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <select
            value={planFilter}
            onChange={(e) => handlePlanFilterChange(e.target.value)}
            className="bg-[#121520] border border-white/5 rounded-2xl px-6 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-cyan-500/50 min-w-[160px]"
          >
            <option value="">All Plans</option>
            <option value="PRO">PRO</option>
            <option value="BASIC">BASIC</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="bg-[#121520] border border-white/5 rounded-2xl px-6 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-cyan-500/50 min-w-[160px]"
          >
            <option value="">All Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="OVERDUE">OVERDUE</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Invoices Table Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Transaction History</h2>
            <div className="flex gap-3">
              <Button 
                onClick={handleExportCSV}
                variant="outline" 
                className="h-9 text-xs rounded-xl font-bold bg-white/5 border-white/5 text-slate-300"
              >
                <Download size={14} className="mr-2" /> Export CSV
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            data={transactions}
            isLoading={isLoading}
            loadingMessage="Loading Transactions..."
            emptyMessage="No transactions found."
            page={page}
            total={totalInvoices}
            pageSize={5}
            onPageChange={setPage}
          />
        </div>
        
      </div>
    </DashboardLayout>
  );
}
