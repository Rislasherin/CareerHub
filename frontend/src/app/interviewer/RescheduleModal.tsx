'use client';
import React, { useState } from 'react';
import { X, RefreshCw, AlertTriangle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/services/api/api.client';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: any;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ isOpen, onClose, interview }) => {
  const [reason, setReason] = useState('conflict');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when modal opens or interview changes
  React.useEffect(() => {
    if (isOpen && interview?.rescheduleRequest) {
      const req = interview.rescheduleRequest;
      setReason(req.reason || 'conflict');
      if (req.preferredDate) {
        setDate(new Date(req.preferredDate).toISOString().split('T')[0]);
      } else {
        setDate('');
      }
      setTime(req.preferredTime || '');
      setNote(req.noteToHr || '');
    } else if (isOpen) {
      setReason('conflict');
      setDate('');
      setTime('');
      setNote('');
    }
  }, [isOpen, interview]);

  if (!isOpen || !interview) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // apiClient handles appending the base URL
      await apiClient.post(`/interviewer/interviews/${interview.id}/reschedule`, {
        reason,
        preferredDate: date,
        preferredTime: time,
        noteToHr: note
      });
      // Optionally trigger a re-fetch of the interviews list here
      // But for now just close the modal
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Failed to submit reschedule request", error);
      setIsSubmitting(false);
      alert("Failed to submit reschedule request. Please try again.");
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
              <RefreshCw size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold">Request Reschedule</h2>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Alert Banner */}
            <div className="bg-[#FFF9EB] border border-[#FDE6A8] p-3.5 rounded-xl flex items-start gap-3 mb-6">
              <AlertTriangle size={18} className="text-[#D97706] shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-[#B45309] leading-tight underline decoration-[#FDE6A8] underline-offset-2">
                Rescheduling requires HR Admin approval. HR will confirm with the candidate.
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
                  Technical Round 1 • {formattedDate} • {formattedTime} • Google Meet
                </p>
              </div>
            </div>

            <form id="reschedule-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Reason Radios */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">Reason for Reschedule <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {[
                    { id: 'conflict', label: 'I have a scheduling conflict' },
                    { id: 'technical', label: 'Technical issue / infrastructure problem' },
                    { id: 'emergency', label: 'Emergency / personal reason' },
                    { id: 'other', label: 'Other' },
                  ].map((option) => (
                    <label key={option.id} className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="relative flex items-center justify-center">
                         <input 
                           type="radio" 
                           name="reason" 
                           value={option.id} 
                           checked={reason === option.id}
                           onChange={(e) => setReason(e.target.value)}
                           className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600 focus:ring-2 cursor-pointer opacity-0 absolute"
                           required
                         />
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${reason === option.id ? 'border-blue-600' : 'border-slate-300'}`}>
                            {reason === option.id && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                         </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Preferred New Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Preferred New Time</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Note to HR (Optional)</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Please avoid afternoon slots next week..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 h-24 resize-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                />
              </div>

            </form>
          </div>

          {/* Footer Action */}
          <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              form="reschedule-form"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
            >
              <Send size={16} /> {isSubmitting ? 'Sending...' : 'Send Request to HR'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
