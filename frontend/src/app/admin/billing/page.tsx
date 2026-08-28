'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Table, Column } from '@/components/shared/Table';
import {
  Download,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Search
} from 'lucide-react';
import { superAdminService } from '@/services/super-admin/super-admin.service';
import { toast } from 'sonner';

export default function BillingAndInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sendingEmailIds, setSendingEmailIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const handleSendReminder = async (subscriptionId: string) => {
    setSendingEmailIds(prev => [...prev, subscriptionId]);
    try {
      await superAdminService.sendRenewalReminder(subscriptionId);
      toast.success('Renewal reminder sent successfully');
    } catch (err) {
      toast.error('Unable to send renewal reminder. Please try again.');
    } finally {
      setSendingEmailIds(prev => prev.filter(id => id !== subscriptionId));
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await superAdminService.getBillingInvoices(1, 1000, search, statusFilter, planFilter);
      const allInvoices = res.invoices || [];
      
      if (allInvoices.length === 0) {
        toast.error('No invoices to export');
        return;
      }

      const csvRows = [];
      csvRows.push(['Invoice Number', 'College', 'Plan', 'Amount', 'Issue Date', 'Due Date', 'Status']);

      for (const inv of allInvoices) {
        const amountStr = inv.amount === 'N/A' || inv.amount === undefined || inv.amount === null 
          ? 'N/A' 
          : typeof inv.amount === 'number'
            ? `₹${inv.amount}`
            : inv.amount;

        const issueDateFormatted = new Date(inv.issueDate).toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        });
        const dueDateFormatted = inv.dueDate !== 'N/A' && inv.dueDate 
          ? new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'N/A';

        csvRows.push([
          inv.invoiceNumber || 'N/A',
          inv.collegeName || 'Unknown College',
          inv.plan || 'N/A',
          amountStr,
          issueDateFormatted,
          dueDateFormatted,
          inv.status || 'N/A'
        ]);
      }

      const csvString = csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV exported successfully');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const fetchBillingData = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getBillingInvoices(page, 5, search, statusFilter, planFilter);
      setInvoices(res.invoices || []);
      setStats(res.stats || {});
      setTotal(res.total || 0);
    } catch (err) {
      toast.error('Failed to fetch billing data');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBillingData();
  }, [page, search, statusFilter, planFilter]);

  const columns: Column<any>[] = useMemo(() => [
    {
      header: 'INVOICE #',
      render: (invoice) => (
        <span className="text-xs font-mono font-bold text-slate-400">{invoice.invoiceNumber}</span>
      )
    },
    {
      header: 'COLLEGE',
      render: (invoice) => (
        <span className="text-sm font-bold text-white">{invoice.collegeName}</span>
      )
    },
    {
      header: 'PLAN',
      render: (invoice) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
          invoice.plan === 'PRO' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
        }`}>
          {invoice.plan}
        </span>
      )
    },
    {
      header: 'AMOUNT',
      render: (invoice) => (
        <span className="text-sm font-black text-emerald-400">
          {invoice.amount === 'N/A' || invoice.amount === undefined || invoice.amount === null 
            ? 'N/A' 
            : typeof invoice.amount === 'number' 
              ? `₹${invoice.amount.toLocaleString('en-IN')}` 
              : invoice.amount}
        </span>
      )
    },
    {
      header: 'ISSUE DATE',
      render: (invoice) => (
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {new Date(invoice.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )
    },
    {
      header: 'DUE DATE',
      render: (invoice) => (
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )
    },
    {
      header: 'STATUS',
      render: (invoice) => {
        let styles = 'bg-slate-500/10 text-slate-400';
        if (invoice.status === 'PAID') styles = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        if (invoice.status === 'PENDING') styles = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
        if (invoice.status === 'OVERDUE') styles = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
        
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${styles}`}>
            {invoice.status}
          </span>
        );
      }
    },
    {
      header: ' ',
      className: 'text-right',
      render: (invoice) => {
        const isSending = sendingEmailIds.includes(invoice.id);
        return (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleSendReminder(invoice.id)}
              disabled={isSending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail size={12} /> {isSending ? 'Sending...' : 'Email'}
            </button>
          </div>
        );
      }
    }
  ], [sendingEmailIds]);

  const formatCurrency = (val: any) => {
    if (val === 'N/A' || val === undefined || val === null) return 'N/A';
    const num = Number(val);
    if (isNaN(num)) return 'N/A';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 flex flex-col gap-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">Billing & Invoices</h1>
            <p className="text-slate-500 text-sm font-medium">All college invoices and payment records</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">All Systems Operational</span>
            </div>
            {stats?.overdueCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle size={12} className="text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{stats.overdueCount} Renewals Due</span>
              </div>
            )}
          </div>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 border-cyan-500/20 rounded-[2rem] bg-[#0E101A] flex flex-col justify-center min-h-[140px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Collected (YTD)</span>
            <div className="text-4xl font-black text-white tracking-tight">
              {stats ? formatCurrency(stats.totalCollected) : '₹0'}
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-amber-500/20 rounded-[2rem] bg-[#0E101A] flex flex-col justify-center min-h-[140px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Outstanding</span>
            <div className="text-4xl font-black text-white tracking-tight">
              {stats ? formatCurrency(stats.outstanding) : '₹0'}
            </div>
            {stats?.overdueCount > 0 && (
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-2 flex items-center gap-1">
                <AlertTriangle size={10} /> {stats.overdueCount} overdue
              </span>
            )}
          </GlassCard>

          <GlassCard className="p-6 border-emerald-500/20 rounded-[2rem] bg-[#0E101A] flex flex-col justify-center min-h-[140px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Invoices Issued</span>
            <div className="text-4xl font-black text-white tracking-tight">
              {stats ? stats.invoicesIssued : 0}
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-2">
              This year
            </span>
          </GlassCard>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
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
        <div className="flex flex-col gap-6 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">All Invoices</h2>
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
            data={invoices}
            isLoading={isLoading}
            loadingMessage="Loading Invoices..."
            emptyMessage="No invoices found."
            page={page}
            total={total}
            pageSize={5}
            onPageChange={setPage}
          />
        </div>
        
      </div>
    </DashboardLayout>
  );
}
