'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import {
  getPendingJobs,
  approveJob,
  rejectJob
} from '@/services/college/job.approval.service';
import { Job } from '@/services/hr/job.service';
import Swal from 'sweetalert2';

export default function CollegeJobsApprovalPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  const fetchJobsList = async (tab: 'pending' | 'approved') => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = tab === 'pending' ? 'pending_review' : 'approved';
      const data = await getPendingJobs(statusParam);
      setJobs(data);
    } catch (err: type) {
      setError(err?.message || 'Failed to fetch job vacancies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsList(activeTab);
  }, [activeTab]);

  const handleApprove = async (jobId: string) => {
    const result = await Swal.fire({
      title: 'Approve Vacancy?',
      text: 'Are you sure you want to approve this job vacancy? Students will be able to discover and apply immediately.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
        title: 'text-2xl font-black text-slate-900 mb-2',
        confirmButton: 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl mr-2',
        cancelButton: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/50 shadow-sm font-bold px-6 py-3 rounded-2xl'
      },
      buttonsStyling: false
    });

    if (!result.isConfirmed) return;

    try {
      await approveJob(jobId);
      await Swal.fire({
        title: 'Approved!',
        text: 'Job vacancy has been approved and published successfully!',
        icon: 'success',
        confirmButtonText: 'Awesome',
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
          title: 'text-2xl font-black text-slate-900 mb-2',
          confirmButton: 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl'
        },
        buttonsStyling: false
      });
      setShowDetails(false);
      fetchJobsList(activeTab);
    } catch (err: type) {
      Swal.fire({
        title: 'Error',
        text: err?.message || 'Failed to approve job vacancy',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
          title: 'text-2xl font-black text-slate-900 mb-2',
          confirmButton: 'bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl shadow-xl'
        },
        buttonsStyling: false
      });
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedJob) return;
    if (!rejectionReason.trim()) {
      Swal.fire({
        title: 'Required Field',
        text: 'Please type a rejection reason',
        icon: 'warning',
        confirmButtonText: 'Ok',
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
          title: 'text-2xl font-black text-slate-900 mb-2',
          confirmButton: 'bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl shadow-xl'
        },
        buttonsStyling: false
      });
      return;
    }

    setSubmittingReject(true);
    try {
      await rejectJob(selectedJob.id, rejectionReason.trim());
      await Swal.fire({
        title: 'Rejected',
        text: 'Job vacancy request has been rejected and sent back to HR.',
        icon: 'info',
        confirmButtonText: 'Okay',
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
          title: 'text-2xl font-black text-slate-900 mb-2',
          confirmButton: 'bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl'
        },
        buttonsStyling: false
      });
      setShowRejectModal(false);
      setShowDetails(false);
      setRejectionReason('');
      fetchJobsList(activeTab);
    } catch (err: type) {
      Swal.fire({
        title: 'Error',
        text: err?.message || 'Failed to reject vacancy',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white font-sans p-8',
          title: 'text-2xl font-black text-slate-900 mb-2',
          confirmButton: 'bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl shadow-xl'
        },
        buttonsStyling: false
      });
    } finally {
      setSubmittingReject(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Job Vacancy Approvals</h1>
            <p className="text-slate-500 font-medium">Review and manage job vacancy placement requests from registered companies.</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner self-start md:self-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all uppercase tracking-wider ${activeTab === 'pending'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Pending Reviews
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all uppercase tracking-wider ${activeTab === 'approved'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Approved Vacancies
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
          </div>
        ) : error ? (
          <GlassCard className="p-8 text-center text-rose-500 rounded-3xl border-rose-100">
            {error}
          </GlassCard>
        ) : jobs.length === 0 ? (
          <GlassCard className="p-20 text-center rounded-[2.5rem] border-slate-100/50 bg-white">
            <p className="text-slate-400 font-bold text-lg mb-2">
              {activeTab === 'pending' ? 'No pending reviews' : 'No approved vacancies'}
            </p>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              {activeTab === 'pending'
                ? 'There are no job vacancies waiting to be approved right now.'
                : 'You have not approved type job vacancies yet.'}
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <GlassCard
                key={job.id}
                className="p-6 rounded-[2rem] border-slate-100 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    {job.status === 'approved' || job.status === 'active' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-100">
                        Approved
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-100">
                        Pending Review
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{job.type.replace('_', ' ')}</span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug mb-2">
                    {job.title}
                  </h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Posted for campus drive</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Salary / CTC</span>
                      <span className="text-slate-800 font-bold">
                        ₹{(job.minSalary / 100000).toFixed(1)}L - ₹{(job.maxSalary / 100000).toFixed(1)}L {job.salaryType === 'per_month' ? '/mo' : '/yr'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Eligible Degree</span>
                      <span className="text-slate-800 font-bold">{job.eligibility?.degreeType ?? 'B.Tech'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Min CGPA</span>
                      <span className="text-slate-800 font-bold">{job.eligibility?.minCGPA ?? '6.0'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 w-full">
                  <Button
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all border-none"
                    onClick={() => {
                      setSelectedJob(job);
                      setShowDetails(true);
                    }}
                  >
                    {activeTab === 'pending' ? 'Review Drive' : 'View Details'}
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* View Review Overlay */}
        {showDetails && selectedJob && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
            <GlassCard className="w-full max-w-3xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative bg-white max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full bg-slate-50"
              >
                ✕
              </button>

              <div className="mb-6">
                {selectedJob.status === 'approved' || selectedJob.status === 'active' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-100 inline-block mb-3">
                    Active & Approved Vacancy
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-100 inline-block mb-3">
                    Pending Placement Review
                  </span>
                )}
                <h2 className="text-3xl font-black text-slate-900 leading-snug tracking-tight mb-1">{selectedJob.title}</h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">{selectedJob.category}</p>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border border-slate-100 p-6 rounded-[2rem] text-sm mb-8">
                <div>
                  <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Salary Drive</span>
                  <span className="font-extrabold text-slate-800">
                    ₹{(selectedJob.minSalary / 100000).toFixed(1)}L - ₹{(selectedJob.maxSalary / 100000).toFixed(1)}L
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Required CGPA</span>
                  <span className="font-extrabold text-slate-800">{selectedJob.eligibility?.minCGPA ?? '6.0'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Work Mode</span>
                  <span className="font-extrabold text-slate-800 capitalize">{selectedJob.workMode}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Rounds</span>
                  <span className="font-extrabold text-slate-800">{selectedJob.rounds.length} stages</span>
                </div>
              </div>

              {/* Body details */}
              <div className="space-y-6 text-sm text-slate-700 leading-relaxed mb-10">
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Job Description</span>
                  <p className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">{selectedJob.description}</p>
                </div>

                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Eligible Branches</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.eligibility?.eligibleBranches.map((branch) => (
                      <span key={branch} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                        {branch}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Required Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.requiredSkills.map((skill) => (
                      <span key={skill} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Interview Configured Stages</span>
                  <div className="space-y-2">
                    {selectedJob.rounds.map((round) => (
                      <div key={round.roundNumber} className="bg-slate-50 p-4 rounded-xl border border-slate-100/50 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800 mr-2">Stage {round.roundNumber}: {round.name}</span>
                          <span className="text-slate-400 font-bold uppercase">({round.type})</span>
                          <p className="text-slate-500 mt-1">{round.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t border-slate-100">
                {(selectedJob.status !== 'approved' && selectedJob.status !== 'active') ? (
                  <>
                    <Button
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-6 py-3 rounded-2xl border-none"
                      onClick={() => setShowRejectModal(true)}
                    >
                      Reject drive
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="font-bold px-6 py-3 rounded-2xl"
                        onClick={() => setShowDetails(false)}
                      >
                        Close
                      </Button>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-2xl shadow-xl border-none"
                        onClick={() => handleApprove(selectedJob.id)}
                      >
                        Approve & Publish
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="w-full flex justify-end">
                    <Button
                      variant="secondary"
                      className="font-bold px-6 py-3 rounded-2xl"
                      onClick={() => setShowDetails(false)}
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Reject Dialog overlay */}
        {showRejectModal && (
          <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
            <GlassCard className="w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative bg-white">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Reject Placement Request</h3>
              <p className="text-slate-500 font-medium text-sm mb-6">Type a rejection note so the HR team can update the requirements accordingly.</p>

              <div className="flex flex-col gap-2 mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rejection Note *</label>
                <textarea
                  rows={4}
                  placeholder="e.g. Please lower the minimum CGPA requirement from 9.0 to 7.0 for branches eligible."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-inner w-full"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  className="font-bold px-6 py-2 rounded-xl text-sm"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-2 rounded-xl text-sm shadow-md"
                  onClick={handleRejectSubmit}
                  disabled={submittingReject}
                >
                  {submittingReject ? 'Submitting...' : 'Reject Drive'}
                </Button>
              </div>
            </GlassCard>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
