'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Users,
  Search,
  FileUp,
  Plus,
  Bell,
  TrendingUp,
  Filter,
  ChevronDown,
  MoreVertical,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  ShieldCheck,
  XCircle,
  FileText,
  Download,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { toast } from 'sonner';
import { apiClient } from '@/services/api/api.client';

export default function StudentDirectoryPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [studentsList, setStudentsList] = useState<type[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<type[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '', email: '', rollNumber: '', department: '' });

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingStudentId, setRejectingStudentId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Image Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Modal State for Confirmations
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response: type = await apiClient.get('/college/students');
      if (response.success) {
        setStudentsList(response.data.students);
        setTotalCount(response.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingVerifications = async () => {
    setIsLoading(true);
    try {
      const response: type = await apiClient.get('/college/students/pending?status=PENDING_VERIFICATION');
      if (response.success) {
        setPendingVerifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch verifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Verification') {
      fetchPendingVerifications();
    } else {
      fetchStudents();
    }
  }, [activeTab]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a valid CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      toast.info('Processing CSV file...');
      processBulkInvite(content);
    };
    reader.readAsText(file);

    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processBulkInvite = async (data: string) => {
    setIsProcessing(true);
    try {
      const lines = data.trim().split('\n');
      const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;

      let invalidDepartmentCount = 0;
      const students = lines.slice(startIndex).map(line => {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length < 5) return null;
        const [firstName, lastName, email, rollNumber, department] = parts;

        // Department Capitalization Validation
        if (department && department.charAt(0) !== department.charAt(0).toUpperCase()) {
          invalidDepartmentCount++;
          return null;
        }

        return { firstName, lastName, email, rollNumber, department };
      }).filter(Boolean);

      if (invalidDepartmentCount > 0) {
        toast.error(`${invalidDepartmentCount} students were skipped because their department name didn't start with a capital letter.`);
      }

      if (students.length === 0 && invalidDepartmentCount === 0) {
        toast.error('No valid student data found in CSV');
        return;
      }

      if (students.length === 0) return; // All were invalid department names or empty

      const response: type = await apiClient.post('/college/students/bulk-invite', { students });

      if (response.success) {
        const { invited, skipped } = response.data;
        if (invited > 0) {
          toast.success(`Successfully invited ${invited} students!`);
        }
        if (skipped > 0) {
          toast.warning(`${skipped} students were skipped (already exist).`);
        }
        if (invited === 0 && skipped === 0) {
          toast.error('No valid students to invite.');
        }
        fetchStudents();
      }
    } catch (err) {
      // toast is handled by apiClient interceptor
    } finally {
      setIsProcessing(false);
    }
  };

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
          await apiClient.patch(`/college/status-toggle/${id}`, { status: isBlocking ? 'BLOCKED' : 'ACTIVE' });
          toast.success(`Student ${isBlocking ? 'blocked' : 'unblocked'} successfully`);
          fetchStudents();
        } catch (err) {
          toast.error('Failed to update status');
        }
        setModalConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
      }
    });
  };

  const handleApprove = async (id: string) => {
    try {
      await apiClient.patch(`/college/students/${id}/approve`);
      toast.success('Student verified and activated');
      fetchPendingVerifications();
    } catch (err) { }
  };

  const handleReject = (id: string) => {
    setRejectingStudentId(id);
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
    try {
      await apiClient.patch(`/college/students/${rejectingStudentId}/reject`, { reason: rejectReason });
      toast.success('Request rejected');
      setIsRejectModalOpen(false);
      setRejectReason('');
      fetchPendingVerifications();
    } catch (err) { } finally {
      setIsProcessing(false);
    }
  };

  const handleAddSingleStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim and validate fields
    const firstName = newStudent.firstName.trim();
    const lastName = newStudent.lastName.trim();
    const email = newStudent.email.trim();
    const rollNumber = newStudent.rollNumber.trim();
    const department = newStudent.department;

    if (!firstName || !lastName || !email || !rollNumber || !department) {
      toast.error('All fields are required and cannot be empty or only spaces');
      return;
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Roll Number Validation (Alphanumeric and formatted)
    if (!/^[a-zA-Z0-9\-/]+$/.test(rollNumber)) {
      toast.error('Roll number must contain only letters, numbers, hyphens, or slashes');
      return;
    }

    // Existing Student Check (Local)
    const existsLocally = Array.isArray(studentsList) && studentsList.some(s => s?.email?.toLowerCase() === email.toLowerCase());
    if (existsLocally) {
      toast.error('A student with this email already exists in the list');
      return;
    }

    setIsProcessing(true);
    try {
      const studentToInvite = { firstName, lastName, email, rollNumber, department };
      const response: type = await apiClient.post('/college/students/bulk-invite', { students: [studentToInvite] });
      if (response.success) {
        const { invited, skipped, errors } = response.data;
        if (invited > 0) {
          toast.success('Student invited successfully!');
          setIsAddModalOpen(false);
          setNewStudent({ firstName: '', lastName: '', email: '', rollNumber: '', department: '' });
          fetchStudents();
        } else if (skipped > 0) {
          toast.warning('A student with this email already exists.');
        } else if (errors && errors.length > 0) {
          toast.error(errors[0]);
        } else {
          toast.error('Failed to invite student. Please try again.');
        }
      }
    } catch (err: type) {
      const errMsg = err?.error?.message || err?.message || 'An error occurred while adding student';
      toast.error(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8">

        {/* --- Header --- */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Students</h1>
            <p className="text-xs font-bold text-slate-400">IT & Tech branches only • Review credentials • Manage database</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group lg:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-sm"
              />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              isLoading={isProcessing}
              variant="outline"
              className="rounded-xl border-slate-100 h-10 px-4 text-xs font-black gap-2 shadow-sm"
            >
              <FileUp size={16} /> Bulk Upload
            </Button>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 h-10 px-4 text-xs font-black gap-2 shadow-sm border-none"
            >
              <Plus size={16} /> Add Student
            </Button>

            <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* --- Info Bar --- */}
        <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Lightbulb size={18} />
          </div>
          <p className="text-xs font-bold text-indigo-900 leading-relaxed pt-1.5">
            Approvals: When students register themselves or update details, they appear in the <span className="text-indigo-600">Verification</span> tab. Review their ID proofs before approving them for placement drives.
          </p>
        </div>

        {/* --- Table Section --- */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          {/* Table Header / Filters */}
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex bg-slate-50 p-1 rounded-xl gap-1 w-fit">
              {['All', 'Placed', 'Verification'].map(tab => {
                const label = tab;
                return (
                  <button
                    key={label}
                    onClick={() => setActiveTab(label)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === label ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {label} {label === 'Verification' && pendingVerifications.length > 0 && `(${pendingVerifications.length})`}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl border-slate-100 h-10 px-4 text-xs font-black gap-2 shadow-sm">
                All Branches <ChevronDown size={14} />
              </Button>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              {activeTab === 'Verification' ? (
                <>
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-10 py-4">Student</th>
                      <th className="px-6 py-4">ID Proof</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-10 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr><td colSpan={4} className="py-20 text-center"><div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" /></td></tr>
                    ) : pendingVerifications.length === 0 ? (
                      <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No pending verifications</td></tr>
                    ) : pendingVerifications.map(v => (
                      <tr key={v.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                              {v.firstName[0]}{v.lastName[0]}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 text-sm">{v.firstName} {v.lastName}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          {v.proofUrl ? (
                            <button
                              onClick={() => {
                                setSelectedProofUrl(v.proofUrl);
                                setSelectedStudentId(v.id);
                                setIsPreviewModalOpen(true);
                              }}
                              className="flex items-center gap-2 text-indigo-600 hover:underline font-bold text-xs"
                            >
                              <FileText size={14} /> View ID Proof
                            </button>
                          ) : <span className="text-slate-300 text-xs italic">Not uploaded</span>}
                        </td>
                        <td className="px-6 py-6 text-sm font-bold text-slate-600">{v.department}</td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleReject(v.id)} className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-all shadow-md shadow-rose-500/20" title="Reject Application"><XCircle size={18} /></button>
                            <button onClick={() => handleApprove(v.id)} className="h-9 px-4 bg-emerald-500 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-all text-[10px] font-black uppercase tracking-widest"><ShieldCheck size={14} /> Approve</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              ) : (
                <>
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-6 py-4 w-10">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-emerald-600 focus:ring-emerald-500" />
                      </th>
                      <th className="px-4 py-4 font-black">Student</th>
                      <th className="px-4 py-4 font-black">Email</th>
                      <th className="px-4 py-4 font-black">Branch</th>
                      {/* <th className="px-4 py-4 font-black">CGPA</th>
                        <th className="px-4 py-4 font-black">Skills</th> */}
                      <th className="px-4 py-4 font-black text-center">Status</th>
                      <th className="px-6 py-4 font-black text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr><td colSpan={7} className="py-20 text-center"><div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" /></td></tr>
                    ) : studentsList.length === 0 ? (
                      <tr><td colSpan={7} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No students found</td></tr>
                    ) : studentsList.map((p) => (
                      <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-emerald-600 focus:ring-emerald-500" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xs">
                              {p.firstName[0]}{p.lastName[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900">{p.firstName} {p.lastName}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.rollNumber || 'ID-PENDING'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-medium text-slate-600">{p.email}</span>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-slate-600">{p.department || 'N/A'}</td>
                        {/* <td className="px-4 py-4 text-xs font-black text-slate-900">{p.cgpa || '-'}</td>
                          <td className="px-4 py-4">
                             <div className="flex flex-wrap gap-1">
                                {p.skills?.slice(0, 2).map((s: string) => (
                                  <span key={s} className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100">{s}</span>
                                )) || <span className="text-[10px] text-slate-300 font-medium italic">No skills</span>}
                             </div>
                          </td> */}
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${p.status === 'BLOCKED' ? 'bg-rose-100 text-rose-600' :
                              p.status === 'PLACED' ? 'bg-emerald-100 text-emerald-600' :
                                p.status === 'IN_PROCESS' ? 'bg-indigo-100 text-indigo-600' :
                                  'bg-slate-100 text-slate-400'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'BLOCKED' ? 'bg-rose-500' : p.status === 'PLACED' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            {p.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusToggle(p.id, p.status)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${p.status === 'BLOCKED' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white'
                              }`}
                            title={p.status === 'BLOCKED' ? 'Unblock Student' : 'Block Student'}
                          >
                            {p.status === 'BLOCKED' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                          </button>
                          {(p.status === 'PENDING_VERIFICATION' || p.status === 'REJECTED') && p.proofUrl && (
                            <button
                              onClick={() => {
                                setSelectedProofUrl(p.proofUrl);
                                setSelectedStudentId(p.id);
                                setIsPreviewModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
                              title="View ID Proof"
                            >
                              <FileText size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {activeTab === 'Verification' ? pendingVerifications.length : studentsList.length} results</span>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50"><ChevronLeft size={16} /></button>
              <button className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">1</button>
              <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

      </div>

      {/* Add Single Student Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Add Student</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form noValidate onSubmit={handleAddSingleStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                    <input
                      value={newStudent.firstName}
                      onChange={e => setNewStudent({ ...newStudent, firstName: e.target.value })}
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                    <input
                      value={newStudent.lastName}
                      onChange={e => setNewStudent({ ...newStudent, lastName: e.target.value })}
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                    placeholder="student@college.edu"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Roll Number</label>
                    <input
                      value={newStudent.rollNumber}
                      onChange={e => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                      placeholder="CS-2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
                    <select
                      value={newStudent.department}
                      onChange={e => setNewStudent({ ...newStudent, department: e.target.value })}
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science and Engineering">B.Tech - CS & Engineering</option>
                      <option value="Information Technology">B.Tech - Information Technology</option>
                      <option value="Artificial Intelligence & Data Science">B.Tech - AI & Data Science</option>
                      <option value="MCA">MCA (Master of Computer Applications)</option>
                      <option value="M.Tech - Computer Science">M.Tech - Computer Science</option>
                      <option value="M.Tech - IT">M.Tech - IT</option>
                      <option value="M.Sc - Computer Science">M.Sc - Computer Science</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Software Engineering">Software Engineering</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    variant="outline"
                    className="flex-1 rounded-xl h-12 text-xs font-black border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isProcessing}
                    className="flex-1 rounded-xl h-12 text-xs font-black bg-emerald-600 hover:bg-emerald-700 border-none text-white shadow-xl shadow-emerald-500/20"
                  >
                    Send Invite
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ID Proof Preview Modal */}
      <AnimatePresence>
        {isPreviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity Verification</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Review student credentials</p>
                </div>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:rotate-90"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-8 bg-slate-100/50 flex items-center justify-center">
                {selectedProofUrl?.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={selectedProofUrl} className="w-full h-[600px] rounded-2xl border border-slate-200 shadow-inner" title="ID Proof PDF" />
                ) : (
                  <img src={selectedProofUrl || ''} alt="Student ID Proof" className="max-w-full h-auto rounded-2xl shadow-2xl border-4 border-white" />
                )}
              </div>

              <div className="p-8 bg-white border-t border-slate-50 flex gap-4">
                <Button
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    handleReject(selectedStudentId!);
                  }}
                  className="flex-1 rounded-2xl h-16 text-xs font-black bg-rose-600 text-white hover:bg-rose-700 border-none shadow-xl shadow-rose-500/20 transition-all gap-2"
                >
                  <XCircle size={18} /> Reject Application
                </Button>
                <Button
                  onClick={() => {
                    handleApprove(selectedStudentId!);
                    setIsPreviewModalOpen(false);
                  }}
                  isLoading={isProcessing}
                  className="flex-[2] rounded-2xl h-16 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-xl shadow-emerald-500/20 transition-all gap-2"
                >
                  <ShieldCheck size={18} /> Approve Student
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Reason for Rejection</h3>
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Rejection Reason</label>
                  <textarea
                    rows={4}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none resize-none"
                    placeholder="e.g. ID card expired, blur image, incorrect roll number..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    onClick={() => setIsRejectModalOpen(false)}
                    variant="outline"
                    className="flex-1 rounded-xl h-12 text-xs font-black border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmReject}
                    isLoading={isProcessing}
                    className="flex-1 rounded-xl h-12 text-xs font-black bg-rose-600 hover:bg-rose-700 border-none text-white shadow-xl shadow-rose-500/20"
                  >
                    Reject Student
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
    </DashboardLayout>
  );
}
