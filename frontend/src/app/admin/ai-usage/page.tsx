'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Activity, Brain, Server, Shield, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminService } from '@/services/super-admin/super-admin.service';
import { toast } from 'sonner';

export default function AIUsageLedger() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getAILedger({ feature: search || undefined });
      setLedger(res.ledger || []);
      setStats(res.stats || []);
    } catch (err) {
      toast.error('Failed to fetch AI usage ledger');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLedger();
  }, [search]);

  // Aggregate global stats
  const totalCredits = stats.reduce((acc, s) => acc + s.totalConsumed, 0);

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 flex flex-col gap-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">AI Usage Ledger</h1>
            <p className="text-slate-500 text-sm font-medium">Monitor AI token/credit consumption across all colleges</p>
          </div>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#121520] p-6 rounded-[2rem] border border-white/5 flex items-center gap-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Brain size={64} className="text-cyan-500" />
             </div>
             <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                 <Brain size={28} className="text-cyan-400" />
             </div>
             <div>
                 <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Credits Consumed</p>
                 <h2 className="text-4xl font-black text-white">{totalCredits}</h2>
             </div>
          </div>
          <div className="bg-[#121520] p-6 rounded-[2rem] border border-white/5 flex items-center gap-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Activity size={64} className="text-emerald-500" />
             </div>
             <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                 <Activity size={28} className="text-emerald-400" />
             </div>
             <div>
                 <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Active Colleges Using AI</p>
                 <h2 className="text-4xl font-black text-white">{stats.length}</h2>
             </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by feature (e.g. ai_interview, mock_interview)..."
              className="w-full bg-[#121520] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-[#121520] border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction ID</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">College ID</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Feature</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Credits</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                          <span className="text-slate-500 font-bold text-sm">Loading ledger...</span>
                        </div>
                      </td>
                    </tr>
                  ) : ledger.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <Server size={48} className="text-slate-600" />
                          <span className="text-slate-500 font-bold text-sm">No usage records found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    ledger.map((record, i) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-8 py-6">
                           <span className="text-xs font-mono text-slate-400 group-hover:text-cyan-400 transition-colors">
                              {record.id.substring(0, 8)}...
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-xs font-medium text-slate-300">{record.collegeId}</span>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-xs font-bold text-white capitalize">{record.feature.replace('_', ' ')}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            record.status === 'COMMITTED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : record.status === 'RELEASED'
                              ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              record.status === 'COMMITTED' ? 'bg-emerald-500' :
                              record.status === 'RELEASED' ? 'bg-slate-500' :
                              'bg-amber-500'
                            }`} />
                            {record.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`text-sm font-black ${record.status === 'COMMITTED' ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {record.status === 'COMMITTED' ? `-${record.creditsConsumed}` : record.reservedCredits ? `(res: ${record.reservedCredits})` : '-'}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-xs text-slate-500">{new Date(record.createdAt).toLocaleString()}</span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
