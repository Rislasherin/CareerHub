'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/shared/Button';
import {
  Building2,
  Search,
  Filter,
  MoreVertical,
  Ban,
  Unlock,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  AlertTriangle,
  ExternalLink,
  FileText,
  Calendar,
  Award,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Clock,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminService } from '@/services/super-admin/super-admin.service';
import { toast } from 'sonner';

import { ConfirmModal } from '@/components/shared/ConfirmModal';

export default function CollegesManagement() {
  const [data, setData] = useState<any[]>([]);
  const [viewedCollege, setViewedCollege] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    isLoading: boolean;
  }>({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => { },
    isLoading: false
  });

  // Rejection Reason Modal State
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    collegeId: string;
    collegeName: string;
    reason: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    collegeId: '',
    collegeName: '',
    reason: '',
    isLoading: false
  });

  const handleExportCSV = async () => {
    try {
      const res = await superAdminService.getOrganizations('', 1, 1000, '');
      const colleges = res.organizations || [];
      
      if (colleges.length === 0) {
        toast.info("No records to export");
        return;
      }

      const headers = ['Institution Name', 'City', 'State', 'Placement Contact Email', 'Placement Contact Phone', 'Registered Students', 'Status'];
      const rows = colleges.map((col: any) => [
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

  const fetchColleges = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getOrganizations(search, page, 10, statusFilter);
      setData(res.organizations || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error('Failed to fetch colleges');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchColleges();
  }, [page, search, statusFilter]);

  const [rejectMode, setRejectMode] = useState(false);
  const [approveMode, setApproveMode] = useState(false);
  const [inlineRejectReason, setInlineRejectReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleApprove = (college: any) => {
    setViewedCollege(college);
    setApproveMode(true);
    setRejectMode(false);
    setInlineRejectReason('');
  };

  const handleOpenRejectModal = (college: any) => {
    setViewedCollege(college);
    setRejectMode(true);
    setApproveMode(false);
    setInlineRejectReason('');
  };

  const executeApprove = async (college: any) => {
    if (!college?.id) return;
    setIsActionLoading(true);
    try {
      await superAdminService.updateStatus('college_admin', college.id, 'ACTIVE');
      toast.success(`College "${college.name}" approved successfully! Platform access granted.`);
      fetchColleges();
      if (viewedCollege?.id === college.id) {
        setViewedCollege((prev: any) => prev ? { ...prev, status: 'ACTIVE', approvedAt: new Date().toISOString() } : null);
      }
      setApproveMode(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve college');
    }
    setIsActionLoading(false);
  };

  const executeReject = async (college: any, reason: string) => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast.error('Please provide a rejection reason explaining what changes are required.');
      return;
    }

    setIsActionLoading(true);
    try {
      await superAdminService.updateStatus('college_admin', college.id, 'REJECTED', trimmedReason);
      toast.success(`College "${college.name}" request rejected with administrative feedback.`);
      fetchColleges();
      if (viewedCollege?.id === college.id) {
        setViewedCollege((prev: any) => prev ? {
          ...prev,
          status: 'REJECTED',
          rejectionReason: trimmedReason,
          rejectedAt: new Date().toISOString()
        } : null);
      }
      setRejectMode(false);
      setInlineRejectReason('');
      setRejectionModal(prev => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject college request');
    }
    setIsActionLoading(false);
  };

  const handleConfirmReject = async () => {
    await executeReject({ id: rejectionModal.collegeId, name: rejectionModal.collegeName }, rejectionModal.reason);
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const isBlocking = currentStatus?.toUpperCase() === 'ACTIVE';
    const newStatus = isBlocking ? 'BLOCKED' : 'ACTIVE';
    const actionWord = isBlocking ? 'block' : 'unblock';

    setModalConfig({
      isOpen: true,
      type: isBlocking ? 'warning' : 'info',
      title: isBlocking ? 'Block College' : 'Unblock College',
      message: `Are you sure you want to ${actionWord} this institution? ${isBlocking ? 'They will lose access to the platform.' : 'They will regain access.'}`,
      confirmText: isBlocking ? 'Block College' : 'Unblock College',
      isLoading: false,
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isLoading: true }));
        try {
          await superAdminService.updateStatus('college_admin', id, newStatus);
          toast.success(`College ${actionWord}ed successfully`);
          fetchColleges();
          if (viewedCollege?.id === id) {
            setViewedCollege((prev: any) => prev ? { ...prev, status: newStatus } : null);
          }
        } catch (err) {
          toast.error('Failed to update status');
        }
        setModalConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
      }
    });
  };

  const handleDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Remove College',
      message: 'Are you sure you want to remove this college? This will deactivate the institution and its associated data. This action can be reversed by system administrators if needed.',
      confirmText: 'Remove College',
      isLoading: false,
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isLoading: true }));
        try {
          await superAdminService.deleteUser('college_admin', id);
          toast.success('College deleted successfully');
          fetchColleges();
          if (viewedCollege?.id === id) {
            setViewedCollege(null);
          }
        } catch (err) {
          toast.error('Failed to delete college');
        }
        setModalConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
      }
    });
  };

  const getStatusBadge = (status?: string) => {
    const s = status?.toUpperCase() || 'ACTIVE';
    switch (s) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending Approval
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">College Management</h1>
            <p className="text-slate-500 text-sm font-medium">Oversee, review, and manage registered institutions</p>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email or city..."
              className="w-full bg-[#121520] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-6 py-3 rounded-2xl bg-[#121520] border border-white/5 text-sm font-bold text-slate-400 hover:text-white transition-all appearance-none outline-none focus:border-cyan-500/50 cursor-pointer min-w-[180px]"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="ACTIVE">Active / Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="BLOCKED">Blocked</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm font-bold text-slate-400 hover:text-white transition-all hover:bg-slate-800"
          >
            <Download size={16} className="text-cyan-400" />
            Export CSV
          </button>
        </div>

        {/* Table Content */}
        <div className="bg-[#121520] border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Institution</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Students</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                          <span className="text-slate-500 font-bold text-sm">Loading colleges...</span>
                        </div>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <Building2 size={48} className="text-slate-600" />
                          <span className="text-slate-500 font-bold text-sm">No colleges found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((college, i) => (
                      <motion.tr
                        key={college.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td 
                          className="px-8 py-6 cursor-pointer"
                          onClick={() => {
                            setViewedCollege(college);
                            setApproveMode(false);
                            setRejectMode(false);
                            setInlineRejectReason('');
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 group-hover:border-cyan-500/20 transition-all overflow-hidden shrink-0">
                              {college.logoUrl ? (
                                <img src={college.logoUrl} alt={college.name} className="w-full h-full object-cover" />
                              ) : (
                                <Building2 size={20} className="text-slate-400 group-hover:text-cyan-400" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                                {college.name}
                              </span>
                              <span className="text-xs text-slate-500">
                                {college.city}{college.state ? `, ${college.state}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-300">
                              {college.placementContactEmail || college.email || 'No email'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {college.placementContactPhone || 'No phone'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-300">
                          {college.countOfStudents || 0}
                        </td>
                        <td className="px-8 py-6">
                          {getStatusBadge(college.status)}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            {/* Actions for PENDING requests: Review application, Approve, Reject */}
                            {college.status?.toUpperCase() === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => {
                                    setViewedCollege(college);
                                    setApproveMode(false);
                                    setRejectMode(false);
                                    setInlineRejectReason('');
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold transition-all border border-cyan-500/20 flex items-center gap-1.5 shadow-sm"
                                  title="Review Application Details"
                                >
                                  <Eye size={14} />
                                  <span>Review</span>
                                </button>
                                <button
                                  onClick={() => handleApprove(college)}
                                  className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                                  title="Approve College"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleOpenRejectModal(college)}
                                  className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20"
                                  title="Reject with Feedback"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => {
                                  setViewedCollege(college);
                                  setApproveMode(false);
                                  setRejectMode(false);
                                  setInlineRejectReason('');
                                }}
                                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                            )}

                            {/* Block / Unblock for Active / Blocked */}
                            {college.status?.toUpperCase() === 'ACTIVE' && (
                              <button
                                onClick={() => handleStatusToggle(college.id, college.status)}
                                className="p-2 rounded-xl bg-white/5 text-rose-400 hover:bg-rose-400/10 transition-all"
                                title="Block College"
                              >
                                <Ban size={16} />
                              </button>
                            )}
                            {college.status?.toUpperCase() === 'BLOCKED' && (
                              <button
                                onClick={() => handleStatusToggle(college.id, college.status)}
                                className="p-2 rounded-xl bg-white/5 text-amber-400 hover:bg-amber-400/10 transition-all"
                                title="Unblock College"
                              >
                                <Unlock size={16} />
                              </button>
                            )}

                            {/* Delete Action */}
                            <button
                              onClick={() => handleDelete(college.id)}
                              className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
                              title="Delete College"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <ConfirmModal
            isOpen={modalConfig.isOpen}
            onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            onConfirm={modalConfig.onConfirm}
            isLoading={modalConfig.isLoading}
            title={modalConfig.title}
            message={modalConfig.message}
            confirmText={modalConfig.confirmText}
            type={modalConfig.type}
          />

          {/* Rejection Reason Modal */}
          <AnimatePresence>
            {rejectionModal.isOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-[#0B0D17] border border-rose-500/30 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
                >
                  <div className="p-6 md:p-8 flex flex-col gap-5">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                          <AlertTriangle size={24} className="text-rose-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white tracking-tight">Reject College Request</h3>
                          <p className="text-xs text-slate-400 font-medium">{rejectionModal.collegeName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setRejectionModal(prev => ({ ...prev, isOpen: false }))}
                        className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      Please state the reason for rejecting this institution. This feedback will be displayed to the college administrator so they can correct their information and resubmit.
                    </p>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Rejection Reason <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        value={rejectionModal.reason}
                        onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="e.g. Please provide a valid NAAC accreditation certificate and correct the institutional placement contact details."
                        rows={4}
                        className="w-full bg-[#121520] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/50 transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setRejectionModal(prev => ({ ...prev, isOpen: false }))}
                        disabled={rejectionModal.isLoading}
                        className="flex-1 py-3.5 rounded-2xl font-bold bg-white/5 hover:bg-white/10 text-slate-300 transition-all text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmReject}
                        disabled={rejectionModal.isLoading}
                        className="flex-1 py-3.5 rounded-2xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {rejectionModal.isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <XCircle size={16} />
                            Confirm Rejection
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* View Details Modal */}
          <AnimatePresence>
            {viewedCollege && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0B0D17] border border-white/10 rounded-[2.5rem] w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
                >
                  {/* Modal Header */}
                  <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-start gap-4 shrink-0">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 overflow-hidden shrink-0">
                        {viewedCollege.logoUrl ? (
                          <img src={viewedCollege.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 size={28} className="text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h2 className="text-2xl font-black text-white tracking-tight">{viewedCollege.name}</h2>
                          {getStatusBadge(viewedCollege.status)}
                        </div>
                        <p className="text-slate-400 text-xs font-semibold">
                          {viewedCollege.shortName ? `${viewedCollege.shortName} • ` : ''}
                          Established {viewedCollege.yearEstablished || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setViewedCollege(null);
                        setApproveMode(false);
                        setRejectMode(false);
                        setInlineRejectReason('');
                      }}
                      className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Modal Body (Scrollable) */}
                  <div className="p-6 md:p-8 overflow-y-auto flex flex-col gap-6">
                    {/* Rejection Notice Banner */}
                    {viewedCollege.status?.toUpperCase() === 'REJECTED' && (
                      <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                          <AlertTriangle size={18} />
                          <span>Request Rejection Feedback</span>
                        </div>
                        <p className="text-sm text-slate-200 bg-black/30 p-3 rounded-xl font-mono leading-relaxed">
                          {viewedCollege.rejectionReason || 'No specific rejection reason recorded.'}
                        </p>
                        {viewedCollege.rejectedAt && (
                          <span className="text-[11px] text-slate-400">
                            Rejected on: {new Date(viewedCollege.rejectedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Resubmission Alert */}
                    {viewedCollege.resubmittedAt && (
                      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3 text-cyan-300 text-xs">
                        <Clock size={16} className="shrink-0" />
                        <span>
                          This request was updated and resubmitted by the institution on {new Date(viewedCollege.resubmittedAt).toLocaleString()}.
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Institution Overview */}
                      <div className="p-5 rounded-2xl bg-[#121520] border border-white/5 flex flex-col gap-3">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <Award size={14} className="text-cyan-400" />
                          Institution Overview
                        </p>
                        <div className="flex flex-col gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium">Short Code: </span>
                            <span className="text-white font-bold">{viewedCollege.shortName || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">NAAC Grade: </span>
                            <span className="text-cyan-400 font-bold">{viewedCollege.naacGrade || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Website: </span>
                            {viewedCollege.website ? (
                              <a
                                href={viewedCollege.website.startsWith('http') ? viewedCollege.website : `https://${viewedCollege.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline font-medium inline-flex items-center gap-1"
                              >
                                {viewedCollege.website}
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Location & Address */}
                      <div className="p-5 rounded-2xl bg-[#121520] border border-white/5 flex flex-col gap-3">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <MapPin size={14} className="text-cyan-400" />
                          Campus Location
                        </p>
                        <div className="flex flex-col gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium">City: </span>
                            <span className="text-white font-bold">{viewedCollege.city || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">State: </span>
                            <span className="text-white font-bold">{viewedCollege.state || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Address: </span>
                            <span className="text-slate-300 font-medium">{viewedCollege.address || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="p-5 rounded-2xl bg-[#121520] border border-white/5 flex flex-col gap-3">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <Mail size={14} className="text-cyan-400" />
                          Placement Contact
                        </p>
                        <div className="flex flex-col gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium">Contact Email: </span>
                            <span className="text-white font-bold">{viewedCollege.placementContactEmail || viewedCollege.email || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Contact Phone: </span>
                            <span className="text-white font-bold">{viewedCollege.placementContactPhone || 'N/A'}</span>
                          </div>
                          {viewedCollege.email && viewedCollege.email !== viewedCollege.placementContactEmail && (
                            <div>
                              <span className="text-slate-500 font-medium">Admin Account Email: </span>
                              <span className="text-slate-300">{viewedCollege.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Academic & Platform Info */}
                      <div className="p-5 rounded-2xl bg-[#121520] border border-white/5 flex flex-col gap-3">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <GraduationCap size={14} className="text-cyan-400" />
                          Academic & Platform Details
                        </p>
                        <div className="flex flex-col gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium">Academic Year: </span>
                            <span className="text-white font-bold">{viewedCollege.currentAcademicYear || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Placement Batch: </span>
                            <span className="text-white font-bold">{viewedCollege.activePlacementBatch || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Subscription Plan: </span>
                            <span className="text-cyan-400 font-bold uppercase">{viewedCollege.plan || 'Free'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Registered Students: </span>
                            <span className="text-white font-bold">{viewedCollege.countOfStudents || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Active Branches */}
                      <div className="p-5 rounded-2xl bg-[#121520] border border-white/5 md:col-span-2 flex flex-col gap-3">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                          Active Branches / Departments
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {viewedCollege.activeBranches && viewedCollege.activeBranches.length > 0 ? (
                            viewedCollege.activeBranches.map((branch: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300"
                              >
                                {branch}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">None specified.</span>
                          )}
                        </div>
                      </div>

                      {/* Verification Documents */}
                      <div className="p-5 rounded-2xl bg-[#121520] border border-white/5 md:col-span-2 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <FileText size={14} className="text-cyan-400" />
                            Verification Documents & Accreditation
                          </p>
                          {((viewedCollege.verificationDocuments?.length || (viewedCollege.verificationDocument ? 1 : 0)) > 0) && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {(viewedCollege.verificationDocuments?.length || 1)} Document(s)
                            </span>
                          )}
                        </div>

                        {(() => {
                          const docs = (viewedCollege.verificationDocuments && viewedCollege.verificationDocuments.length > 0)
                            ? viewedCollege.verificationDocuments
                            : viewedCollege.verificationDocument
                              ? [{
                                  id: 'legacy-doc',
                                  category: 'OTHER',
                                  fileName: viewedCollege.verificationDocument.split('/').pop() || 'Verification Document',
                                  fileUrl: viewedCollege.verificationDocument,
                                }]
                              : [];

                          const categoryLabels: Record<string, string> = {
                            ESTABLISHMENT_CERTIFICATE: 'Registration / Establishment Certificate',
                            GOVERNMENT_RECOGNITION: 'Government Recognition Certificate',
                            UGC_AICTE_AFFILIATION: 'UGC / AICTE / University Affiliation',
                            INSTITUTION_AUTHORIZATION: 'Official Authorization Letter',
                            OTHER: 'Official Institution Verification Document',
                          };

                          if (docs.length === 0) {
                            return (
                              <p className="text-xs text-slate-500 py-3">
                                No verification documents have been submitted.
                              </p>
                            );
                          }

                          return (
                            <div className="space-y-2.5">
                              {docs.map((doc: any, idx: number) => {
                                const catLabel = categoryLabels[doc.category] || doc.category || 'Official Document';
                                return (
                                  <div
                                    key={doc.id || idx}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all gap-3"
                                  >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                                        <FileText size={18} />
                                      </div>
                                      <div className="overflow-hidden">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 truncate">
                                            {catLabel}
                                          </span>
                                        </div>
                                        <p className="text-xs font-bold text-white truncate max-w-xs md:max-w-md mt-1">
                                          {doc.fileName || 'Verification Document'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                          {doc.fileSize ? `${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB • ` : ''}
                                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Submitted with Application'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                      <a
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3.5 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold border border-cyan-500/20 inline-flex items-center gap-1.5 transition-all"
                                        title="View or Download Document"
                                      >
                                        <ExternalLink size={14} />
                                        View Document
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 md:p-8 border-t border-white/5 bg-[#0e111b] flex flex-col gap-4 shrink-0">
                    {/* Inline Approval Confirmation */}
                    {viewedCollege.status?.toUpperCase() === 'PENDING' && approveMode && (
                      <div className="w-full p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">Approve {viewedCollege.name}?</h4>
                            <p className="text-xs text-slate-400">The institution will receive full platform access and an approval notification email.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setApproveMode(false)}
                            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => executeApprove(viewedCollege)}
                            disabled={isActionLoading}
                            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                          >
                            {isActionLoading ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 size={14} />
                                Confirm & Approve
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Rejection Reason Form */}
                    {viewedCollege.status?.toUpperCase() === 'PENDING' && rejectMode && (
                      <div className="w-full p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                            <AlertTriangle size={18} />
                            <span>Provide Rejection Reason & Feedback *</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRejectMode(false)}
                            className="text-xs text-slate-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Explain what information or documents require revision so the college administrator can correct and resubmit.
                        </p>
                        <textarea
                          value={inlineRejectReason}
                          onChange={(e) => setInlineRejectReason(e.target.value)}
                          placeholder="e.g. Please upload a valid NAAC accreditation certificate and correct the institutional placement contact details."
                          rows={3}
                          className="w-full bg-[#0B0D17] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/50 resize-none transition-all"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setRejectMode(false)}
                            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => executeReject(viewedCollege, inlineRejectReason)}
                            disabled={isActionLoading || !inlineRejectReason.trim()}
                            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-50"
                          >
                            {isActionLoading ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <XCircle size={14} />
                                Confirm Rejection
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Default Footer Buttons */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => {
                          setViewedCollege(null);
                          setApproveMode(false);
                          setRejectMode(false);
                          setInlineRejectReason('');
                        }}
                        className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
                      >
                        Close
                      </button>

                      {viewedCollege.status?.toUpperCase() === 'PENDING' && !approveMode && !rejectMode && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setRejectMode(true);
                              setApproveMode(false);
                            }}
                            className="px-6 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-rose-500/5"
                          >
                            <XCircle size={16} />
                            Reject Request
                          </button>
                          <button
                            onClick={() => {
                              setApproveMode(true);
                              setRejectMode(false);
                            }}
                            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                          >
                            <CheckCircle2 size={16} />
                            Approve College
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Showing <span className="text-white">{(page - 1) * 10 + 1}</span> to <span className="text-white">{Math.min(page * 10, total)}</span> of <span className="text-white">{total}</span> colleges
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.ceil(total / 10))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${page === i + 1 ? 'bg-cyan-500 text-[#0B0D17]' : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                  >
                    {i + 1}
                  </button>
                )).slice(0, 5)}
              </div>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 10)}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

