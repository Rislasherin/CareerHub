'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InterviewerLoginRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/login?role=interviewer');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse text-slate-400 font-medium">Redirecting to login...</div>
    </div>
  );
}
