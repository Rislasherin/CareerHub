'use client';
import React, { useState } from 'react';
import { X, AlertCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/services/api/api.client';
import { toast } from 'sonner';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: any;
}

export const CancelModal: React.FC<CancelModalProps> = ({ isOpen, onClose, interview }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen || !interview) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiClient.post(`/interviewer/interviews/${interview.id}/cancel`, {
        reason
      });
      toast.success("Interview cancelled successfully");
      setIsSubmitting(false);
      onClose();
      // Optionally trigger a reload by refreshing the page
      window.location.reload();
    } catch (error) {
      console.error("Failed to cancel interview", error);
      setIsSubmitting(false);
      toast.error("Failed to cancel interview. Please try again.");
    }
  };

  const formattedDate = new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formattedTime = new Date(interview.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
            <div className="flex items-center gap-2 text-slate-800">
              <AlertCircle size={20} className="text-red-500" />
              <h2 className="text-lg font-bold">Cancel Interview</h2>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Alert Banner */}
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-start gap-3 mb-6">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-red-800 leading-tight">
                Are you sure you want to cancel this interview? A notification will be sent to the HR team.
              </p>
            </div>

            {/* Candidate Summary Block */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-inner shrink-0">
                {interview.candidate.name.split(' ').map((n: string) => n[0]).join('').substring(0,2)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{interview.candidate.name}</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Technical Round 1 • {formattedDate} • {formattedTime}
                </p>
              </div>
            </div>

            <form id="cancel-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Reason */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Cancellation Reason <span className="text-red-500">*</span></label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please explain why you need to cancel this interview..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 h-24 resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  required
                />
              </div>

            </form>
          </div>

          {/* Footer Action */}
          <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
              Close
            </button>
            <button 
              type="submit" 
              form="cancel-form"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm disabled:opacity-70"
            >
              <Send size={16} /> {isSubmitting ? 'Cancelling...' : 'Cancel Interview'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
