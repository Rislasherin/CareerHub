'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/shared/Button';
import { 
  Building2, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminService } from '@/services/super-admin/super-admin.service';
import { toast } from 'sonner';

import { ConfirmModal } from '@/components/shared/ConfirmModal';

export default function CompaniesManagement() {
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
      const res = await superAdminService.getCompanies(search, page, 10);
      setData(res.companies || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error('Failed to fetch companies');
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
      title: isBlocking ? 'Block Company' : 'Unblock Company',
      message: `Are you sure you want to ${isBlocking ? 'block' : 'unblock'} this company? ${isBlocking ? 'They will no longer be able to post jobs or hire.' : 'They will regain hiring privileges.'}`,
      confirmText: isBlocking ? 'Block Company' : 'Unblock Company',
      isLoading: false,
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isLoading: true }));
        try {
          await superAdminService.updateStatus('hr', id, isBlocking ? 'BLOCKED' : 'ACTIVE');
          toast.success(`Company ${isBlocking ? 'blocked' : 'unblocked'} successfully`);
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
      title: 'Remove Company',
      message: 'Are you sure you want to remove this company? This will deactivate their hiring access and associated jobs. This action can be reversed by system administrators if needed.',
      confirmText: 'Remove Company',
      isLoading: false,
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isLoading: true }));
        try {
          await superAdminService.deleteUser('hr', id);
          toast.success('Company deleted successfully');
          fetchData();
        } catch (err) {
          toast.error('Failed to delete company');
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
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">Company Management</h1>
            <p className="text-slate-500 text-sm font-medium">Oversee and manage registered hiring partners</p>
          </div>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-[#0B0D17] font-black text-xs rounded-xl px-6 h-10 border-none shadow-lg shadow-cyan-500/20">
            <Plus size={16} className="mr-2" /> Add Company
          </Button>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, industry or email..."
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
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Company</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Industry</th>
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
                          <span className="text-slate-500 font-bold text-sm">Loading companies...</span>
                        </div>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <Building2 size={48} className="text-slate-600" />
                          <span className="text-slate-500 font-bold text-sm">No companies found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((company, i) => (
                      <motion.tr 
                        key={company.id}
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
                              <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{company.name}</span>
                              <span className="text-xs text-slate-500">{company.location || company.headquarters || 'Remote'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-300">{company.contactEmail || company.email || 'No email'}</span>
                            <span className="text-xs text-slate-500">{company.website || 'No website'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-300">
                          {company.industry || company.sector || 'Not specified'}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            company.status === 'blocked' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${company.status === 'blocked' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            {company.status || 'active'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleStatusToggle(company.id, company.status)}
                              className={`p-2 rounded-lg bg-white/5 transition-all ${
                                company.status === 'blocked' ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-amber-400 hover:bg-amber-400/10'
                              }`}
                              title={company.status === 'blocked' ? 'Unblock' : 'Block'}
                            >
                              {company.status === 'blocked' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                            </button>
                            <button 
                              onClick={() => handleDelete(company.id)}
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
              Showing <span className="text-white">{(page - 1) * 10 + 1}</span> to <span className="text-white">{Math.min(page * 10, total)}</span> of <span className="text-white">{total}</span> companies
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
