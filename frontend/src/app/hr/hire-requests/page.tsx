'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { FileText, UserPlus, FileCheck, X } from 'lucide-react';
import { apiClient } from '@/services/api/api.client';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { useFormValidation } from '@/hooks/useFormValidation';

export default function HRHireRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [offerForm, setOfferForm] = useState({ role: '', ctc: '', joiningDate: '', expiresAt: '' });
  const [updating, setUpdating] = useState(false);

  const { errors, isValid, handleSubmit, getCaptureProps } = useFormValidation(offerForm, (values) => {
    const errs: Record<string, string> = {};
    if (!values.role?.trim()) errs.role = "Role is required";
    if (!values.ctc || Number(values.ctc) <= 0) errs.ctc = "Valid CTC is required";
    if (!values.joiningDate) errs.joiningDate = "Joining date is required";
    if (!values.expiresAt) errs.expiresAt = "Expiry date is required";
    else if (new Date(values.expiresAt) < new Date()) errs.expiresAt = "Cannot be in the past";
    return errs;
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/hr/hire-requests') as any;
      if (res.success) {
        setRequests(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch hire requests');
    } finally {
      setLoading(false);
    }
  };

  const submitOffer = async () => {
    setUpdating(true);
    try {
      const payload = {
        applicationId: selectedApp.id,
        role: offerForm.role,
        ctc: Number(offerForm.ctc),
        joiningDate: offerForm.joiningDate,
        expiresAt: offerForm.expiresAt
      };

      const res = await apiClient.post("/hr/offers", payload) as any;
      if (res.success) {
        toast.success("Offer Letter Generated Successfully!");
        setShowOfferModal(false);
        await apiClient.patch(`/hr/applications/${selectedApp.id}/status`, { status: 'OFFERED' });
        fetchRequests();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate offer');
    } finally {
      setUpdating(false);
    }
  };

  const onValidSubmit = handleSubmit(submitOffer);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hire Requests</h1>
            <p className="text-slate-500 mt-1">Candidates selected for hire awaiting offer generation</p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              No pending hire requests found.
            </div>
          ) : requests.map((app) => (
            <GlassCard key={app.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                    {app.student?.firstName?.[0]}{app.student?.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {app.student?.firstName} {app.student?.lastName}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {app.job?.title} • ID: {app.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    setSelectedApp(app);
                    setOfferForm(prev => ({ ...prev, role: app.job?.title || '' }));
                    setShowOfferModal(true);
                  }}
                  className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 font-bold"
                >
                  <FileText size={16} className="mr-2" />
                  Generate Offer Letter
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Offer Generation Modal */}
        <AnimatePresence>
          {showOfferModal && selectedApp && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setShowOfferModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <FileText className="text-indigo-600" size={20} />
                    <h2 className="text-xl font-bold text-slate-900">Create & Send Offer Letter</h2>
                  </div>
                  <button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex flex-col lg:flex-row flex-1 p-6 gap-8" {...getCaptureProps()}>
                  
                  {/* Left Column - Form */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Offer Details</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Candidate</label>
                          <div className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold flex items-center text-slate-700 opacity-70">
                            {selectedApp.student?.firstName} {selectedApp.student?.lastName}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Role</label>
                          <input
                            type="text"
                            name="role"
                            value={offerForm.role}
                            onChange={e => setOfferForm({ ...offerForm, role: e.target.value })}
                            className={`w-full h-10 px-3 bg-white border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none ${errors.role ? 'border-red-500' : 'border-slate-200'}`}
                          />
                          {errors.role && <p className="text-red-500 text-[10px] mt-1">{errors.role}</p>}
                        </div>
                        
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">CTC (Annual)</label>
                          <input
                            type="number"
                            name="ctc"
                            value={offerForm.ctc}
                            onChange={e => setOfferForm({ ...offerForm, ctc: e.target.value })}
                            className={`w-full h-10 px-3 bg-white border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none ${errors.ctc ? 'border-red-500' : 'border-slate-200'}`}
                          />
                          {errors.ctc && <p className="text-red-500 text-[10px] mt-1">{errors.ctc}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Employment Type</label>
                          <select className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                            <option>Full-time Permanent</option>
                            <option>Internship</option>
                            <option>Contract</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Joining Date</label>
                          <input
                            type="date"
                            name="joiningDate"
                            value={offerForm.joiningDate}
                            onChange={e => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                            className={`w-full h-10 px-3 bg-white border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none ${errors.joiningDate ? 'border-red-500' : 'border-slate-200'}`}
                          />
                          {errors.joiningDate && <p className="text-red-500 text-[10px] mt-1">{errors.joiningDate}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Offer Deadline</label>
                          <input
                            type="date"
                            name="expiresAt"
                            value={offerForm.expiresAt}
                            onChange={e => setOfferForm({ ...offerForm, expiresAt: e.target.value })}
                            className={`w-full h-10 px-3 bg-white border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none ${errors.expiresAt ? 'border-red-500' : 'border-slate-200'}`}
                          />
                          {errors.expiresAt && <p className="text-red-500 text-[10px] mt-1">{errors.expiresAt}</p>}
                        </div>

                        <div className="col-span-2">
                          <label className="text-xs font-bold text-slate-700 block mb-1">Reporting Manager</label>
                          <input
                            type="text"
                            placeholder="e.g. Arjun Singh, Engineering"
                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="text-xs font-bold text-slate-700 block mb-1">Work Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Bangalore - Hybrid"
                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="text-xs font-bold text-slate-700 block mb-1">Additional Notes / Benefits</label>
                          <textarea
                            placeholder="e.g. Health insurance (self + family), ₹1L joining bonus..."
                            className="w-full h-20 p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Live PDF Preview */}
                  <div className="flex-1 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Live PDF Preview</h3>
                    
                    <div id="offer-letter-preview" className="bg-white p-8 border border-slate-200 shadow-sm rounded-lg min-h-[500px] text-slate-800">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-slate-900">TechCorp India</h2>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Offer of Employment • Confidential</p>
                      </div>

                      <div className="space-y-4 text-sm leading-relaxed">
                        <p className="font-semibold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        
                        <p>Dear <strong>{selectedApp.student?.firstName} {selectedApp.student?.lastName}</strong>,</p>
                        
                        <p>
                          We are pleased to extend an offer of employment for the position of <strong>{offerForm.role || '[Role]'}</strong> at TechCorp India. 
                          You have successfully completed our selection process and we believe you will be an excellent addition to our team.
                        </p>

                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 my-6 grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                          <div>
                            <span className="text-slate-500 block text-xs mb-0.5">Role</span>
                            <span className="font-bold text-slate-900">{offerForm.role || '-'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs mb-0.5">CTC (Annual)</span>
                            <span className="font-bold text-slate-900">₹{Number(offerForm.ctc || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs mb-0.5">Joining Date</span>
                            <span className="font-bold text-slate-900">{offerForm.joiningDate ? new Date(offerForm.joiningDate).toLocaleDateString() : '-'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs mb-0.5">Location</span>
                            <span className="font-bold text-slate-900">Bangalore - Hybrid</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs mb-0.5">Type</span>
                            <span className="font-bold text-slate-900">Full-time Permanent</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs mb-0.5">Reports to</span>
                            <span className="font-bold text-slate-900">Engineering Manager</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600">
                          This offer is contingent upon successful completion of background verification and document submission prior to your joining date.
                        </p>
                        <p className="text-xs text-slate-600">
                          Please confirm your acceptance by <strong>{offerForm.expiresAt ? new Date(offerForm.expiresAt).toLocaleDateString() : '-'}</strong>. We look forward to welcoming you!
                        </p>

                        <div className="flex justify-between mt-12 pt-8 border-t border-slate-200">
                          <div className="text-xs text-slate-500 font-medium">
                            HR Manager • TechCorp India
                          </div>
                          <div className="text-xs text-slate-500 font-medium text-right">
                            Candidate Acceptance Signature
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-between items-center">
                  <Button variant="secondary" onClick={() => setShowOfferModal(false)} className="bg-white border-slate-200">
                    Cancel
                  </Button>
                  <div className="flex gap-3">
                    <Button onClick={() => window.print()} variant="secondary" className="bg-white border-slate-200 hover:bg-slate-50">
                      <FileText size={16} className="mr-2" /> Download PDF
                    </Button>
                    <Button
                      isLoading={updating}
                      onClick={onValidSubmit}
                      disabled={!isValid}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 px-8 disabled:opacity-50"
                    >
                      Create & Send Offer Letter
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
