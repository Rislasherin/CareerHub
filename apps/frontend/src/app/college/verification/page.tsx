'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Check, X, ExternalLink, Search, Filter, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const pendingStudents = [
  { id: '1', name: 'Aarav Sharma', email: 'aarav@email.com', date: '2026-05-10', proofUrl: '#' },
  { id: '2', name: 'Ishani Patel', email: 'ishani@email.com', date: '2026-05-09', proofUrl: '#' },
  { id: '3', name: 'Vihaan Gupta', email: 'vihaan@email.com', date: '2026-05-08', proofUrl: '#' },
];

export default function VerificationPortal() {
  const [students, setStudents] = useState(pendingStudents);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setStudents(prev => prev.filter(s => s.id !== id));
    console.log(`${action}ing student:`, id);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-text-main tracking-tight">Student Verification</h1>
            <p className="text-text-muted font-medium">Review and approve pending student registrations.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 px-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Approval</span>
              <span className="text-2xl font-black text-amber-500">{students.length}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>

        <GlassCard className="p-0 overflow-hidden border-none shadow-xl shadow-slate-200/50">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto px-6 font-bold border-slate-200 hover:border-slate-900">
              <Filter size={18} className="mr-2" /> Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Name</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Registration Date</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Identity Proof</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {students.map((student) => (
                    <motion.tr 
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-6 border-b border-slate-50">
                        <div className="flex flex-col">
                          <span className="font-black text-text-main group-hover:text-emerald-600 transition-colors">{student.name}</span>
                          <span className="text-xs font-medium text-text-muted">{student.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 border-b border-slate-50 text-sm font-bold text-slate-500">
                        {student.date}
                      </td>
                      <td className="px-8 py-6 border-b border-slate-50">
                        <a 
                          href={student.proofUrl} 
                          target="_blank" 
                          className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          View Document <ExternalLink size={14} />
                        </a>
                      </td>
                      <td className="px-8 py-6 border-b border-slate-50 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            onClick={() => handleAction(student.id, 'approve')}
                            title="Approve"
                          >
                            <Check size={20} />
                          </button>
                          <button 
                            className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                            onClick={() => handleAction(student.id, 'reject')}
                            title="Reject"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                          <Check size={32} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-lg font-black text-text-main">All Caught Up!</span>
                          <span className="text-sm font-medium text-text-muted">No pending students to verify at the moment.</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
