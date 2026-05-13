'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/shared/Button';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminService } from '@/services/super-admin/super-admin.service';
import { toast } from 'sonner';

import { ConfirmModal } from '@/components/shared/ConfirmModal';

export default function StudentsManagement() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
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
    onConfirm: () => {},
    isLoading: false
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getStudents(search, page, 10);
      setData(res.students || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error('Failed to fetch students');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const isBlocking = currentStatus?.toUpperCase() !== 'BLOCKED';
    setModalConfig({
      isOpen: true,
      type: isBlocking ? 'warning' : 'info',
      title: isBlocking ? 'Block Student' : 'Unblock Student',
      message: `Are you sure you want to ${isBlocking ? 'block' : 'unblock'} this student? ${isBlocking ? 'They will not be able to log in or apply for jobs.' : 'They will regain platform access.'}`,
      confirmText: isBlocking ? 'Block Student' : 'Unblock Student',
      isLoading: false,
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isLoading: true }));
        try {
          await superAdminService.updateStatus('student', id, isBlocking ? 'BLOCKED' : 'ACTIVE');
          toast.success(`Student ${isBlocking ? 'blocked' : 'unblocked'} successfully`);
          fetchData();
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
      title: 'Remove Student',
      message: 'Are you sure you want to remove this student account? Their profile and applications will be deactivated. This action can be reversed by system administrators if needed.',
      confirmText: 'Remove Student',
      isLoading: false,
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isLoading: true }));
        try {
          await superAdminService.deleteUser('student', id);
          toast.success('Student deleted successfully');
          fetchData();
        } catch (err) {
          toast.error('Failed to delete student');
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
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">Student Management</h1>
            <p className="text-slate-500 text-sm font-medium">Manage and oversee registered student accounts across all colleges</p>
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
              placeholder="Search by name, USN, email or college..."
              className="w-full bg-[#121520] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#121520] border border-white/5 text-sm font-bold text-slate-400 hover:text-white transition-all">
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Table Content */}
        <div className="bg-[#121520] border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">College</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Branch</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                          <span className="text-slate-500 font-bold text-sm">Loading students...</span>
                        </div>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <Users size={48} className="text-slate-600" />
                          <span className="text-slate-500 font-bold text-sm">No students found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((student, i) => (
                      <motion.tr 
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5 group-hover:border-cyan-500/20 transition-all overflow-hidden">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}`} alt="avatar" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{student.firstName} {student.lastName}</span>
                              <span className="text-xs text-slate-500">{student.usn || student.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm font-medium text-slate-300">{student.collegeName || 'N/A'}</span>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-300">
                          {student.branch || 'Not specified'}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            student.status === 'blocked' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${student.status === 'blocked' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            {student.status || 'active'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleStatusToggle(student.id, student.status)}
                              className={`p-2 rounded-lg bg-white/5 transition-all ${
                                student.status === 'blocked' ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-amber-400 hover:bg-amber-400/10'
                              }`}
                              title={student.status === 'blocked' ? 'Unblock' : 'Block'}
                            >
                              {student.status === 'blocked' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                            </button>
                            <button 
                              onClick={() => handleDelete(student.id)}
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

          {/* Pagination */}
          <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Showing <span className="text-white">{(page - 1) * 10 + 1}</span> to <span className="text-white">{Math.min(page * 10, total)}</span> of <span className="text-white">{total}</span> students
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
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                      page === i + 1 ? 'bg-cyan-500 text-[#0B0D17]' : 'bg-white/5 text-slate-400 hover:text-white'
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
