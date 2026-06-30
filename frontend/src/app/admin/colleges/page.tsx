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
  Trash2,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus
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

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const isPending = currentStatus?.toUpperCase() === 'PENDING';
    const isBlocking = currentStatus?.toUpperCase() === 'ACTIVE';
    
    const newStatus = isPending ? 'ACTIVE' : (isBlocking ? 'BLOCKED' : 'ACTIVE');
    const actionWord = isPending ? 'approve' : (isBlocking ? 'block' : 'unblock');

    setModalConfig({
      isOpen: true,
      type: isBlocking ? 'warning' : 'info',
      title: isPending ? 'Approve College' : (isBlocking ? 'Block College' : 'Unblock College'),
      message: isPending 
        ? 'Are you sure you want to approve this college? They will gain full access to the platform.'
        : `Are you sure you want to ${actionWord} this institution? ${isBlocking ? 'They will lose access to the platform.' : 'They will regain access.'}`,
      confirmText: isPending ? 'Approve College' : (isBlocking ? 'Block College' : 'Unblock College'),
      isLoading: false,
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isLoading: true }));
        try {
          await superAdminService.updateStatus('college_admin', id, newStatus);
          toast.success(`College ${actionWord}d successfully`);
          fetchColleges();
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
        } catch (err) {
          toast.error('Failed to delete college');
        }
        setModalConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">College Management</h1>
            <p className="text-slate-500 text-sm font-medium">Oversee and manage registered institutions</p>
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
            className="px-6 py-3 rounded-2xl bg-[#121520] border border-white/5 text-sm font-bold text-slate-400 hover:text-white transition-all appearance-none outline-none focus:border-cyan-500/50 cursor-pointer min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending Approval</option>
            <option value="BLOCKED">Blocked</option>
          </select>
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
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 group-hover:border-cyan-500/20 transition-all">
                              <Building2 size={20} className="text-slate-400 group-hover:text-cyan-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{college.name}</span>
                              <span className="text-xs text-slate-500">{college.city}{college.state ? `, ${college.state}` : ''}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-300">{college.placementContactEmail || college.email || 'No email'}</span>
                            <span className="text-xs text-slate-500">{college.placementContactPhone || 'No phone'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-300">
                          {college.countOfStudents || 0}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            college.status?.toUpperCase() === 'BLOCKED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : college.status?.toUpperCase() === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              college.status?.toUpperCase() === 'BLOCKED' ? 'bg-rose-500' :
                              college.status?.toUpperCase() === 'PENDING' ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`} />
                            {college.status || 'active'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setViewedCollege(college)}
                              className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusToggle(college.id, college.status)}
                              className={`p-2 rounded-lg bg-white/5 transition-all ${
                                college.status?.toUpperCase() === 'PENDING' ? 'text-emerald-400 hover:bg-emerald-400/10' :
                                college.status?.toUpperCase() === 'BLOCKED' ? 'text-amber-400 hover:bg-amber-400/10' : 'text-rose-400 hover:bg-rose-400/10'
                                }`}
                              title={
                                college.status?.toUpperCase() === 'PENDING' ? 'Approve' :
                                college.status?.toUpperCase() === 'BLOCKED' ? 'Unblock' : 'Block'
                              }
                            >
                              {college.status?.toUpperCase() === 'PENDING' ? <CheckCircle2 size={16} /> :
                               college.status?.toUpperCase() === 'BLOCKED' ? <Unlock size={16} /> : <Ban size={16} />}
                              
                            </button>
                            <button
                              onClick={() => handleDelete(college.id)}
                              className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
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

          {/* View Details Modal */}
          <AnimatePresence>
            {viewedCollege && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#0B0D17] border border-white/10 rounded-[2rem] w-full max-w-2xl overflow-hidden"
                >
                  <div className="p-6 md:p-8 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 overflow-hidden">
                          {viewedCollege.logoUrl ? (
                            <img src={viewedCollege.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 size={28} className="text-cyan-400" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-white tracking-tight">{viewedCollege.name}</h2>
                          <p className="text-slate-400 font-medium">Institution</p>
                        </div>
                      </div>
                      <button onClick={() => setViewedCollege(null)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <span className="sr-only">Close</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Details</p>
                        <p className="text-sm text-slate-300 mb-1"><span className="font-medium text-slate-500">Email:</span> {viewedCollege.placementContactEmail || viewedCollege.email || 'N/A'}</p>
                        <p className="text-sm text-slate-300"><span className="font-medium text-slate-500">Phone:</span> {viewedCollege.placementContactPhone || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</p>
                        <p className="text-sm text-slate-300 mb-1"><span className="font-medium text-slate-500">City:</span> {viewedCollege.city || 'N/A'}</p>
                        <p className="text-sm text-slate-300"><span className="font-medium text-slate-500">State:</span> {viewedCollege.state || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 md:col-span-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Platform Details</p>
                        <p className="text-sm text-slate-300 leading-relaxed"><span className="font-medium text-slate-500">Registered Students:</span> {viewedCollege.countOfStudents || 0}</p>
                        <p className="text-sm text-slate-300 leading-relaxed mt-2"><span className="font-medium text-slate-500">Active Branches:</span> {viewedCollege.activeBranches?.join(', ') || 'None specified.'}</p>
                      </div>
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
