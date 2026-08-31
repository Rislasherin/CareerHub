'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { toast } from 'sonner';
import {
  PracticeInterviewStatus,
  IAIPracticeInterviewResponse,
} from '@/types/ai-practice';
import { StudentAIPracticeService } from '@/services/student/ai-practice.service';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  Activity,
  BarChart3,
  Trophy,
  RotateCcw,
  Loader2,
} from 'lucide-react';

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 55) return 'text-amber-500';
  return 'text-rose-500';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  if (score >= 55) return 'bg-amber-50 border-amber-200 text-amber-700';
  return 'bg-rose-50 border-rose-200 text-rose-700';
}

export default function AIPracticeResultsPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<IAIPracticeInterviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    let isSubscribed = true;
    let pollInterval: NodeJS.Timeout;

    const fetchSession = async () => {
      try {
        const response = await StudentAIPracticeService.getPractice(sessionId);
        if (response.success && response.data && isSubscribed) {
          setSession(response.data);

          if (response.data.status === PracticeInterviewStatus.COMPLETED && !response.data.finalFeedback) {
             // Continue polling
          } else {
             if (pollInterval) clearInterval(pollInterval);
          }
        } else if (!response.success && isSubscribed && !session) {
          toast.error('Failed to load session data');
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (err) {
        if (isSubscribed && !session) {
           toast.error('Error loading session');
        }
        if (pollInterval) clearInterval(pollInterval);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchSession();
    pollInterval = setInterval(fetchSession, 3000);

    return () => {
      isSubscribed = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [sessionId]);

  const handleNewPractice = () => {
    router.push('/student/ai-practice');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <p className="text-slate-500">Session not found.</p>
          <Button onClick={handleNewPractice} className="bg-indigo-600 text-white">Back to Practice</Button>
        </div>
      </DashboardLayout>
    );
  }

  const answeredCount = session.questions.filter((q) => q.candidateAnswer !== undefined).length;
  const avgScore =
    session && answeredCount > 0
      ? Math.round(
          session.questions.reduce((sum, q) => sum + (q.score ?? 0), 0) / answeredCount
        )
      : 0;

  return (
    <DashboardLayout>
      <div className="max-w-[960px] mx-auto flex flex-col gap-8">
        <header className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">
              Practice Results
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Review your performance and AI feedback.
            </p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {session.status === PracticeInterviewStatus.COMPLETED ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-8"
            >
              <GlassCard className="p-8 md:p-10 border border-slate-200 shadow-lg flex flex-col md:flex-row items-center gap-8">
                <div className="relative flex-shrink-0">
                  <div className="w-36 h-36 rounded-full border-[6px] border-indigo-500 bg-white shadow-inner flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Overall Score
                    </span>
                    <span className={`font-black text-4xl ${getScoreColor(session.finalFeedback?.overallScore ?? avgScore)}`}>
                      {session.finalFeedback?.overallScore ?? avgScore}
                    </span>
                    <span className="text-slate-400 font-bold text-xs">/ 100</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
                    <Trophy size={15} className="text-white" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 size={13} /> Practice Complete
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {session.finalFeedback?.overallScore && session.finalFeedback.overallScore >= 80 ? 'Excellent session! 🚀' : session.finalFeedback?.overallScore && session.finalFeedback.overallScore >= 55 ? 'Solid effort! 💪' : 'Keep practising! 📚'}
                  </h2>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-lg">
                    You completed a{' '}
                    <span className="font-extrabold text-indigo-600">{session.difficulty}</span>{' '}
                    difficulty practice session covering{' '}
                    <span className="font-extrabold text-slate-700">
                      {session.topics.join(', ')}
                    </span>
                    . See your detailed breakdown below.
                  </p>
                </div>

                <Button
                  id="btn-new-practice"
                  onClick={handleNewPractice}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-4 rounded-xl shadow-lg transition-all flex items-center gap-2 flex-shrink-0"
                >
                  <RotateCcw size={15} /> New Practice
                </Button>
              </GlassCard>

              {session.finalFeedback ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard className="p-7 border border-slate-200">
                      <h3 className="text-lg font-bold text-emerald-700 flex items-center gap-2 mb-4">
                        <Sparkles size={18} /> Strengths
                      </h3>
                      <ul className="flex flex-col gap-3">
                        {session.finalFeedback.strengths.map((str, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-700 font-medium leading-relaxed">
                            <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            {str}
                          </li>
                        ))}
                      </ul>
                    </GlassCard>

                    <GlassCard className="p-7 border border-slate-200">
                      <h3 className="text-lg font-bold text-rose-700 flex items-center gap-2 mb-4">
                        <Activity size={18} /> Weak Areas
                      </h3>
                      <ul className="flex flex-col gap-3">
                        {session.finalFeedback.weakAreas.map((wk, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-700 font-medium leading-relaxed">
                            <Activity size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
                            {wk}
                          </li>
                        ))}
                      </ul>
                    </GlassCard>
                  </div>

                  <GlassCard className="p-7 border border-slate-200">
                    <h3 className="text-lg font-bold text-indigo-700 flex items-center gap-2 mb-4">
                      <Sparkles size={18} /> How to Improve
                    </h3>
                    <ul className="flex flex-col gap-3">
                      {session.finalFeedback.improvementSuggestions.map((sug, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-700 font-medium leading-relaxed bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex justify-center items-center font-bold text-xs flex-shrink-0">{i+1}</span>
                          {sug}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>

                  <GlassCard className="p-7 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <BarChart3 size={18} className="text-indigo-500" /> Topic Performance
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {session.finalFeedback.topicFeedback.map((tf, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700 text-sm">{tf.topic}</span>
                            <span className={`font-black text-sm ${getScoreColor(tf.score)}`}>{tf.score}</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3" title={tf.observations}>{tf.observations}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </>
              ) : (
                <GlassCard className="p-10 flex flex-col items-center justify-center text-center gap-4">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                  <p className="text-slate-500 font-medium">Generating your detailed AI feedback...</p>
                  <Button onClick={() => window.location.reload()} className="mt-4 bg-slate-100 text-slate-700">Refresh Page</Button>
                </GlassCard>
              )}
              
              {/* Detailed Q&A History */}
              <GlassCard className="p-7 border border-slate-200 mt-4">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Detailed Answer History</h3>
                <div className="flex flex-col gap-6">
                  {session.questions.filter(q => q.candidateAnswer).map((q, idx) => (
                    <div key={q.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-slate-700 font-bold">Q{idx + 1}: {q.text}</span>
                        {q.score !== undefined && (
                          <span className={`font-black text-sm px-2 py-1 rounded-md border flex-shrink-0 ${getScoreBg(q.score)}`}>
                            {q.score}/100
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm italic">"{q.candidateAnswer}"</p>
                      {q.feedback && (
                        <div className="bg-white p-3 rounded-lg border border-slate-100 mt-2">
                          <p className="text-slate-700 text-sm font-medium">💡 Feedback:</p>
                          <p className="text-slate-600 text-sm mt-1">{q.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>

            </motion.div>
          ) : (
            <div className="text-center p-12">
              <p className="text-slate-500">Session is not complete yet.</p>
              <Button onClick={handleNewPractice} className="mt-4 bg-indigo-600 text-white">Back to Setup</Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
