'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/shared/Button';
import { GlassCard } from '@/components/shared/GlassCard';
import { Table, Column } from '@/components/shared/Table';
import {
  Check,
  X,
  Building2,
  Search,
  CreditCard,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminService } from '@/services/super-admin/super-admin.service';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  city?: string;
  state?: string;
  countOfStudents?: number;
  plan?: 'BASIC' | 'PRO';
}

interface SubscriptionPlan {
  id: 'BASIC' | 'PRO';
  name: string;
  price: string;
  pricePeriod: string;
  features: {
    text: string;
    included: boolean;
  }[];
  baseCollegeCount: number;
}

export default function SubscriptionManagement() {
  const [colleges, setColleges] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Subscription plan configurations
  const [basicPlan, setBasicPlan] = useState<SubscriptionPlan>({
    id: 'BASIC',
    name: 'BASIC PLAN',
    price: '₹99K',
    pricePeriod: '/ year',
    features: [
      { text: 'Up to 150 students', included: true },
      { text: '1 College Admin account', included: true },
      { text: '2,000 AI credits / year', included: true },
      { text: 'Basic Resume Builder', included: true },
      { text: 'Notice Board', included: true },
      { text: '10 GB storage', included: true },
      { text: 'Mock Interview Bot', included: false },
      { text: 'Advanced Analytics', included: false }
    ],
    baseCollegeCount: 16
  });

  const [proPlan, setProPlan] = useState<SubscriptionPlan>({
    id: 'PRO',
    name: 'PRO PLAN',
    price: '₹2.4L',
    pricePeriod: '/ year',
    features: [
      { text: 'Unlimited students', included: true },
      { text: '1 College Admin account', included: true },
      { text: '10,000 AI credits / year', included: true },
      { text: 'Full AI Resume Builder', included: true },
      { text: 'Notice Board + Broadcast Emails', included: true },
      { text: '50 GB storage', included: true },
      { text: 'Mock Interview Bot', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: 'Interview Calendar View', included: true }
    ],
    baseCollegeCount: 31
  });

  // College-to-plan assignments stored in localStorage
  const [collegePlans, setCollegePlans] = useState<Record<string, 'BASIC' | 'PRO'>>({});

  // Plan editing modal state
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editFeatures, setEditFeatures] = useState<{ text: string; included: boolean }[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Load college plans and fetch configs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPlans = localStorage.getItem('college_subscriptions');
      if (storedPlans) {
        try {
          setCollegePlans(JSON.parse(storedPlans));
        } catch (e) { }
      }

      const storedBasic = localStorage.getItem('basic_plan_config');
      if (storedBasic) {
        try {
          setBasicPlan(JSON.parse(storedBasic));
        } catch (e) { }
      }

      const storedPro = localStorage.getItem('pro_plan_config');
      if (storedPro) {
        try {
          setProPlan(JSON.parse(storedPro));
        } catch (e) { }
      }
    }
  }, []);

  const fetchColleges = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getOrganizations(search, page, 10);
      const fetchedOrgs = res.organizations || [];
      setColleges(fetchedOrgs);
      setTotal(res.total || 0);

      // Auto-assign/sync plans from backend or set default BASIC
      const nextPlans = { ...collegePlans };
      let updated = false;

      for (const col of fetchedOrgs) {
        const activePlan = col.plan || 'BASIC';
        if (nextPlans[col.id] !== activePlan) {
          nextPlans[col.id] = activePlan;
          updated = true;
        }

        // If the backend has no plan assigned, assign default BASIC in the database too
        if (!col.plan) {
          superAdminService.updateOrganizationPlan(col.id, 'BASIC').catch(() => { });
        }
      }

      if (updated) {
        setCollegePlans(nextPlans);
        if (typeof window !== 'undefined') {
          localStorage.setItem('college_subscriptions', JSON.stringify(nextPlans));
        }
      }
    } catch (err) {
      toast.error('Failed to fetch colleges');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchColleges();
  }, [page, search]);

  const handlePlanChange = async (collegeId: string, newPlan: 'BASIC' | 'PRO') => {
    try {
      await superAdminService.updateOrganizationPlan(collegeId, newPlan);
      const nextPlans = { ...collegePlans, [collegeId]: newPlan };
      setCollegePlans(nextPlans);
      if (typeof window !== 'undefined') {
        localStorage.setItem('college_subscriptions', JSON.stringify(nextPlans));
      }
      toast.success(`Plan updated to ${newPlan} successfully`);
    } catch (err) {
      toast.error('Failed to update plan on server');
    }
  };

  // Compute live counts
  const basicCount = basicPlan.baseCollegeCount + Object.values(collegePlans).filter(p => p === 'BASIC').length;
  const proCount = proPlan.baseCollegeCount + Object.values(collegePlans).filter(p => p === 'PRO').length;

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setEditPrice(plan.price);
    setEditFeatures([...plan.features]);
    setNewFeatureText('');
  };

  const handleSavePlanSettings = () => {
    if (!editingPlan) return;

    const updatedPlan: SubscriptionPlan = {
      ...editingPlan,
      price: editPrice,
      features: editFeatures
    };

    if (editingPlan.id === 'BASIC') {
      setBasicPlan(updatedPlan);
      if (typeof window !== 'undefined') {
        localStorage.setItem('basic_plan_config', JSON.stringify(updatedPlan));
      }
    } else {
      setProPlan(updatedPlan);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pro_plan_config', JSON.stringify(updatedPlan));
      }
    }

    setEditingPlan(null);
    toast.success(`${editingPlan.name} settings updated!`);
  };

  const columns: Column<Organization>[] = useMemo(() => [
    {
      header: 'College Details',
      render: (college) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5">
            <Building2 size={18} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{college.name}</span>
            <span className="text-xs text-slate-500">{college.city || 'No City'}, {college.state || 'India'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Active Plan',
      render: (college) => {
        const activePlan = collegePlans[college.id] || 'BASIC';
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${activePlan === 'PRO'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              : 'bg-slate-500/10 text-slate-400 border border-white/5'
            }`}>
            {activePlan === 'PRO' ? <Sparkles size={10} className="mr-1" /> : <Zap size={10} className="mr-1" />}
            {activePlan} PLAN
          </span>
        );
      }
    },
    {
      header: 'Total Students',
      render: (college) => (
        <span className="text-sm font-bold text-slate-300">{college.countOfStudents || 0}</span>
      )
    },
    {
      header: 'Update Plan',
      className: 'text-right',
      render: (college) => {
        const activePlan = collegePlans[college.id] || 'BASIC';
        return (
          <div className="flex items-center justify-end gap-2">
            <select
              value={activePlan}
              onChange={(e) => handlePlanChange(college.id, e.target.value as 'BASIC' | 'PRO')}
              className="bg-[#0B0D17] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-black text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="BASIC">BASIC PLAN</option>
              <option value="PRO">PRO PLAN</option>
            </select>
          </div>
        );
      }
    }
  ], [collegePlans]);

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 flex flex-col gap-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">College Subscriptions</h1>
            <p className="text-slate-500 text-sm font-medium">Manage institutional plans and pricing configurations</p>
          </div>
        </header>

        {/* Pricing Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
          {/* Basic Plan Card */}
          <GlassCard className="relative flex flex-col p-8 border-slate-800 rounded-[2.5rem] bg-[#0E101A] h-full justify-between hover:border-slate-700 transition-all duration-300">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{basicPlan.name}</span>
                  <div className="flex items-baseline mt-2">
                    <span className="text-4xl font-black text-white tracking-tight">{basicPlan.price}</span>
                    <span className="text-slate-500 text-xs font-semibold ml-2">{basicPlan.pricePeriod}</span>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4 my-8">
                {basicPlan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {feature.included ? (
                      <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                        <Check size={12} className="text-cyan-400" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                        <X size={12} className="text-slate-500" />
                      </div>
                    )}
                    <span className={`text-xs font-bold ${feature.included ? 'text-slate-300' : 'text-slate-600 line-through'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="border-t border-white/5 pt-6 flex items-center justify-between">
                <div>
                  <span className="text-xl font-black text-white">{basicCount}</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">colleges on this plan</p>
                </div>
                <Button
                  onClick={() => openEditModal(basicPlan)}
                  className="bg-white/5 hover:bg-white/10 text-white font-black text-xs rounded-xl px-5 h-9 border border-white/10"
                >
                  Edit Plan
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Pro Plan Card */}
          <GlassCard className="relative flex flex-col p-8 border-cyan-500/30 rounded-[2.5rem] bg-[#0A1220] h-full justify-between hover:border-cyan-500/50 shadow-xl shadow-cyan-950/20 transition-all duration-300">
            {/* Most Popular Tag */}
            <div className="absolute -top-3 right-8 bg-cyan-400 text-[#0B0D17] font-black text-[9px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg">
              Most Popular
            </div>

            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{proPlan.name}</span>
                  <div className="flex items-baseline mt-2">
                    <span className="text-4xl font-black text-white tracking-tight">{proPlan.price}</span>
                    <span className="text-slate-500 text-xs font-semibold ml-2">{proPlan.pricePeriod}</span>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4 my-8">
                {proPlan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {feature.included ? (
                      <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                        <Check size={12} className="text-cyan-400" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                        <X size={12} className="text-slate-500" />
                      </div>
                    )}
                    <span className={`text-xs font-bold ${feature.included ? 'text-slate-300' : 'text-slate-600 line-through'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="border-t border-white/5 pt-6 flex items-center justify-between">
                <div>
                  <span className="text-xl font-black text-cyan-400">{proCount}</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">colleges on this plan</p>
                </div>
                <Button
                  onClick={() => openEditModal(proPlan)}
                  className="bg-cyan-500 hover:bg-cyan-600 text-[#0B0D17] font-black text-xs rounded-xl px-5 h-9 border-none shadow-md shadow-cyan-500/25"
                >
                  Edit Plan
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* College plan settings Table */}
        <div className="flex flex-col gap-6 mt-6">
          <div>
            <h2 className="text-xl font-black text-white">College Subscription Registry</h2>
            <p className="text-slate-500 text-xs font-medium mt-1">Assign and override subscription plans for individual institutions</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search colleges..."
                className="w-full bg-[#121520] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            data={colleges}
            isLoading={isLoading}
            loadingMessage="Loading College Registry..."
            emptyMessage="No colleges found in the system registry."
            page={page}
            total={total}
            pageSize={10}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Edit Plan Modal */}
      <AnimatePresence>
        {editingPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPlan(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0B0D17] border border-white/10 rounded-[2rem] shadow-2xl p-8 overflow-hidden"
            >
              <h3 className="text-xl font-black text-white mb-1">Edit {editingPlan.name}</h3>
              <p className="text-slate-500 text-xs font-medium mb-6">Modify price and configurations for this package</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plan Price</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-[#121520] border border-white/10 rounded-xl py-3 pl-4 pr-16 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/50"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">/ year</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Adjust Features List</label>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {editFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#121520] border border-white/5">
                        <span className="text-xs font-bold text-slate-300">{feat.text}</span>
                        <input
                          type="checkbox"
                          checked={feat.included}
                          onChange={(e) => {
                            const next = [...editFeatures];
                            next[idx] = { ...feat, included: e.target.checked };
                            setEditFeatures(next);
                          }}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-[#0B0D17] cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Add new feature..."
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      className="flex-1 bg-[#121520] border border-white/10 rounded-xl py-2.5 px-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50"
                    />
                    <Button
                      onClick={() => {
                        if (newFeatureText.trim()) {
                          setEditFeatures([...editFeatures, { text: newFeatureText.trim(), included: true }]);
                          setNewFeatureText('');
                        }
                      }}
                      className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-black text-xs rounded-xl px-4 h-[38px] border border-cyan-500/20"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <Button
                  onClick={() => setEditingPlan(null)}
                  className="bg-white/5 hover:bg-white/10 text-white font-black text-xs rounded-xl px-5 h-10 border border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePlanSettings}
                  className="bg-cyan-500 hover:bg-cyan-600 text-[#0B0D17] font-black text-xs rounded-xl px-6 h-10 border-none shadow-lg shadow-cyan-500/25"
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
