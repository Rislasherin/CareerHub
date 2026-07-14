'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Pagination } from '@/components/shared/Pagination';
import { FileText, Building2, Calendar, IndianRupee, CheckCircle2, Clock, XCircle, Download, X } from 'lucide-react';
import { apiClient } from '@/services/api/api.client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/student/offers') as any;
      if (res.success) {
        setOffers(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleRespond = async (offerId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await apiClient.patch(`/student/offers/${offerId}/respond`, { status }) as any;
      if (res.success) {
        toast.success(`Offer ${status.toLowerCase()} successfully!`);
        fetchOffers();
      }
    } catch (err) {
      toast.error('Failed to respond to offer');
    }
  };

  const handleDownloadPdf = async (offerId: string) => {
    try {
      const response = await apiClient.get(`/student/offers/${offerId}/pdf`, {
        responseType: 'blob'
      }) as unknown as Blob;
      
      const url = window.URL.createObjectURL(response);
      const a = document.createElement('a');
      a.href = url;
      a.download = `offer_${offerId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalPages = Math.ceil(offers.length / ITEMS_PER_PAGE);
  const paginatedOffers = offers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Offers</h1>
            <p className="text-slate-500 mt-1">Review and respond to your official job offers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-500">Loading offers...</div>
          ) : offers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              You haven't received any offers yet. Keep applying!
            </div>
          ) : paginatedOffers.map((offer) => {
            const isPending = offer.status === 'PENDING';
            const isAccepted = offer.status === 'ACCEPTED';
            const isRejected = offer.status === 'REJECTED';
            
            return (
            <div key={offer.id} className="bg-[#FEF6F3] rounded-[2rem] p-6 relative overflow-hidden shadow-sm border border-orange-100/50 flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center p-2 shadow-sm border border-orange-100 shrink-0">
                    {offer.job?.companyId?.logo ? (
                      <img src={offer.job.companyId.logo} alt="Company logo" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="text-slate-400" size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 truncate">
                      {offer.job?.companyId?.companyName || 'Company Name'}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium truncate">
                      {offer.role}
                    </p>
                  </div>
                </div>

                {isPending && (
                  <div className="bg-orange-100/80 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-orange-200 shrink-0">
                    🎉 Offer!
                  </div>
                )}
                {isAccepted && (
                  <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-200 shrink-0">
                    <CheckCircle2 size={12} /> Accepted
                  </div>
                )}
                 {isRejected && (
                  <div className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-rose-200 shrink-0">
                    <XCircle size={12} /> Declined
                  </div>
                )}
              </div>

              {/* Big CTC */}
              <div className="mb-6">
                <h2 className="text-4xl font-black text-rose-500 tracking-tight">
                  ₹{(offer.ctc / 100000).toFixed(1)} LPA
                </h2>
              </div>

              {/* Details Grid (2x2) */}
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-8 flex-1">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Offer Date</p>
                  <p className="text-sm font-bold text-slate-900">{new Date(offer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Joining</p>
                  <p className="text-sm font-bold text-slate-900">{offer.joiningDate ? new Date(offer.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Deadline</p>
                  <p className="text-sm font-bold text-slate-900">{offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-sm font-bold text-slate-900 capitalize truncate">{offer.status.toLowerCase().replace('_', ' ')}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button 
                  variant="secondary" 
                  onClick={() => { setSelectedOffer(offer); setShowOfferModal(true); }}
                  className="bg-transparent border-2 border-rose-200/60 text-rose-600 hover:bg-rose-50 hover:border-rose-300 px-8 py-2.5 rounded-xl font-bold transition-all"
                >
                  View Letter
                </Button>
                
                {isPending && (
                  <>
                    <Button onClick={() => handleRespond(offer.id, 'ACCEPTED')} className="bg-[#EF4444] hover:bg-red-600 text-white shadow-lg shadow-red-500/25 px-8 py-2.5 rounded-xl font-bold transition-all">
                      Accept Offer
                    </Button>
                    <button onClick={() => handleRespond(offer.id, 'REJECTED')} className="text-sm font-bold text-slate-400 hover:text-rose-500 ml-2 transition-colors">
                      Decline
                    </button>
                  </>
                )}
              </div>
            </div>
            );
          })}
        </div>

        {!loading && totalPages > 1 && (
          <div className="mt-4">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}

        {/* View Offer Modal */}
        <AnimatePresence>
          {showOfferModal && selectedOffer && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setShowOfferModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-slate-100 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 bg-white border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Official Offer Letter</h2>
                      <p className="text-xs font-semibold text-slate-500">{selectedOffer.job?.companyId?.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={() => handleDownloadPdf(selectedOffer.id)} className="bg-slate-900 text-white hover:bg-slate-800 hidden md:flex">
                      <Download size={16} className="mr-2" /> Download PDF
                    </Button>
                    <button onClick={() => setShowOfferModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Modal Body - PDF Document Preview */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-100/50">
                  <div id="offer-letter-preview" className="bg-white p-8 md:p-12 border border-slate-200 shadow-lg rounded-xl max-w-3xl mx-auto text-slate-800">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-black text-slate-900">{selectedOffer.job?.companyId?.companyName || 'Company Name'}</h2>
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-2">Offer of Employment • Confidential</p>
                    </div>

                    <div className="space-y-6 text-sm leading-relaxed">
                      <p className="font-semibold text-slate-900">{new Date(selectedOffer.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      
                      <p>Dear <strong className="text-slate-900">{selectedOffer.student?.user?.firstName} {selectedOffer.student?.user?.lastName}</strong>,</p>
                      
                      <p>
                        We are pleased to extend an offer of employment for the position of <strong className="text-slate-900">{selectedOffer.role || '[Role]'}</strong> at {selectedOffer.job?.companyId?.companyName}. 
                        You have successfully completed our selection process and we believe you will be an excellent addition to our team.
                      </p>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 my-8 grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                        <div>
                          <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-widest mb-1">Role</span>
                          <span className="font-black text-slate-900 text-base">{selectedOffer.role || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-widest mb-1">CTC (Annual)</span>
                          <span className="font-black text-slate-900 text-base">{formatCurrency(selectedOffer.ctc)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-widest mb-1">Joining Date</span>
                          <span className="font-black text-slate-900 text-base">{selectedOffer.joiningDate ? new Date(selectedOffer.joiningDate).toLocaleDateString() : '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-widest mb-1">Location</span>
                          <span className="font-black text-slate-900 text-base">Bangalore - Hybrid</span>
                        </div>
                      </div>

                      <p className="text-slate-600">
                        This offer is contingent upon successful completion of background verification and document submission prior to your joining date.
                      </p>
                      <p className="text-slate-600">
                        Please confirm your acceptance by <strong className="text-slate-900">{selectedOffer.expiresAt ? new Date(selectedOffer.expiresAt).toLocaleDateString() : '-'}</strong>. We look forward to welcoming you!
                      </p>

                      <div className="flex justify-between mt-16 pt-8 border-t border-slate-200">
                        <div className="text-xs text-slate-500 font-medium">
                          HR Manager • {selectedOffer.job?.companyId?.companyName}
                        </div>
                        <div className="text-xs text-slate-500 font-medium text-right">
                          Candidate Acceptance Signature
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Mobile Download Button */}
                <div className="p-4 bg-white border-t border-slate-200 md:hidden flex gap-3">
                    <Button onClick={() => handleDownloadPdf(selectedOffer.id)} className="w-full bg-slate-900 text-white">
                      <Download size={16} className="mr-2" /> Download PDF
                    </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
