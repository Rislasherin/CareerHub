'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Video, 
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  XCircle,
  FileBadge,
  Eye,
  Clock,
  Download,
  User
} from 'lucide-react';
import { apiClient } from '@/services/api/api.client';
import { API_ROUTES } from '@/constants/api.routes';
import { CandidateBriefModal } from '../CandidateBriefModal';
import { RescheduleModal } from '../RescheduleModal';
import { CancelModal } from '../CancelModal';
import { Pagination } from '@/components/shared/Pagination';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface InterviewCandidate {
  name: string;
  college?: string;
  resumeUrl?: string;
}

interface RescheduleRequest {
  preferredDate?: string;
  preferredTime?: string;
}

interface InterviewData {
  id: string;
  status: string;
  scheduledAt: string;
  durationMinutes?: number;
  feedback?: Record<string, unknown>;
  candidate: InterviewCandidate;
  rescheduleRequest?: RescheduleRequest;
  cancellationReason?: string;
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  isPrimary?: boolean;
}

export default function MyInterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedBrief, setSelectedBrief] = useState<InterviewData | null>(null);
  const [selectedReschedule, setSelectedReschedule] = useState<InterviewData | null>(null);
  const [selectedCancel, setSelectedCancel] = useState<InterviewData | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await apiClient.get(API_ROUTES.INTERVIEWER.DASHBOARD) as { data: InterviewData[] };
        setInterviews(response.data);
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const todayCount = interviews.filter(i => new Date(i.scheduledAt).toDateString() === new Date().toDateString()).length;
  const upcomingCount = interviews.filter(i => i.status === 'SCHEDULED' && new Date(i.scheduledAt) > new Date()).length;
  const pendingCount = interviews.filter(i => i.status === 'SCHEDULED' && new Date(i.scheduledAt) <= new Date()).length;
  const completedCount = interviews.filter(i => i.status === 'COMPLETED').length;

  const getFilteredInterviews = () => {
    switch (activeTab) {
      case 'Today': return interviews.filter(i => new Date(i.scheduledAt).toDateString() === new Date().toDateString());
      case 'Upcoming': return interviews.filter(i => i.status === 'SCHEDULED' && new Date(i.scheduledAt) > new Date());
      case 'Pending Feedback': return interviews.filter(i => i.status === 'SCHEDULED' && new Date(i.scheduledAt) <= new Date());
      case 'Completed': return interviews.filter(i => i.status === 'COMPLETED');
      default: return interviews;
    }
  };

  const filteredInterviews = getFilteredInterviews().sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const paginatedInterviews = filteredInterviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Interviews</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">TechCorp India • Feb 2026 • Showing {filteredInterviews.length} interviews</p>
        </header>

        {/* Filter Tabs matching the Figma design */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <TabButton active={activeTab === 'All'} onClick={() => { setActiveTab('All'); setCurrentPage(1); }} label={`All (${interviews.length})`} isPrimary />
          <TabButton active={activeTab === 'Today'} onClick={() => { setActiveTab('Today'); setCurrentPage(1); }} label={`Today (${todayCount})`} icon={<div className="w-2 h-2 rounded-full bg-red-500"></div>} />
          <TabButton active={activeTab === 'Upcoming'} onClick={() => { setActiveTab('Upcoming'); setCurrentPage(1); }} label={`Upcoming (${upcomingCount})`} icon={<CalendarIcon />} />
          <TabButton active={activeTab === 'Pending Feedback'} onClick={() => { setActiveTab('Pending Feedback'); setCurrentPage(1); }} label={`Pending Feedback (${pendingCount})`} icon={<AlertTriangle size={14} className="text-amber-500" />} />
          <TabButton active={activeTab === 'Completed'} onClick={() => { setActiveTab('Completed'); setCurrentPage(1); }} label={`Completed (${completedCount})`} icon={<CheckCircle2 size={14} className="text-emerald-500" />} />
        </div>

        {/* Interview Cards */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : filteredInterviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">No interviews found in this category.</div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedInterviews.map((interview) => (
                <InterviewCard 
                  key={interview.id} 
                  interview={interview} 
                  onOpenBrief={() => setSelectedBrief(interview)}
                  onReschedule={() => setSelectedReschedule(interview)}
                  onCancel={() => setSelectedCancel(interview)}
                  onOpenFeedback={() => router.push(`/interviewer/interviews/${interview.id}/feedback`)}
                />
              ))}
            </div>
            <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </div>

      <CandidateBriefModal 
         isOpen={!!selectedBrief}
         onClose={() => setSelectedBrief(null)}
         interview={selectedBrief}
      />

      <RescheduleModal
         isOpen={!!selectedReschedule}
         onClose={() => setSelectedReschedule(null)}
         interview={selectedReschedule}
      />

      <CancelModal
         isOpen={!!selectedCancel}
         onClose={() => setSelectedCancel(null)}
         interview={selectedCancel}
      />
    </DashboardLayout>
  );
}

