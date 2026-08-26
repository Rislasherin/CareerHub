'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HRApplicationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/hr/candidates');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}
