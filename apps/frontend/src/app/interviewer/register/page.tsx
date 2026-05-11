'use client';

import React from 'react';
import Link from 'next/link';
import { User, ArrowLeft, Mail } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';

export default function InterviewerRegisterInfoPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent)' }}>
      <GlassCard style={{ maxWidth: '500px', width: '100%', padding: 'var(--space-2xl)', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--brand-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <User size={32} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Interviewer Access</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
          Interviewer accounts are created by your company's HR or Recruitment Manager. 
          You will receive an invitation email once you've been added to a hiring team.
        </p>
        
        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'left', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Mail size={20} color="var(--brand-secondary)" />
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Check your inbox</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Search for "CareerHub Invitation" in your work email to find your setup link.</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/login" style={{ width: '100%' }}>
            <Button fullWidth>Go to Interviewer Login</Button>
          </Link>
          <Link href="/register-selection" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Back to selection
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
