'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { toast } from 'sonner';
import {
  PracticeDifficulty,
  PracticeTopic,
  PracticeInterviewStatus,
  IAIPracticeInterviewResponse,
  IAIPracticeQuestion,
} from '@/types/ai-practice';
import { StudentAIPracticeService } from '@/services/student/ai-practice.service';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Cpu,
  Award,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Activity,
  BarChart3,
  MessageSquare,
  Trophy,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { AIQuestionSpeaker } from './components/AIQuestionSpeaker';
import { VoiceAnswerPanel } from './components/VoiceAnswerPanel';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Removed MAX_QUESTIONS to support dynamic duration-based completion

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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AIPracticeSetupPage() {
  const router = useRouter();
  const [selectedDifficulty, setSelectedDifficulty] = useState<PracticeDifficulty | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<IAIPracticeInterviewResponse | null>(null);

  // Derived session state helpers
  const activeQuestion: IAIPracticeQuestion | undefined =
    session?.questions.find((q) => !q.candidateAnswer);
  const activeQuestionIndex = session?.questions.findIndex((q) => !q.candidateAnswer) ?? -1;
  const answeredCount = session?.questions.filter((q) => q.candidateAnswer !== undefined).length ?? 0;

  // ── Topic toggle ────────────────────────────────────────────────────────
  const handleTopicToggle = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      if (selectedTopics.length >= 5) {
        toast.error('You can select a maximum of 5 topics');
        return;
      }
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleAddCustomTopic = () => {
    const topic = customTopic.trim();
    if (!topic) return;
    if (topic.length > 50) {
      toast.error('Topic must be 50 characters or less');
      return;
    }
    if (selectedTopics.includes(topic)) {
      toast.error('Topic already added');
      return;
    }
    if (selectedTopics.length >= 5) {
      toast.error('You can select a maximum of 5 topics');
      return;
    }
    setSelectedTopics([...selectedTopics, topic]);
    setCustomTopic('');
  };

  // ── Create session ──────────────────────────────────────────────────────
  const handleCreatePractice = async () => {
    if (!selectedDifficulty) {
      toast.error('Please select a difficulty level');
      return;
    }
    if (selectedTopics.length === 0) {
      toast.error('Please select at least one topic');
      return;
    }

    setLoading(true);
    try {
      const response = await StudentAIPracticeService.createPractice({
        difficulty: selectedDifficulty,
        topics: selectedTopics,
        durationMinutes: selectedDuration
      });

      if (response.success && response.data) {
        setSession(response.data);
        toast.success('Practice session configured!');
      } else {
        toast.error('Failed to configure practice session');
      }
    } catch (err: unknown) {
      const axiosErr = err as { error?: { message?: string }; message?: string };
      const msg = axiosErr?.error?.message ?? axiosErr?.message ?? 'Error occurred';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Start session ───────────────────────────────────────────────────────
  const handleStartSession = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const response = await StudentAIPracticeService.startSession(session.id);
      if (response.success && response.data) {
        setSession(response.data);
        toast.success('Session started! Entering practice room…');
        router.push(`/student/ai-practice/room/${response.data.id}`);
      } else {
        toast.error('Failed to start interview');
      }
    } catch (err: unknown) {
      const axiosErr = err as { error?: { message?: string }; message?: string };
      const msg = axiosErr?.error?.message ?? axiosErr?.message ?? 'Error starting session';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };


  // ── Submit answer (voice transcript) ────────────────────────────────────
  const handleSubmitAnswer = async (transcript: string) => {
    if (!session || !activeQuestion) return;
    if (transcript.trim().length < 5) {
      toast.error('Answer is too short. Please speak a complete answer.');
      return;
    }

    setLoading(true);
    try {
      const response = await StudentAIPracticeService.submitAnswer(session.id, {
        questionId: activeQuestion.id,
        answer: transcript.trim(),
      });

      if (response.success && response.data) {
        setSession(response.data);

        if (response.data.status === PracticeInterviewStatus.COMPLETED) {
          toast.success('Interview complete! View your results below.');
        } else {
          toast.success('Answer submitted — next question ready!');
        }
      } else {
        toast.error('Failed to submit answer');
      }
    } catch (err: unknown) {
      const axiosErr = err as { error?: { message?: string }; message?: string };
      const msg = axiosErr?.error?.message ?? axiosErr?.message ?? 'Error submitting answer';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSession(null);
    setSelectedDifficulty(null);
    setSelectedTopics([]);
  };

  // ── Load Last Result ─────────────────────────────────────────────────────
  const handleLoadLastResult = async () => {
    setLoading(true);
    try {
      const response = await StudentAIPracticeService.getLatestCompletedPractice();
      if (response.success && response.data) {
        router.push(`/student/ai-practice/results/${response.data.id}`);
      } else {
        toast.error('No recent completed practice found.');
      }
    } catch (err: unknown) {
      toast.error('No recent completed practice found.');
    } finally {
      setLoading(false);
    }
  };

  // ── Difficulty meta ─────────────────────────────────────────────────────
  const difficultyOptions = [
    {
      value: PracticeDifficulty.EASY,
      label: 'Easy',
      desc: 'Comfortable pace with standard concept checkups. Great for warming up.',
      inactiveClass: 'border-emerald-500/20 hover:border-emerald-500/50 bg-emerald-500/5',
      activeClass: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10',
      badge: 'bg-emerald-100 text-emerald-700',
    },
    {
      value: PracticeDifficulty.MEDIUM,
      label: 'Medium',
      desc: 'Real-world interview pace with scenario-based probing questions.',
      inactiveClass: 'border-blue-500/20 hover:border-blue-500/50 bg-blue-500/5',
      activeClass: 'ring-2 ring-blue-500 border-blue-500 bg-blue-500/10',
      badge: 'bg-blue-100 text-blue-700',
    },
    {
      value: PracticeDifficulty.HARD,
      label: 'Hard',
      desc: 'Rigorous deep-dives, high pacing, and tough follow-ups on edge cases.',
      inactiveClass: 'border-purple-500/20 hover:border-purple-500/50 bg-purple-500/5',
      activeClass: 'ring-2 ring-purple-500 border-purple-500 bg-purple-500/10',
      badge: 'bg-purple-100 text-purple-700',
    },
  ];

  const avgScore =
    session && answeredCount > 0
      ? Math.round(
          session.questions.reduce((sum, q) => sum + (q.score ?? 0), 0) / answeredCount
        )
      : 0;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-[960px] mx-auto flex flex-col gap-8">

        {/* ── Header ── */}
        <header className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-3 border border-slate-200">
              <Cpu size={13} className="text-slate-500" /> AI Practice Arena
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">
              Practice Interviews
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Fine-tune your skills with instant questions generated by our AI brain.
            </p>
          </div>

          {session?.status === PracticeInterviewStatus.IN_PROGRESS && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 text-indigo-700 text-xs font-bold self-start">
              <Activity size={14} className="animate-pulse" />
              Live Session · Q{(activeQuestionIndex >= 0 ? activeQuestionIndex : answeredCount) + 1}
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">

          {/* ════════════════════════════════════════════════════
              SCREEN A — Setup (no session yet)
          ════════════════════════════════════════════════════ */}
          {!session && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col gap-8"
            >
              <div className="flex justify-end mb-[-1.5rem] z-10 relative">
                 <Button onClick={handleLoadLastResult} disabled={loading} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-sm hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all disabled:opacity-50">
                   <Clock size={16} className="text-indigo-500" /> Last Practice Result
                 </Button>
              </div>
              
              {/* Difficulty */}
              <GlassCard className="p-8 flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Award className="text-indigo-500" size={18} /> Choose Difficulty
                  </h2>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Select the pacing and depth complexity of your session.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {difficultyOptions.map((opt) => {
                    const isActive = selectedDifficulty === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setSelectedDifficulty(opt.value)}
                        className={`p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                          isActive ? opt.activeClass : opt.inactiveClass
                        }`}
                      >
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-2 inline-block ${opt.badge}`}
                        >
                          {opt.label}
                        </span>
                        <p className="text-slate-600 text-xs font-medium leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Topics */}
              <GlassCard className="p-8 flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="text-indigo-500" size={18} /> Choose Topics
                  </h2>
                  <p className="text-slate-500 text-sm mt-0.5">Select 1 to 5 topics.</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {Object.values(PracticeTopic).map((topic) => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        id={`topic-${topic.replace(/\s|\./g, '-')}`}
                        onClick={() => handleTopicToggle(topic)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow scale-[1.02]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                  
                  {/* Custom Topics Display */}
                  {selectedTopics.filter(t => !Object.values(PracticeTopic).includes(t as PracticeTopic)).map(topic => (
                     <button
                        key={topic}
                        onClick={() => handleTopicToggle(topic)}
                        className="px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all duration-200 cursor-pointer bg-slate-900 text-white border-slate-900 shadow scale-[1.02]"
                      >
                        {topic} ✕
                      </button>
                  ))}
                </div>
                
                {/* Custom Topic Input */}
                <div className="flex gap-2 max-w-sm mt-2">
                  <input 
                    type="text" 
                    placeholder="Enter custom topic..." 
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTopic()}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    maxLength={50}
                  />
                  <Button onClick={handleAddCustomTopic} className="px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold rounded-xl text-sm transition-colors">
                    Add
                  </Button>
                </div>
              </GlassCard>

              {/* Duration */}
              <GlassCard className="p-8 flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-indigo-500" size={18} /> Choose Duration
                  </h2>
                  <p className="text-slate-500 text-sm mt-0.5">Select how long your mock interview will last.</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {[5, 10, 15, 20, 25, 30].map((duration) => {
                    const isSelected = selectedDuration === duration;
                    return (
                      <button
                        key={duration}
                        id={`duration-${duration}`}
                        onClick={() => setSelectedDuration(duration)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow scale-[1.02]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {duration} Minutes
                      </button>
                    );
                  })}
                </div>
              </GlassCard>

              <div className="flex justify-end">
                <Button
                  id="btn-configure-session"
                  onClick={handleCreatePractice}
                  disabled={loading}
                  className="px-8 py-4 rounded-xl flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition-all shadow-lg"
                >
                  {loading ? 'Configuring…' : 'Configure Session'}
                  <ChevronRight size={18} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════
              SCREEN B — CREATED (pre-start confirmation)
          ════════════════════════════════════════════════════ */}
          {session && session.status === PracticeInterviewStatus.CREATED && (
            <motion.div
              key="created"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-[580px] mx-auto w-full"
            >
              <GlassCard className="p-10 flex flex-col items-center text-center gap-7 border border-indigo-100 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <Sparkles size={28} className="text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Practice Session Configured!
                  </h2>
                  <p className="text-slate-500 text-sm mt-1.5 font-medium">
                    Your isolated session has been established. Press Start to generate your first question.
                  </p>
                </div>

                <div className="w-full bg-slate-50 rounded-2xl p-5 text-left border border-slate-200 flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Difficulty
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {session.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Topics
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {session.topics.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold"
                        >
                          <CheckCircle2 size={11} className="text-emerald-500" /> {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Duration
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-800 border border-slate-200">
                      {session.durationMinutes} Minutes
                    </span>
                  </div>
                </div>

                <Button
                  id="btn-start-session"
                  onClick={handleStartSession}
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Generating First Question…
                    </>
                  ) : (
                    <>
                      Start Practice Session <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </GlassCard>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════
              SCREEN C — IN_PROGRESS active interview (VOICE)
          ════════════════════════════════════════════════════ */}
          {session &&
            session.status === PracticeInterviewStatus.IN_PROGRESS &&
            activeQuestion && (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
              >
                {/* ── Main interview card ── */}
                <GlassCard className="p-8 flex flex-col gap-6 border border-slate-200 shadow-sm">

                  {/* Progress header */}
                  <div className="flex justify-between items-center flex-wrap gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                        Current Topic
                      </span>
                      <span className="text-slate-800 font-extrabold text-lg">
                        {activeQuestion.topic}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                        Questions Answered
                      </span>
                      <span className="text-indigo-600 font-black text-lg">
                        {answeredCount}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar (Removed since it's time-based now, handled by timer) */}

                  {/* ── Room CTA ── */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-md">
                    <div>
                      <p className="font-bold text-xs">Practice Room Available</p>
                      <p className="text-[11px] text-slate-400">Experience this mock interview with camera & audio in a dedicated room</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`/student/ai-practice/room/${session.id}`)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      Enter Room <ArrowRight size={13} />
                    </button>
                  </div>


                  {/* ── AI Question section ── */}
                  <div className="flex flex-col gap-3">
                    {/* Question bubble */}
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50/60 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow">
                        AI
                      </div>
                      <div className="flex-1">
                        <span className="text-indigo-500 font-bold uppercase tracking-wider text-[9px] block mb-1.5">
                          AI Interviewer
                        </span>
                        <p className="text-slate-900 font-semibold text-base md:text-lg leading-relaxed">
                          {activeQuestion.text}
                        </p>
                      </div>
                    </div>

                    {/* AI speaking / your turn indicator */}
                    <div className="px-1">
                      <AIQuestionSpeaker
                        questionText={activeQuestion.text}
                      />
                    </div>
                  </div>

                  {/* ── Divider ── */}
                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Your Response</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  {/* ── Voice answer panel ── */}
                  <VoiceAnswerPanel
                    onSubmit={handleSubmitAnswer}
                    isSubmitting={loading}
                  />

                  {/* Previous Q&A (collapsed accordion-style) */}
                  {session.questions.filter((q) => q.candidateAnswer).length > 0 && (
                    <details className="group">
                      <summary className="cursor-pointer text-slate-500 font-bold text-xs uppercase tracking-wider list-none flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                        <MessageSquare size={13} />
                        View previous answers ({session.questions.filter((q) => q.candidateAnswer).length})
                      </summary>
                      <div className="mt-3 flex flex-col gap-3">
                        {session.questions
                          .filter((q) => q.candidateAnswer)
                          .map((q, idx) => (
                            <div
                              key={q.id}
                              className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-slate-500 text-xs font-bold">
                                  Q{idx + 1}: {q.text}
                                </span>
                                {q.score !== undefined && (
                                  <span
                                    className={`text-[10px] font-black px-2 py-0.5 rounded-md border flex-shrink-0 ${getScoreBg(q.score)}`}
                                  >
                                    {q.score}/100
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-700 text-xs italic">{q.candidateAnswer}</p>
                              {q.feedback && (
                                <p className="text-slate-500 text-xs border-t border-slate-200 pt-2 mt-1">
                                  💡 {q.feedback}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </details>
                  )}

                </GlassCard>
              </motion.div>
            )}

          {/* ════════════════════════════════════════════════════
              SCREEN D — COMPLETED results
          ════════════════════════════════════════════════════ */}
          {session && session.status === PracticeInterviewStatus.COMPLETED && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-8"
            >
              {/* Score hero */}
              <GlassCard className="p-8 md:p-10 border border-slate-200 shadow-lg flex flex-col md:flex-row items-center gap-8">
                {/* Circle score */}
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
                  onClick={handleReset}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-4 rounded-xl shadow-lg transition-all flex items-center gap-2 flex-shrink-0"
                >
                  <RotateCcw size={15} /> New Practice
                </Button>
              </GlassCard>

              {session.finalFeedback && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
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

                  {/* Weak Areas */}
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
              )}

              {session.finalFeedback && (
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
              )}

              {session.finalFeedback && (
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
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
