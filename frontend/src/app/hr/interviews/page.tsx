'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, FileText, Bell, Search, Plus, Filter, UserCircle, BellRing, RefreshCw } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import Link from 'next/link';
import { apiClient } from '@/services/api/api.client';
import { API_ROUTES } from '@/constants/api.routes';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { AIInterviewEvaluationModal } from './components/AIInterviewEvaluationModal';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReschedule, setSelectedReschedule] = useState<any | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [selectedAIEvaluationInterview, setSelectedAIEvaluationInterview] = useState<any | null>(null);
  const [selectedReassign, setSelectedReassign] = useState<any | null>(null);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TODAY' | 'FEEDBACK' | 'COMPLETED' | 'RESCHEDULES'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const router = useRouter();

  const fetchInterviews = async () => {
    try {
      const res: any = await apiClient.get(API_ROUTES.HR.INTERVIEWS);
      setInterviews(res.data || []);
    } catch (error) {
      console.error("Failed to fetch interviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-green-50 text-green-700 font-bold text-xs rounded-lg flex items-center gap-1"><CheckCircle2 size={12}/> Completed</span>;
      case 'RESCHEDULE_REQUESTED':
        return <span className="px-3 py-1 bg-orange-50 text-orange-700 font-bold text-xs rounded-lg flex items-center gap-1"><Clock size={12}/> Action Needed</span>;
      case 'CANCELLATION_REQUESTED':
        return <span className="px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-lg flex items-center gap-1"><AlertTriangle size={12}/> Pending Cancel</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-50 text-red-700 font-bold text-xs rounded-lg flex items-center gap-1"><XCircle size={12}/> Cancelled</span>;
      case 'SCHEDULED':
      default:
        return <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg flex items-center gap-1"><Calendar size={12}/> Upcoming</span>;
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'UN';
  };

  const handleResolve = async (id: string, approve: boolean, newDate?: Date, newTime?: string) => {
    try {
      await apiClient.post(`${API_ROUTES.HR.INTERVIEWS}/${id}/resolve-reschedule`, {
        approve,
        newDate,
        newTime
      });
      setSelectedReschedule(null);
      fetchInterviews(); // Refresh the list
    } catch (error) {
      console.error("Failed to resolve reschedule request", error);
      toast.error("Failed to resolve the request.");
    }
  };

  const handleApproveCancel = async (id: string) => {
    if (confirm("Are you sure you want to approve this cancellation? The student will be notified.")) {
      try {
        await apiClient.post(`${API_ROUTES.HR.INTERVIEWS}/${id}/approve-cancellation`);
        toast.success("Cancellation approved");
        fetchInterviews();
      } catch (error) {
        console.error("Failed to approve cancellation", error);
        toast.error("Failed to approve cancellation");
      }
    }
  };

  const handleReassignSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newInterviewerId = formData.get('interviewerId') as string;
    
    if (!newInterviewerId) {
      toast.error("Please select a new interviewer");
      return;
    }

    try {
      await apiClient.post(`${API_ROUTES.HR.INTERVIEWS}/${selectedReassign.id}/reassign`, {
        newInterviewerId
      });
      toast.success("Interview reassigned successfully");
      setSelectedReassign(null);
      fetchInterviews();
    } catch (error) {
      console.error("Failed to reassign interview", error);
      toast.error("Failed to reassign interview");
    }
  };

  const colors = ["bg-orange-500", "bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-pink-500"];

  const filteredAndSortedInterviews = (interviews || [])
    .filter((interview: any) => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'RESCHEDULES') return interview.status === 'RESCHEDULE_REQUESTED';
      if (activeFilter === 'COMPLETED') return interview.status === 'COMPLETED';
      if (activeFilter === 'TODAY') {
        const today = new Date().toDateString();
        return new Date(interview.scheduledAt).toDateString() === today;
      }
      if (activeFilter === 'FEEDBACK') {
        return false;
      }
      return true;
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.scheduledAt).getTime();
      const dateB = new Date(b.scheduledAt).getTime();
      const now = new Date().getTime();

      const isUpcomingA = dateA >= now && a.status === 'SCHEDULED';
      const isUpcomingB = dateB >= now && b.status === 'SCHEDULED';
      
      const isPendingActionA = a.status === 'RESCHEDULE_REQUESTED' || a.status === 'CANCELLATION_REQUESTED';
      const isPendingActionB = b.status === 'RESCHEDULE_REQUESTED' || b.status === 'CANCELLATION_REQUESTED';

      if (isPendingActionA && !isPendingActionB) return -1;
      if (!isPendingActionA && isPendingActionB) return 1;

      if (isUpcomingA && !isUpcomingB) return -1;
      if (!isUpcomingA && isUpcomingB) return 1;

      if (isUpcomingA && isUpcomingB) {
         return dateA - dateB;
      }

      return dateB - dateA;
    });

  const totalPages = Math.ceil(filteredAndSortedInterviews.length / itemsPerPage);
  const paginatedInterviews = filteredAndSortedInterviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-[1400px] mx-auto space-y-6">
        
        {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Interviews</h1>
          <p className="text-slate-500 font-medium mt-1">Manage all scheduled rounds · Current Season</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-[#1b1430] hover:bg-[#2d244a] text-white font-bold px-6 flex items-center gap-2 border-transparent">
            <Calendar size={18} /> Schedule Interview
          </Button>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-[#F8FAFC] border border-blue-100 rounded-xl p-4 flex items-center gap-3">
        <FileText className="text-orange-400" size={20} />
        <p className="text-sm font-bold text-slate-700">
          <span className="text-blue-600">Today's Agenda:</span> Check upcoming rounds and pending feedback. Ensure all interviewers are reminded.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button 
          onClick={() => { setActiveFilter('ALL'); setCurrentPage(1); }}
          className={`px-4 py-1.5 rounded-full font-bold text-sm border transition-colors ${activeFilter === 'ALL' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          All ({(interviews || []).length})
        </button>
        <button 
          onClick={() => { setActiveFilter('RESCHEDULES'); setCurrentPage(1); }}
          className={`px-4 py-1.5 rounded-full font-bold text-sm border transition-colors flex items-center gap-2 ${activeFilter === 'RESCHEDULES' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          <Clock size={14} /> Reschedule Requests ({(interviews || []).filter((i: any) => i.status === 'RESCHEDULE_REQUESTED').length})
        </button>
        <button 
          onClick={() => { setActiveFilter('TODAY'); setCurrentPage(1); }}
          className={`px-4 py-1.5 rounded-full font-bold text-sm border transition-colors flex items-center gap-2 ${activeFilter === 'TODAY' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          <Calendar size={14} /> Today
        </button>
        <button 
          onClick={() => { setActiveFilter('FEEDBACK'); setCurrentPage(1); }}
          className={`px-4 py-1.5 rounded-full font-bold text-sm border transition-colors flex items-center gap-2 ${activeFilter === 'FEEDBACK' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          <Bell size={14} /> Feedback Due
        </button>
        <button 
          onClick={() => { setActiveFilter('COMPLETED'); setCurrentPage(1); }}
          className={`px-4 py-1.5 rounded-full font-bold text-sm border transition-colors flex items-center gap-2 ${activeFilter === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          <CheckCircle2 size={14} /> Completed
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Round</th>
                <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Interviewer</th>
                <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">Loading interviews...</td>
                </tr>
              ) : paginatedInterviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 font-bold">No interviews found for this filter.</td>
                </tr>
              ) : (
                paginatedInterviews.map((interview, index) => {
                  const isRescheduleReq = interview.status === 'RESCHEDULE_REQUESTED';
                  return (
                    <tr key={interview.id} className={`hover:bg-slate-50 transition-colors ${isRescheduleReq ? 'bg-[#FFFBF5]' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl text-white font-black flex items-center justify-center text-sm ${colors[index % colors.length]}`}>
                            {getInitials(interview.candidate.name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{interview.candidate.name}</p>
                            <p className="text-xs font-medium text-slate-500">{interview.candidate.college}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{interview.title}</p>
                        <p className="text-xs font-medium text-slate-500">{interview.type.replace('_', ' ')}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{interview.interviewer.name}</p>
                        <p className="text-xs font-medium text-slate-500">{interview.interviewer.role}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {new Date(interview.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                        {interview.durationMinutes && (
                          <p className="text-xs font-bold text-indigo-600 mt-1">Duration: {interview.durationMinutes} minutes</p>
                        )}
                        {isRescheduleReq && (
                          <p className="text-xs font-bold text-orange-600 mt-1">Requested {new Date(interview.rescheduleRequest?.preferredDate).toLocaleDateString()} at {interview.rescheduleRequest?.preferredTime}</p>
                        )}
                        {interview.status === 'CANCELLED' && interview.cancellationReason && (
                          <p className="text-xs font-bold text-red-600 mt-1">Reason: {interview.cancellationReason}</p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(interview.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {isRescheduleReq ? (
                            <button onClick={() => setSelectedReschedule(interview)} className="px-3 py-1.5 border border-orange-200 text-orange-600 hover:bg-orange-50 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm bg-white">
                              <RefreshCw size={12} /> Review
                            </button>
                          ) : interview.status === 'CANCELLATION_REQUESTED' ? (
                            <div className="flex gap-2">
                              <button onClick={() => handleApproveCancel(interview.id)} className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm bg-white">
                                <AlertTriangle size={12} /> Approve Cancel
                              </button>
                              <button onClick={() => setSelectedReassign(interview)} className="px-3 py-1.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm bg-white">
                                <UserCircle size={12} /> Reassign
                              </button>
                            </div>
                          ) : interview.status === 'CANCELLED' ? (
                            <button onClick={() => setSelectedReassign(interview)} className="px-3 py-1.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm bg-white">
                              <UserCircle size={12} /> Reassign
                            </button>
                          ) : interview.status === 'COMPLETED' ? (
                            <button 
                              onClick={() => {
                                const isAI = interview.interviewer?.name?.toLowerCase().includes('ai') || 
                                             interview.interviewer?.role?.toLowerCase().includes('ai') || 
                                             interview.type === 'AI' ||
                                             !interview.feedback; // Default completed AI interviews to AI evaluation modal
                                if (isAI) {
                                  setSelectedAIEvaluationInterview(interview);
                                } else {
                                  setSelectedFeedback(interview);
                                }
                              }} 
                              className="px-3 py-1.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm bg-white cursor-pointer"
                            >
                              <FileText size={12} /> View Feedback
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Reschedule Modal */}
      {selectedReschedule && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedReschedule(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <Clock size={32} />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2">Review Reschedule Request</h2>
            <p className="text-slate-500 font-medium mb-6">
              {selectedReschedule.interviewer.name} has requested a new time for {selectedReschedule.candidate.name}'s interview.
            </p>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 mb-8">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-1">Requested Date</p>
                  <p className="font-bold text-slate-900">{new Date(selectedReschedule.rescheduleRequest?.preferredDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-1">Requested Time</p>
                  <p className="font-bold text-slate-900">{selectedReschedule.rescheduleRequest?.preferredTime}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-1">Reason: {selectedReschedule.rescheduleRequest?.reason}</p>
                <p className="text-sm font-medium text-slate-700 italic">"{selectedReschedule.rescheduleRequest?.noteToHr || 'No additional note provided.'}"</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => handleResolve(selectedReschedule.id, false)}
                className="flex-1 py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Reject
              </button>
              <button 
                onClick={() => {
                  const newDate = new Date(selectedReschedule.rescheduleRequest.preferredDate);
                  const [hours, minutes] = selectedReschedule.rescheduleRequest.preferredTime.split(':');
                  newDate.setHours(parseInt(hours), parseInt(minutes), 0);
                  handleResolve(selectedReschedule.id, true, newDate);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors"
              >
                Approve & Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedFeedback(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <FileText size={32} />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2">Interview Feedback</h2>
            <p className="text-slate-500 font-medium mb-6">
              Feedback from {selectedFeedback.interviewer.name} for {selectedFeedback.candidate.name}'s interview.
            </p>

            {selectedFeedback.feedback ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">DSA</p>
                    <p className="font-bold text-slate-900 text-xl">{selectedFeedback.feedback.dsaScore || '-'}/10</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Coding</p>
                    <p className="font-bold text-slate-900 text-xl">{selectedFeedback.feedback.codingScore || '-'}/10</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Design</p>
                    <p className="font-bold text-slate-900 text-xl">{selectedFeedback.feedback.systemDesignScore || '-'}/10</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Problem Solving</p>
                    <p className="font-bold text-slate-900 text-xl">{selectedFeedback.feedback.problemSolvingScore || '-'}/10</p>
                  </div>
                </div>
                
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Strengths</h4>
                    <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{selectedFeedback.feedback.strengths || 'Not provided'}</p>
                  </div>
                  <div className="h-px bg-blue-100 w-full" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Weaknesses</h4>
                    <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{selectedFeedback.feedback.weaknesses || 'Not provided'}</p>
                  </div>
                  <div className="h-px bg-blue-100 w-full" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Overall Remarks</h4>
                    <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{selectedFeedback.feedback.hrNotes || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl border font-bold flex justify-between items-center ${
                  selectedFeedback.feedback.recommendedAction === 'HIRE' || selectedFeedback.feedback.recommendedAction === 'STRONG_HIRE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  selectedFeedback.feedback.recommendedAction === 'REJECT' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <span className="uppercase text-xs tracking-wider">Recommended Action:</span>
                  <span className="text-lg">{selectedFeedback.feedback.recommendedAction?.replace('_', ' ') || 'NONE'}</span>
                </div>
                
                {selectedFeedback.jobId && (
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <Button 
                        onClick={() => router.push(`/hr/jobs/${selectedFeedback.jobId}/applicants?applicant=${selectedFeedback.candidate.applicationId}`)}
                        className="bg-[#1b1430] hover:bg-[#2d244a] text-white font-bold border-transparent"
                      >
                        Go to Applicant Pipeline
                      </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-500 font-bold mb-2">No feedback submitted yet.</p>
                <p className="text-xs text-slate-400">The interviewer has not provided any feedback.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Interview Evaluation & Evidence Modal */}
      {selectedAIEvaluationInterview && (
        <AIInterviewEvaluationModal
          interviewId={selectedAIEvaluationInterview.id}
          candidateName={selectedAIEvaluationInterview.candidate?.name || 'Candidate'}
          jobTitle={selectedAIEvaluationInterview.title || 'Technical Role'}
          onClose={() => setSelectedAIEvaluationInterview(null)}
          onDecisionRecorded={() => {
            fetchInterviews();
          }}
        />
      )}

      {/* Reassign Modal */}
      {selectedReassign && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedReassign(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <UserCircle size={32} />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2">Reassign Interview</h2>
            <p className="text-slate-500 font-medium mb-6">
              Assign a new interviewer for {selectedReassign.candidate.name}'s interview.
            </p>

            <form onSubmit={handleReassignSubmit}>
              <div className="mb-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select New Interviewer <span className="text-red-500">*</span></label>
                <select 
                  name="interviewerId"
                  defaultValue=""
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                >
                  <option value="" disabled>Select an interviewer...</option>
                  {interviewers.map(inv => (
                    <option key={inv.id} value={inv.id} disabled={inv.id === selectedReassign.interviewerId}>
                      {inv.firstName || (inv.user?.firstName)} {inv.lastName || (inv.user?.lastName)} ({inv.designation || inv.department}) {inv.id === selectedReassign.interviewerId ? '- Current' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setSelectedReassign(null)}
                  className="flex-1 py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[#1b1430] hover:bg-[#2d244a] text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </DashboardLayout>
  );
}

// Add these lucide icons missing from the import at the top
import { CheckCircle2, XCircle, X, AlertTriangle } from 'lucide-react';
import { Pagination } from '@/components/shared/Pagination';
