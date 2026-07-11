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

  useEffect(() => {
    fetchOffers();
  }, []);

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

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading offers...</div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              You haven't received any offers yet. Keep applying!
            </div>
          ) : paginatedOffers.map((offer) => (
            <GlassCard key={offer.id} className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 overflow-hidden shadow-sm">
                    {offer.job?.company?.logo ? (
                      <img src={offer.job.company.logo} alt="Company logo" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="text-slate-400" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {offer.job?.company?.name || 'Company Name'}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">
                      {offer.role}
                    </p>
                  </div>
                </div>

                <div className={`px-4 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2
                  ${offer.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    offer.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    offer.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'}`}>
                  {offer.status === 'ACCEPTED' && <CheckCircle2 size={16} />}
                  {offer.status === 'REJECTED' && <XCircle size={16} />}
                  {offer.status === 'PENDING' && <Clock size={16} />}
                  {offer.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><IndianRupee size={12}/> CTC</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(offer.ctc)} / year</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={12}/> Joining Date</p>
                  <p className="font-semibold text-slate-900">{new Date(offer.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock size={12}/> Expires On</p>
                  <p className="font-semibold text-rose-600">{new Date(offer.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center">
                  <Button 
                    variant="secondary" 
                    onClick={() => { setSelectedOffer(offer); setShowOfferModal(true); }}
                    className="w-full bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                  >
                    <FileText size={16} className="mr-2" /> View Offer Letter
                  </Button>
                </div>
              </div>

              {offer.status === 'PENDING' && (
                <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 font-medium">Please review the offer letter carefully before making a decision.</p>
                  </div>
                  <Button variant="secondary" onClick={() => handleRespond(offer.id, 'REJECTED')} className="bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 font-bold px-8">
                    Decline Offer
                  </Button>
                  <Button onClick={() => handleRespond(offer.id, 'ACCEPTED')} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 font-bold px-8">
                    Accept Offer
                  </Button>
                </div>
              )}
            </GlassCard>
          ))}
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
                      <p className="text-xs font-semibold text-slate-500">{selectedOffer.job?.company?.name}</p>
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
                      <h2 className="text-3xl font-black text-slate-900">{selectedOffer.job?.company?.name || 'Company Name'}</h2>
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-2">Offer of Employment • Confidential</p>
                    </div>

                    <div className="space-y-6 text-sm leading-relaxed">
                      <p className="font-semibold text-slate-900">{new Date(selectedOffer.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      
                      <p>Dear <strong className="text-slate-900">{selectedOffer.student?.user?.firstName} {selectedOffer.student?.user?.lastName}</strong>,</p>
                      
                      <p>
                        We are pleased to extend an offer of employment for the position of <strong className="text-slate-900">{selectedOffer.role || '[Role]'}</strong> at {selectedOffer.job?.company?.name}. 
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
                          HR Manager • {selectedOffer.job?.company?.name}
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
