'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Users, Search, Plus, UserX, UserCheck, Mail, Building2, MoreVertical, Loader2, RotateCw, Pencil, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import {
  getInterviewers,
  addInterviewer,
  toggleInterviewerStatus,
  resendInterviewerInvite,
  updateInterviewer,
  deleteInterviewer,
  restoreInterviewer
} from '@/services/hr/interviewer.service';
import { Interviewer } from '@/types/interviewer';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Table, Column } from '@/components/shared/Table';

export default function InterviewersPage() {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [query, setQuery] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isResending, setIsResending] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInterviewer, setEditingInterviewer] = useState<Interviewer | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    designation: '',
    specialization: '',
  });

  // Delete State
  const [deleteConfirmConfig, setDeleteConfirmConfig] = useState({
    isOpen: false,
    interviewerId: '',
    interviewerName: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Restore State
  const [restoreConfirmConfig, setRestoreConfirmConfig] = useState({
    isOpen: false,
    interviewerId: '',
    interviewerName: '',
  });
  const [isRestoring, setIsRestoring] = useState(false);

  // Toggle Activation Modal State
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

  const fetchInterviewers = useCallback(async (searchQuery: string, currentPage: number, showDeleted: boolean) => {
    setIsLoading(true);
    try {
      const result = await getInterviewers(currentPage, limit, searchQuery, showDeleted);
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
      fetchInterviewers(query, page, includeDeleted);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, page, includeDeleted, fetchInterviewers]);

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
      fetchInterviewers(query, page, includeDeleted);
    } catch (err) {
      toast.error('Failed to invite interviewer');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditClick = (interviewer: Interviewer) => {
    setEditingInterviewer(interviewer);
    setEditFormData({
      firstName: interviewer.firstName,
      lastName: interviewer.lastName,
      designation: interviewer.designation || '',
      specialization: (interviewer as Interviewer & { specialization?: string }).specialization || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInterviewer) return;

    if (!editFormData.firstName || !editFormData.lastName) {
      toast.error('First and Last names are required');
      return;
    }

    // Capitalization validation
    if (editFormData.firstName[0] !== editFormData.firstName[0].toUpperCase()) {
      toast.error('First name must start with a capital letter');
      return;
    }
    if (editFormData.lastName[0] !== editFormData.lastName[0].toUpperCase()) {
      toast.error('Last name must start with a capital letter');
      return;
    }

    setIsUpdating(true);
    try {
      await updateInterviewer(editingInterviewer.id, editFormData);
      toast.success('Interviewer profile updated successfully!');
      setIsEditModalOpen(false);
      fetchInterviewers(query, page, includeDeleted);
    } catch (err) {
      toast.error('Failed to update interviewer');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (interviewerId: string, name: string) => {
    setDeleteConfirmConfig({
      isOpen: true,
      interviewerId,
      interviewerName: name,
    });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteInterviewer(deleteConfirmConfig.interviewerId);
      toast.success('Interviewer removed successfully!');
      setDeleteConfirmConfig({ isOpen: false, interviewerId: '', interviewerName: '' });
      fetchInterviewers(query, page, includeDeleted);
    } catch (err) {
      toast.error('Failed to remove interviewer');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreClick = (interviewerId: string, name: string) => {
    setRestoreConfirmConfig({
      isOpen: true,
      interviewerId,
      interviewerName: name,
    });
  };

  const handleConfirmRestore = async () => {
    setIsRestoring(true);
    try {
      await restoreInterviewer(restoreConfirmConfig.interviewerId);
      toast.success('Interviewer restored successfully!');
      setRestoreConfirmConfig({ isOpen: false, interviewerId: '', interviewerName: '' });
      fetchInterviewers(query, page, includeDeleted);
    } catch (err) {
      toast.error('Failed to restore interviewer');
    } finally {
      setIsRestoring(false);
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
      toast.success(`Interviewer status updated to ${confirmConfig.action === 'block' ? 'blocked' : 'active'} successfully`);
      setConfirmConfig({ ...confirmConfig, isOpen: false });
      fetchInterviewers(query, page, includeDeleted);
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

  const columns: Column<Interviewer>[] = useMemo(() => [
    {
      header: 'Interviewer',
      render: (interviewer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm uppercase">
            {interviewer.firstName?.[0] || ''}{interviewer.lastName?.[0] || ''}
          </div>
          <div>
            <div className="font-bold text-white">
              {interviewer.firstName || 'Unknown'} {interviewer.lastName || 'Interviewer'}
            </div>
            <div className="text-xs text-slate-400 font-medium">{interviewer.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Designation',
      render: (interviewer) => (
        <span className="text-sm font-medium text-slate-300">{interviewer.designation || 'Interviewer'}</span>
      )
    },
    {
      header: 'Status',
      render: (interviewer) => (
        interviewer.isDeleted ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize bg-slate-100 text-slate-500">
            Archived
          </span>
        ) : (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize
            ${interviewer.status?.toUpperCase() === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
              interviewer.status?.toUpperCase() === 'BLOCKED' ? 'bg-red-50 text-red-600' :
                'bg-amber-50 text-amber-600'}`}
          >
            {interviewer.status}
          </span>
        )
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (interviewer) => (
        <div className="flex items-center justify-end gap-1">
          {interviewer.isDeleted ? (
            <button
              onClick={() => handleRestoreClick(interviewer.id, `${interviewer.firstName} ${interviewer.lastName}`)}
              className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"
              title="Restore Access"
            >
              <RotateCw size={18} />
            </button>
          ) : (
            <>
              {interviewer.status?.toLowerCase() === 'pending' ? (
                <button
                  onClick={() => handleResendInvite(interviewer.id)}
                  disabled={isResending === interviewer.id}
                  className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-50"
                  title="Resend Invitation Link"
                >
                  <RotateCw size={18} className={isResending === interviewer.id ? 'animate-spin' : ''} />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleEditClick(interviewer)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Edit Profile Details"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleToggleStatusRequest(interviewer.id, interviewer.status)}
                    className={`p-2 rounded-lg transition-colors ${interviewer.status?.toUpperCase() === 'ACTIVE' ? 'text-amber-500 hover:bg-amber-500/20' : 'text-emerald-500 hover:bg-emerald-500/20'
                      }`}
                    title={interviewer.status?.toUpperCase() === 'ACTIVE' ? 'Block Access' : 'Unblock Access'}
                  >
                    {interviewer.status?.toUpperCase() === 'ACTIVE' ? <UserX size={18} /> : <UserCheck size={18} />}
                  </button>
                </>
              )}
              <button
                onClick={() => handleDeleteClick(interviewer.id, `${interviewer.firstName} ${interviewer.lastName}`)}
                className="p-2 rounded-lg text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Remove Interviewer"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      )
    }
  ], [handleRestoreClick, handleResendInvite, isResending, handleEditClick, handleToggleStatusRequest, handleDeleteClick]);

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => {
                  setIncludeDeleted(e.target.checked);
                  setPage(1);
                }}
                className="w-4.5 h-4.5 text-indigo-600 border-slate-350 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Show Archived Panelists</span>
            </label>
          </div>

          <Table
            columns={columns}
            data={interviewers}
            isLoading={isLoading}
            emptyMessage="No interviewers found."
            page={page}
            total={total}
            pageSize={limit}
            onPageChange={setPage}
          />
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
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    icon={<Mail size={18} />}
                    placeholder="john.doe@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold h-12 rounded-xl transition-all duration-200 flex items-center justify-center"
                    >
                      Cancel
                    </button>
                    <Button type="submit" isLoading={isAdding} className="flex-1 bg-indigo-600 hover:bg-indigo-700 font-bold h-12 rounded-xl">
                      Send Invite
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {isEditModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900">Edit Profile</h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">Update profile credentials for your panelist.</p>
                </div>

                <form noValidate onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      placeholder="John"
                      value={editFormData.firstName}
                      onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    />
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      value={editFormData.lastName}
                      onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Designation"
                    placeholder="Senior Developer / Tech Lead"
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                  />
                  <Input
                    label="Specialization"
                    placeholder="System Design, Algorithms"
                    value={editFormData.specialization}
                    onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                  />

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold h-12 rounded-xl transition-all duration-200 flex items-center justify-center"
                    >
                      Cancel
                    </button>
                    <Button type="submit" isLoading={isUpdating} className="flex-1 bg-indigo-600 hover:bg-indigo-700 font-bold h-12 rounded-xl">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Status Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
          onConfirm={handleConfirmToggle}
          isLoading={isToggling}
          title={confirmConfig.action === 'block' ? 'Block Interviewer' : 'Restore Access'}
          message={`Are you sure you want to ${confirmConfig.action} this interviewer? They will ${confirmConfig.action === 'block' ? 'no longer' : 'once again'} be able to access the platform.`}
          confirmText={confirmConfig.action === 'block' ? 'Block Access' : 'Restore Access'}
          type={confirmConfig.action === 'block' ? 'danger' : 'info'}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteConfirmConfig.isOpen}
          onClose={() => setDeleteConfirmConfig({ ...deleteConfirmConfig, isOpen: false, interviewerId: '', interviewerName: '' })}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title="Remove Interviewer"
          message={`Are you sure you want to remove ${deleteConfirmConfig.interviewerName}? This performs a soft-delete: their system login is revoked, but historical interviews are fully preserved for company audit trails.`}
          confirmText="Remove Panelist"
          type="danger"
        />

        {/* Restore Confirmation Modal */}
        <ConfirmModal
          isOpen={restoreConfirmConfig.isOpen}
          onClose={() => setRestoreConfirmConfig({ ...restoreConfirmConfig, isOpen: false, interviewerId: '', interviewerName: '' })}
          onConfirm={handleConfirmRestore}
          isLoading={isRestoring}
          title="Restore Panelist"
          message={`Are you sure you want to restore ${restoreConfirmConfig.interviewerName}? This sets their profile back to ACTIVE, enabling their login and restoring their active status in your hiring panel.`}
          confirmText="Restore Panelist"
          type="info"
        />
      </div>
    </DashboardLayout>
  );
}
