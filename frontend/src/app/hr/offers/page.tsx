'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Search, Bell, Plus, FileText, Download, Mail, CheckCircle2, CheckCircle, Clock } from 'lucide-react';
import { apiClient } from '@/services/api/api.client';
import { API_ROUTES } from '@/constants/api.routes';
import { toast } from 'sonner';

export default function HROffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/hr/offers') as any;
      if (res.success) {
        setOffers(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch offers');
      // Fallback mock data to match Figma if API is not yet implemented
      setOffers([
        {
          id: '1',
          student: { user: { firstName: 'Rohit', lastName: 'Mehra' }, college: { name: 'NIT Trichy' }, degree: 'B.Tech IT' },
          role: 'Software Engineer',
          ctc: 1400000,
          joiningDate: '2026-04-01T00:00:00Z',
          createdAt: '2026-03-01T00:00:00Z',
          status: 'ACCEPTED'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async (offerId: string) => {
    try {
      const res = await apiClient.post(`/hr/offers/${offerId}/resend`) as any;
      if (res.success) {
        toast.success("Offer letter email resent successfully!");
      }
    } catch (err) {
      toast.error("Failed to resend email");
    }
  };

  const handleDownloadPdf = async (offerId: string, action: 'preview' | 'download') => {
    try {
      const response = await apiClient.get(`/hr/offers/${offerId}/pdf`, {
        responseType: 'blob'
      }) as unknown as Blob;
      
      const url = window.URL.createObjectURL(response);
      if (action === 'preview') {
        window.open(url, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `offer_${offerId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      toast.error('Failed to generate PDF');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Offer Letters</h1>
            <p className="text-slate-500 mt-1">Approved candidates awaiting offer • Offer sent</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search candidates, jobs..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none shadow-sm"
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors">
              <Bell size={20} />
            </button>
            <Button className="flex items-center gap-2">
              <Plus size={18} /> Create Offer Letter
            </Button>
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="text-emerald-500" size={20} />
          <p className="text-emerald-700 font-medium text-sm">
            Rohit Mehra accepted the offer on Mar 1, 2026 • Joining date: Apr 1, 2026
          </p>
        </div>

        {/* Offers List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading offers...</div>
          ) : offers.map((offer) => (
            <GlassCard key={offer.id} className="p-6">
              
              {/* Card Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-inner">
                    {offer.student?.user?.firstName?.[0]}{offer.student?.user?.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {offer.student?.user?.firstName} {offer.student?.user?.lastName}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {offer.student?.college?.name} • {offer.student?.degree} • All rounds cleared
                    </p>
                  </div>
                </div>

                <div className={`px-4 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2
                  ${offer.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    offer.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'}`}>
                  {offer.status === 'ACCEPTED' && <CheckCircle2 size={16} />}
                  {offer.status === 'PENDING' && <Clock size={16} />}
                  {offer.status === 'ACCEPTED' ? `Accepted • Joining ${new Date(offer.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : offer.status}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role</p>
                  <p className="font-semibold text-slate-900">{offer.role}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">CTC</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(offer.ctc)}/yr</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Joining Date</p>
                  <p className="font-semibold text-slate-900">{new Date(offer.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Offer Sent</p>
                  <p className="font-semibold text-slate-900">{new Date(offer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex items-center gap-3">
                <Button onClick={() => handleDownloadPdf(offer.id, 'preview')} variant="secondary" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                  <FileText size={16} className="mr-2" /> Preview Offer Letter
                </Button>
                <Button onClick={() => handleDownloadPdf(offer.id, 'download')} variant="secondary" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                  <Download size={16} className="mr-2" /> Download PDF
                </Button>
                <Button onClick={() => handleResendEmail(offer.id)} variant="secondary" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                  <Mail size={16} className="mr-2" /> Resend Email
                </Button>

                <div className="flex-1"></div>

                {offer.status === 'ACCEPTED' && (
                  <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-100">
                    <CheckCircle2 size={16} /> Candidate Accepted
                  </div>
                )}
                {offer.status === 'PENDING' && (
                  <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-amber-100">
                    <Clock size={16} /> Awaiting Response
                  </div>
                )}
              </div>

            </GlassCard>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
