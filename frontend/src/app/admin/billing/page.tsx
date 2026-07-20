'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Table, Column } from '@/components/shared/Table';
import {
  Download,
  Mail,
  Plus,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { superAdminService } from '@/services/super-admin/super-admin.service';
import { toast } from 'sonner';

export default function BillingAndInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBillingData = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getBillingInvoices(page, 5);
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
  }, [page]);

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
          ₹{invoice.amount.toLocaleString('en-IN')}
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
      render: () => (
        <div className="flex justify-end gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold transition-colors border border-white/5">
            <Mail size={12} /> Email
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-[#0B0D17] text-[10px] font-black transition-colors">
            <Download size={12} /> PDF
          </button>
        </div>
      )
    }
  ], []);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
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
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-[#0B0D17] font-black text-xs rounded-xl h-10 px-5 shadow-lg shadow-cyan-500/20">
              <Plus size={14} className="mr-1.5" /> Add College
            </Button>
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

        {/* Invoices Table Section */}
        <div className="flex flex-col gap-6 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">All Invoices</h2>
            <div className="flex gap-3">
              <Button variant="outline" className="h-9 text-xs rounded-xl font-bold bg-white/5 border-white/5 text-slate-300">
                <Download size={14} className="mr-2" /> Export CSV
              </Button>
              <Button className="h-9 text-xs rounded-xl font-black bg-cyan-500 hover:bg-cyan-600 text-[#0B0D17]">
                <Plus size={14} className="mr-2" /> Generate Invoice
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