// Reusable Tab Button Component
function TabButton({ active, onClick, label, icon, isPrimary = false }: TabButtonProps) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-colors
      ${active && isPrimary ? 'bg-blue-600 text-white border-blue-600' : ''}
      ${active && !isPrimary ? 'bg-slate-50 text-slate-900 border-slate-300' : ''}
      ${!active ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50' : ''}
    `}>
      {icon} {label}
    </button>
  );
}

// Simple Calendar Icon
function CalendarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
}

// Interview Card Component (Matches the design's specific colored borders)
function InterviewCard({ interview, onOpenBrief, onReschedule, onCancel, onOpenFeedback }: { interview: InterviewData, onOpenBrief: () => void, onReschedule: () => void, onCancel: () => void, onOpenFeedback: () => void }) {
  // 1. Calculate precise end time
  const dateObj = new Date(interview.scheduledAt);
  const now = new Date();
  const endTime = new Date(dateObj.getTime() + (interview.durationMinutes || 60) * 60000);

  // 2. State logic
  const isPast = endTime <= now; // True ONLY if the whole duration has finished
  const isPending = now < endTime; // Meeting hasn't ended yet
  
  const isCompleted = interview.status === 'COMPLETED' || !!interview.feedback;
  const needsFeedback = interview.status === 'SCHEDULED' && isPast;
  const isRescheduleRequested = interview.status === 'RESCHEDULE_REQUESTED';
  const isCancellationRequested = interview.status === 'CANCELLATION_REQUESTED';
  const isCancelled = interview.status === 'CANCELLED';

  let cardStyle = "border-slate-300"; // Default (Upcoming)
  if (needsFeedback) cardStyle = "border-amber-400 ring-1 ring-amber-400"; // Pending Feedback (Yellow)
  if (isCompleted) cardStyle = "border-slate-300"; // Completed (Grey outline, green inner)
  if (isRescheduleRequested) cardStyle = "border-orange-300 ring-1 ring-orange-300"; // Reschedule Pending
  if (isCancellationRequested) cardStyle = "border-red-300 ring-1 ring-red-300"; // Cancellation Pending
  if (isCancelled) cardStyle = "border-slate-200 opacity-75 bg-slate-50"; // Fully cancelled

  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className={`bg-white rounded-xl border ${cardStyle} overflow-hidden shadow-sm`}>
      
      {/* Alert Banner for pending feedback */}
      {needsFeedback && (
        <div className="bg-amber-50/50 border-b border-amber-200 px-6 py-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600" />
          <p className="text-xs font-bold text-amber-800">Feedback not submitted — submit within 2 hours of interview</p>
        </div>
      )}

      {/* Alert Banner for Reschedule Requested */}
      {isRescheduleRequested && (
        <div className="bg-orange-50/50 border-b border-orange-200 px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-orange-600" />
            <p className="text-xs font-bold text-orange-800">Reschedule Request Pending HR Approval</p>
          </div>
          <span className="text-[10px] font-bold text-orange-600 bg-white border border-orange-200 px-2 py-0.5 rounded-full">
            Requested: {new Date(interview.rescheduleRequest?.preferredDate || new Date()).toLocaleDateString()} at {interview.rescheduleRequest?.preferredTime || 'N/A'}
          </span>
        </div>
      )}

      {/* Alert Banner for Cancellation Requested */}
      {isCancellationRequested && (
        <div className="bg-red-50/50 border-b border-red-200 px-6 py-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-600" />
          <p className="text-xs font-bold text-red-800">Cancellation Pending HR Approval. Reason: {interview.cancellationReason}</p>
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg ${needsFeedback ? 'bg-blue-600' : isCompleted ? 'bg-emerald-600' : 'bg-teal-600'}`}>
              {interview.candidate.name.split(' ').map((n) => n[0]).join('').substring(0,2)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-slate-900">{interview.candidate.name}</h3>
                {needsFeedback && <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">Today {formattedTime}</span>}
                {!needsFeedback && !isRescheduleRequested && !isCancellationRequested && <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{formattedDate} • {formattedTime}</span>}
                {(isRescheduleRequested || isCancellationRequested) && <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full line-through">{formattedDate} • {formattedTime}</span>}
                
                {needsFeedback && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1"><Clock size={10}/> Feedback Due</span>}
              </div>
              <p className="text-xs font-medium text-slate-500 mt-1">{interview.candidate.college || 'University'} • CSE • CGPA 8.7</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Software Engineer — Fullstack • <span className="font-bold text-slate-700">91% AI Match</span></p>
            </div>
          </div>
          <div className="px-4 py-1.5 border border-blue-200 bg-white text-blue-600 text-xs font-bold rounded-full shadow-sm">
            Technical Round 1
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-bold text-slate-600 mb-6">
          <div className="flex items-center gap-2"><Video size={14} className="text-slate-400" /> Google Meet</div>
          <div className="flex items-center gap-2"><Clock size={14} className="text-slate-400" /> {interview.durationMinutes} min</div>
          <div className="flex items-center gap-2"><CalendarIcon /> {formattedDate}, 2026</div>
        </div>

        {/* Action Buttons - Candidate & Resume appear on EVERY card */}
        <div className="flex flex-wrap gap-3">
          {isCancelled ? (
            <button disabled className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold flex items-center gap-2 cursor-not-allowed">
              <XCircle size={16} /> Cancelled
            </button>
          ) : (
            <>
              {needsFeedback ? (
                <button onClick={onOpenFeedback} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
                  <FileBadge size={16} /> Open Feedback Form
                </button>
              ) : isPending && !isCompleted && !isRescheduleRequested && !isCancellationRequested ? (
                <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-bold flex items-center gap-2 cursor-not-allowed">
                  <Clock size={16} /> Pending Completion
                </button>
              ) : null}

              <button onClick={onOpenBrief} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
                <User size={16} className="text-slate-400" /> Candidate Brief
              </button>
              
              <a href={interview.candidate.resumeUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
                <Download size={16} className="text-slate-400" /> Resume
              </a>

              {!isPast && !isCompleted && !isRescheduleRequested && !isCancellationRequested && (
                <button onClick={onCancel} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-50 transition-colors">
                  <X size={16} className="text-red-500" /> Cancel
                </button>
              )}

              {/* Reschedule button – hide if pending cancellation */}
              {!isPast && !isCompleted && !isRescheduleRequested && !isCancellationRequested && (
                <button onClick={onReschedule} className="px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors">
                  <RefreshCw size={16} className="text-blue-500" /> Reschedule
                </button>
              )}

              {!isCompleted && isRescheduleRequested && (
                <button onClick={onReschedule} className="px-4 py-2 bg-white border border-orange-200 text-orange-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-orange-50 transition-colors">
                  <RefreshCw size={16} className="text-orange-500" /> Update Request
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Completed State Inner Footer */}
      {isCompleted && (
        <div className="bg-emerald-50/50 border-t border-emerald-100 mx-6 mb-6 p-3 rounded-lg flex items-center justify-between border">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-2 py-1 rounded flex items-center gap-1 shadow-sm"><CheckCircle2 size={12}/> Hire</span>
            <span className="text-xs font-medium text-emerald-800">Technical 4/5 • Coding 4/5 • Communication 3/5</span>
          </div>
        </div>
      )}
      
      {/* Grey bottom footer for completed feedback */}
      {isCompleted && (
         <div className="bg-slate-50 border-t border-slate-200 px-6 py-2">
            <button onClick={onOpenFeedback} className="text-xs font-bold text-slate-500 flex items-center gap-1.5 hover:text-slate-700"><Eye size={14}/> View Submitted Feedback</button>
         </div>
      )}
    </div>
  );
}
