import React, { useState } from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/services/api/api.client';
import { API_ROUTES } from '@/constants/api.routes';
import { toast } from 'sonner';

export function GenerateOfferModal({ isOpen, onClose, application, onSuccess }: any) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const ctc = parseFloat(formData.get('ctc') as string);
    const role = formData.get('role') as string;
    const joiningDate = formData.get('joiningDate') as string;
    const expiresAt = formData.get('expiresAt') as string;

    try {
      await apiClient.post('/hr/offers', {
        applicationId: application.id,
        role,
        ctc,
        joiningDate: new Date(joiningDate).toISOString(),
        expiresAt: new Date(expiresAt).toISOString()
      });
      toast.success('Offer letter generated and sent to candidate!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate offer letter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Generate Offer Letter</h2>
              <p className="text-xs font-bold text-slate-500 mt-0.5">For {application.student?.user?.firstName || application.student?.firstName} {application.student?.user?.lastName || application.student?.lastName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Job Role / Title</label>
            <input 
              name="role" 
              required 
              defaultValue={application.job?.title || ""}
              placeholder="e.g. Software Engineer" 
              className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Offered CTC (in INR)</label>
            <input 
              name="ctc" 
              type="number" 
              required 
              min="0"
              placeholder="e.g. 1200000" 
              className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Joining Date</label>
              <input 
                name="joiningDate" 
                type="date" 
                required 
                className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Offer Valid Until</label>
              <input 
                name="expiresAt" 
                type="date" 
                required 
                className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {loading ? 'Generating...' : 'Rollout Offer Letter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
