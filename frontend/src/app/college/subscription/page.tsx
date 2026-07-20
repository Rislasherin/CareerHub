'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/redux/hooks';
import { createSubscription, getMyPlan } from '@/services/college/subscription.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Script from 'next/script';
import { 
  Bot, 
  LineChart, 
  Globe, 
  Megaphone, 
  Target,
  FileText,
  Search,
  Check,
  ArrowUp,
  Bell
} from 'lucide-react';

export default function CollegeSubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  
  // Use real data from Redux state
  const collegeAdmin = useAppSelector((state) => state.collegeAdmin.details);
  const collegeName = collegeAdmin?.collegeName || "Your College";
  const activePlan = planDetails?.planType === 'PRO' ? 'Pro Plan' : 'Basic Plan';

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const plan = await getMyPlan();
        if (plan) setPlanDetails(plan);
        
        // Fetch real student count
        const { apiClient } = await import('@/services/api/api.client');
        const { API_ROUTES } = await import('@/constants/api.routes');
        const statsRes = await apiClient.get(API_ROUTES.COLLEGE.DASHBOARD_STATS) as any;
        if (statsRes?.data) setDashboardStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch plan details", err);
      }
    };
    fetchDetails();
  }, []);

  const handleUpgrade = async (planType: 'BASIC' | 'PRO') => {
    setLoading(true);
    try {
      const response = await createSubscription(planType);
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: response.gatewaySubscriptionId,
        name: 'CareerHub',
        description: `${planType} Plan Subscription`,
        handler: function (response: any) {
          toast.success('Payment successful! Your subscription is active.');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        prefill: {
          name: collegeName,
          email: collegeAdmin?.email || 'admin@college.edu',
        },
        theme: {
          color: '#16a34a' // Green color to match new UI
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <FileText size={20} className="text-purple-500" />,
      title: "AI Resume Builder",
      desc: "Students get AI-powered resume scoring, ATS keyword optimisation, and section-by-section suggestions. Increases shortlist rate."
    },
    {
      icon: <Bot size={20} className="text-blue-500" />,
      title: "Mock Interview Bot",
      desc: "Voice-based AI interviews with real-time scoring and weak area detection. Exclusive to Pro plan. Students practice before real interviews."
    },
    {
      icon: <LineChart size={20} className="text-orange-500" />,
      title: "Advanced Analytics",
      desc: "Deep placement reports — year-on-year comparison, branch-wise stats, company-wise offer analysis, and package distribution charts."
    },
    {
      icon: <Globe size={20} className="text-cyan-500" />,
      title: "Full Company Pool Access",
      desc: "Your students appear in candidate searches for all 84+ companies on the platform, not just those you invite to your campus."
    },
    {
      icon: <Megaphone size={20} className="text-rose-500" />,
      title: "Unlimited Notices",
      desc: "Post unlimited placement notices, drive announcements, and deadline reminders directly to students on their dashboard."
    },
    {
      icon: <Target size={20} className="text-red-500" />,
      title: "AI Job Matching",
      desc: "Platform automatically matches your students to job postings based on skills, CGPA, and branch. Students get alerts for relevant jobs."
    }
  ];

  const totalStudents = dashboardStats?.totalStudents || 0;
  const isPro = planDetails?.planType === 'PRO';
  
  const stats = [
    { 
      title: "STUDENTS", 
      value: totalStudents.toString(), 
      total: isPro ? "Unlimited" : "150", 
      desc: "No cap on Pro plan", 
      highlight: true, 
      percent: isPro ? '100%' : `${Math.min(100, (totalStudents / 150) * 100)}%` 
    },
    { 
      title: "AI CREDITS", 
      value: "0", 
      total: isPro ? "10,000" : "2,000", 
      desc: "Resume Builder", 
      highlight: true, 
      percent: '0%' 
    },
    { 
      title: "ADMIN ACCOUNT", 
      value: "1", 
      total: "1 included", 
      desc: `✓ ${collegeAdmin?.firstName || ''} ${collegeAdmin?.lastName || ''}`, 
      highlight: false, 
      percent: '100%' 
    },
    { 
      title: "STORAGE", 
      value: "0 GB", 
      total: isPro ? "50 GB" : "10 GB", 
      desc: "", 
      highlight: true, 
      percent: '0%' 
    }
  ];

  return (
    <DashboardLayout>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="bg-white min-h-screen text-slate-800 font-sans p-6 lg:p-10 max-w-[1400px] mx-auto rounded-tl-3xl shadow-sm">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Subscription</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your CareerHub college plan</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 bg-emerald-600 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
              <ArrowUp size={16} /> Upgrade
            </button>
          </div>
        </header>

        {/* Active Subscription Banner */}
        <div className="border border-green-200/50 bg-green-50/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 shadow-sm">
          <div>
            <div className="text-xs font-bold text-emerald-600 tracking-wider uppercase mb-2">ACTIVE SUBSCRIPTION</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{activePlan} — {collegeName}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{planDetails?.endDate ? `Expires: ${new Date(planDetails.endDate).toLocaleDateString()}` : 'Renews: Pending'}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>₹{planDetails?.planType === 'PRO' ? '2,40,000' : '99,000'} / year</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                Active <Check size={14} />
              </span>
            </div>
          </div>
          <button 
            onClick={() => {
              document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-5 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 transition-shadow shadow-sm whitespace-nowrap">
            Manage Billing
          </button>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-slate-900 mb-6">What your subscription gives your college</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="border border-slate-100 bg-white p-6 rounded-2xl hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{f.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((s, i) => (
            <div key={i} className="border border-slate-100 bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{s.title}</div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-slate-900">{s.value}</span>
                {s.total && <span className="text-sm text-slate-400">/ {s.total}</span>}
              </div>
              {s.highlight && s.title !== "STORAGE" ? (
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div className={`h-full bg-emerald-500`} style={{ width: s.percent }}></div>
                </div>
              ) : null}
              {s.desc && (
                <p className={`text-xs ${s.desc.includes('✓') ? 'text-emerald-600' : 'text-slate-500'}`}>{s.desc}</p>
              )}
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div id="pricing-section" className="grid md:grid-cols-2 gap-6 pb-20">
          
          {/* Basic Plan */}
          <div className="border border-slate-200 bg-white rounded-3xl p-8 hover:shadow-lg transition-shadow relative overflow-hidden flex flex-col">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">BASIC PLAN</div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-bold text-slate-900">₹99K</span>
              <span className="text-slate-400 text-sm">/ year</span>
            </div>
            
            <div className="space-y-4 mb-12 flex-1">
              {['Up to 150 students', '1 College Admin account', '2,000 AI credits / year', 'Basic Resume Builder', 'Notice Board', '10 GB storage'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                  <Check size={16} className="text-blue-500 flex-shrink-0" /> {feature}
                </div>
              ))}
              {['Mock Interview Bot', 'Advanced Analytics'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="text-slate-300 w-4 text-center">×</span> <span className="line-through">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
              <div>
                <div className="text-xl font-bold text-slate-900">16</div>
                <div className="text-[10px] text-slate-400">colleges on this plan</div>
              </div>
              <button 
                onClick={() => handleUpgrade('BASIC')}
                disabled={loading || !isPro}
                className="px-6 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {!isPro ? 'Current Plan' : loading ? 'Processing...' : 'Downgrade'}
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-emerald-500 bg-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-8 bg-slate-900 text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-b-lg">
              MOST POPULAR
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-2">PRO PLAN</div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-bold text-slate-900">₹2.4L</span>
              <span className="text-slate-400 text-sm">/ year</span>
            </div>
            
            <div className="space-y-4 mb-12 flex-1">
              {[
                'Unlimited students', 
                '1 College Admin account', 
                '10,000 AI credits / year', 
                'Full AI Resume Builder', 
                'Notice Board + Broadcast Emails', 
                '50 GB storage',
                'Mock Interview Bot',
                'Advanced Analytics',
                'Interview Calendar View'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                  <Check size={16} className="text-emerald-500 flex-shrink-0" /> {feature}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
              <div>
                <div className="text-xl font-bold text-emerald-500">31</div>
                <div className="text-[10px] text-slate-400">colleges on this plan</div>
              </div>
              <button 
                onClick={() => handleUpgrade('PRO')}
                disabled={loading || isPro}
                className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-md"
              >
                {isPro ? 'Current Plan' : loading ? 'Processing...' : 'Upgrade Pro'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
