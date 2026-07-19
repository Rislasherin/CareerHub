'use client';

import { useState } from 'react';
import { createSubscription } from '@/services/college/subscription.service';
import Script from 'next/script';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planType: 'BASIC' | 'PRO') => {
    try {
      setLoading(true);
      
      const { gatewaySubscriptionId } = await createSubscription(planType);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: gatewaySubscriptionId,
        name: 'CareerHub',
        description: `${planType} Plan Subscription`,
        handler: function (response: any) {
          alert('Payment Successful! Your AI Tokens will be allocated shortly.');
        },
        theme: {
          color: '#1b1430',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Failed to create subscription', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        
        <h1 className="text-3xl font-bold text-[#1b1430] mb-8 text-center">Upgrade Your Plan</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition bg-white">
            <h2 className="text-2xl font-bold mb-4">Basic Plan</h2>
            <p className="text-gray-600 mb-6">Standard recruitment features for colleges.</p>
            <div className="text-4xl font-bold mb-6">₹49,999<span className="text-lg text-gray-500 font-normal">/yr</span></div>
            <button 
              onClick={() => handleUpgrade('BASIC')}
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Subscribe Basic'}
            </button>
          </div>

          <div className="border-2 border-[#1b1430] rounded-2xl p-8 shadow-lg bg-[#1b1430] text-white relative">
            <div className="absolute top-0 right-0 bg-indigo-500 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">MOST POPULAR</div>
            <h2 className="text-2xl font-bold mb-4">Pro Plan</h2>
            <p className="text-gray-300 mb-6">Includes AI Video Interviewer & 5000 AI Tokens.</p>
            <div className="text-4xl font-bold mb-6">₹1,49,999<span className="text-lg text-gray-400 font-normal">/yr</span></div>
            <button 
              onClick={() => handleUpgrade('PRO')}
              disabled={loading}
              className="w-full py-3 px-4 bg-white text-[#1b1430] rounded-lg font-bold hover:bg-gray-100 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
