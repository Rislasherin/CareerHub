'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Users, Search, Plus, UserX, UserCheck, Mail, Building2, MoreVertical, Loader2, RotateCw } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { getInterviewers, addInterviewer, toggleInterviewerStatus, resendInterviewerInvite, Interviewer } from '@/services/hr/interviewer.service';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConfirmModal } from '@/components/shared/ConfirmModal';

export default function InterviewersPage() {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isResending, setIsResending] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  
  // Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    interviewerId: string;
    action: 'block' | 'unblock';
  }>({
    isOpen: false,
    interviewerId: '',
    action: 'block',
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const fetchInterviewers = useCallback(async (searchQuery: string, currentPage: number) => {
    setIsLoading(true);
    try {
      const result = await getInterviewers(currentPage, limit, searchQuery);
      setInterviewers(result.interviewers);
      setTotal(result.total);
    } catch (err) {
      toast.error('Failed to load interviewers');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInterviewers(query, page);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, page, fetchInterviewers]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('All fields are required');
      return;
    }

    // Capitalization Validation
    if (formData.firstName[0] !== formData.firstName[0].toUpperCase()) {
      toast.error('First name must start with a capital letter');
      return;
    }
    if (formData.lastName[0] !== formData.lastName[0].toUpperCase()) {
      toast.error('Last name must start with a capital letter');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsAdding(true);
    try {
      await addInterviewer(formData);
      toast.success('Interviewer invited successfully!');
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '' });
      fetchInterviewers(query, page);
    } catch (err) {
      toast.error('Failed to invite interviewer');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleStatusRequest = (interviewerId: string, currentStatus: string) => {
    if (currentStatus?.toLowerCase() === 'pending') {
      toast.info('Cannot toggle status of pending interviewers');
      return;
    }

    setConfirmConfig({
      isOpen: true,
      interviewerId,
      action: currentStatus?.toUpperCase() === 'ACTIVE' ? 'block' : 'unblock'
    });
  };

  const handleConfirmToggle = async () => {
    setIsToggling(true);
    try {
      await toggleInterviewerStatus(confirmConfig.interviewerId);
      toast.success(`Interviewer ${confirmConfig.action === 'block' ? 'blocked' : 'unactivated'} successfully`);
      setConfirmConfig({ ...confirmConfig, isOpen: false });
      fetchInterviewers(query, page);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setIsToggling(false);
    }
  };

  const handleResendInvite = async (interviewerId: string) => {
    setIsResending(interviewerId);
    try {
      await resendInterviewerInvite(interviewerId);
      toast.success('Invitation link resent successfully!');
    } catch (err) {
      toast.error('Failed to resend invitation');
    } finally {
      setIsResending(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Interviewers</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your company's interview panel.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 font-bold px-6 h-12 rounded-xl">
            <Plus size={18} className="mr-2" /> Add Interviewer
          </Button>
        </div>

        <GlassCard className="p-6">
          <div className="flex items-center mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search by name or email..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-400">Interviewer</th>
                  <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-400">Designation</th>
                  <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                  <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <Loader2 className="animate-spin mx-auto" size={24} />
                    </td>
                  </tr>
                ) : interviewers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 font-medium">
                      No interviewers found.
                    </td>
                  </tr>
                ) : (
                  interviewers.map((interviewer) => (
                    <tr key={interviewer.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                            {interviewer.firstName[0]}{interviewer.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{interviewer.firstName} {interviewer.lastName}</div>
                            <div className="text-xs text-slate-500 font-medium">{interviewer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-slate-600">{interviewer.designation || 'Interviewer'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize
                          ${interviewer.status?.toUpperCase() === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 
                            interviewer.status?.toUpperCase() === 'BLOCKED' ? 'bg-red-50 text-red-600' : 
                            'bg-amber-50 text-amber-600'}`}
                        >
                          {interviewer.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {interviewer.status?.toLowerCase() === 'pending' && (
                            <button 
                              onClick={() => handleResendInvite(interviewer.id)}
                              disabled={isResending === interviewer.id}
                              className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-50"
                              title="Resend Invitation Link"
                            >
                              <RotateCw size={18} className={isResending === interviewer.id ? 'animate-spin' : ''} />
                            </button>
                          )}
                          {interviewer.status?.toLowerCase() !== 'pending' && (
                            <button 
                              onClick={() => handleToggleStatusRequest(interviewer.id, interviewer.status)}
                              className={`p-2 rounded-lg transition-colors ${
                                interviewer.status?.toUpperCase() === 'ACTIVE' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'
                              }`}
                              title={interviewer.status?.toUpperCase() === 'ACTIVE' ? 'Block Interviewer' : 'Unblock Interviewer'}
                            >
                              {interviewer.status?.toUpperCase() === 'ACTIVE' ? <UserX size={18} /> : <UserCheck size={18} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-4 px-4">
              <span className="text-sm font-medium text-slate-500">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
              </span>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Add Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900">Invite Interviewer</h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">An invitation link will be sent to their email.</p>
                </div>

                <form noValidate onSubmit={handleAddSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="First Name" 
                        placeholder="John" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                      <Input 
                        label="Last Name" 
                        placeholder="Doe" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                  </div>
                  <Input 
                    label="Email Address" 
                    type="email"
                    icon={<Mail size={18} />}
                    placeholder="john.doe@company.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold h-12 rounded-xl">
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isAdding} className="flex-1 bg-indigo-600 hover:bg-indigo-700 font-bold h-12 rounded-xl">
                      Send Invite
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
        <ConfirmModal 
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
          onConfirm={handleConfirmToggle}
          isLoading={isToggling}
          title={confirmConfig.action === 'block' ? 'Block Interviewer' : 'Unblock Interviewer'}
          message={`Are you sure you want to ${confirmConfig.action} this interviewer? They will ${confirmConfig.action === 'block' ? 'no longer' : 'once again'} be able to access the platform.`}
          confirmText={confirmConfig.action === 'block' ? 'Block Access' : 'Restore Access'}
          type={confirmConfig.action === 'block' ? 'danger' : 'info'}
        />
      </div>
    </DashboardLayout>
  );
}
