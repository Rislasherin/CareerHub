'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { useAuth } from '@/context/AuthContext';
import { loginUser } from '@/services/auth/auth.service';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { user } = await loginUser('super_admin', { email, password });
      login(user);
      toast.success('Admin access granted.');
      router.push('/admin');
    } catch {
      // Handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)', background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.8), #020617)' }}>
      <GlassCard style={{ maxWidth: '450px', width: '100%', padding: 'var(--space-xl)', background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-md)' }}>
            <ShieldCheck size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 'var(--space-xs)', color: '#fff' }}>Super Admin</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Secure platform access.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <Input label="Admin Email" type="email" icon={<Mail size={18} />} placeholder="admin@careerhub.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" icon={<Lock size={18} />} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" fullWidth isLoading={isLoading} style={{ marginTop: 'var(--space-md)', background: '#fff', color: '#0f172a' }}>
            Authenticate <ArrowRight size={18} />
          </Button>
        </form>

        <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
          <Link href="/login" style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>Back to role selection</Link>
        </div>
      </GlassCard>
    </div>
  );
}
