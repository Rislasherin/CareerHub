'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/shared/Button';
import { toast } from 'sonner';
import {
  PracticeDifficulty,
  PracticeTopic,
  IAIPracticeInterviewResponse,
} from '@/types/ai-practice';
import { StudentAIPracticeService } from '@/services/student/ai-practice.service';
import { useEntitlements } from '@/hooks/useEntitlements';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Lock,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
// Removed MAX_QUESTIONS to support dynamic duration-based completion

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AIPracticeSetupPage() {
  const router = useRouter();
  const { entitlements, loading: entitlementsLoading, hasFeature } = useEntitlements();
  const [selectedDifficulty, setSelectedDifficulty] = useState<PracticeDifficulty | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<IAIPracticeInterviewResponse | null>(null);

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
        // Automatically perform the side effect that used to be on the confirmation page
        const startResponse = await StudentAIPracticeService.startSession(response.data.id);
        
        if (startResponse.success && startResponse.data) {
           toast.success('Practice session configured! Entering setup…');
           router.push(`/student/ai-practice/room/${startResponse.data.id}`);
        } else {
           toast.error('Failed to start interview');
           setLoading(false);
        }
      } else {
        toast.error('Failed to configure practice session');
        setLoading(false);
      }
    } catch (err: unknown) {
      const axiosErr = err as { error?: { message?: string }; message?: string };
      const msg = axiosErr?.error?.message ?? axiosErr?.message ?? 'Error occurred';
      toast.error(msg);
      setLoading(false);
    }
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
      name: 'Warm-up pace',
      desc: 'Standard concept checkpoints, comfortable pacing.',
      tagClass: 'bg-emerald-50 text-emerald-700',
      activeClass: 'border-emerald-600 bg-emerald-50/60',
    },
    {
      value: PracticeDifficulty.MEDIUM,
      label: 'Medium',
      name: 'Real interview pace',
      desc: 'Scenario-based questions with realistic probing.',
      tagClass: 'bg-indigo-50 text-indigo-700',
      activeClass: 'border-indigo-600 bg-indigo-50/60',
    },
    {
      value: PracticeDifficulty.HARD,
      label: 'Hard',
      name: 'Rigorous deep-dive',
      desc: 'High pace, tough follow-ups on edge cases.',
      tagClass: 'bg-rose-50 text-rose-700',
      activeClass: 'border-rose-600 bg-rose-50/60',
    },
  ];

  const selectedDifficultyMeta = difficultyOptions.find((o) => o.value === selectedDifficulty);
  const customTopics = selectedTopics.filter(
    (t) => !Object.values(PracticeTopic).includes(t as PracticeTopic)
  );

  // ── Render ──────────────────────────────────────────────────────────────
  if (entitlementsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasFeature('MOCK_INTERVIEW')) {
    return (
      <DashboardLayout>
        <div className="max-w-[700px] mx-auto flex flex-col items-center justify-center pt-24 text-center">
          <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
            <Lock className="h-10 w-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">AI Practice Locked</h1>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-8 max-w-[400px]">
            The AI Mock Interview feature is not available in your college's current subscription plan ({entitlements?.plan?.name || "Basic"}). Please contact your college administrator to request an upgrade to the Pro plan.
          </p>
          <Button onClick={() => router.push('/student/dashboard')} className="bg-slate-900 text-white hover:bg-slate-800">
            Return to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[920px] mx-auto flex flex-col gap-9 pb-20">

        {/* ── Header ── */}
        <header className="flex justify-between items-end flex-wrap gap-6">
          <div>
            <div className="text-[13px] font-semibold text-indigo-700 mb-2.5">
              AI practice arena
            </div>
            <h1
              className="text-[34px] leading-[1.15] font-medium text-slate-900 mb-2.5"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Set up your mock interview
            </h1>
            <p className="text-slate-500 text-[15px] leading-relaxed max-w-[520px]">
              Choose a pace, pick your topics, and set the clock. Your questions are generated the moment you start.
            </p>
          </div>
          <Button
            onClick={handleLoadLastResult}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-600 border border-slate-200 bg-white px-3.5 py-2 rounded-full hover:border-slate-300 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <Clock size={14} className="text-slate-400" /> View last result
          </Button>
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
              className="flex flex-col gap-6"
            >

              {/* Briefing sheet */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                {/* Step 01 — Difficulty */}
                <div className="p-8 border-b border-slate-100">
                  <div className="flex gap-4 mb-5">
                    <div
                      className="text-[15px] text-slate-400 w-6 flex-shrink-0 pt-0.5"
                      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                    >
                      01
                    </div>
                    <div>
                      <h2 className="text-[16.5px] font-semibold text-slate-900 mb-0.5">Difficulty</h2>
                      <p className="text-[13px] text-slate-400">
                        Sets the pacing and depth of follow-up questions.
                      </p>
                    </div>
                  </div>

                  <div className="pl-10 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {difficultyOptions.map((opt) => {
                      const isActive = selectedDifficulty === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => setSelectedDifficulty(opt.value)}
                          className={`text-left p-4 rounded-xl border-[1.5px] cursor-pointer transition-colors ${
                            isActive ? opt.activeClass : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md mb-2.5 ${opt.tagClass}`}
                          >
                            {opt.label}
                          </span>
                          <p className="text-[14px] font-semibold text-slate-900 mb-1">{opt.name}</p>
                          <p className="text-[12.5px] text-slate-400 leading-relaxed">{opt.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 02 — Topics */}
                <div className="p-8 border-b border-slate-100">
                  <div className="flex gap-4 mb-5">
                    <div
                      className="text-[15px] text-slate-400 w-6 flex-shrink-0 pt-0.5"
                      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                    >
                      02
                    </div>
                    <div>
                      <h2 className="text-[16.5px] font-semibold text-slate-900 mb-0.5">Topics</h2>
                      <p className="text-[13px] text-slate-400">
                        Pick 1 to 5 areas the interview should draw questions from.
                      </p>
                    </div>
                  </div>

                  <div className="pl-10">
                    <div className="text-[12px] text-slate-400 mb-3.5">
                      <span className="font-semibold text-slate-700">{selectedTopics.length}</span> of 5 selected
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.values(PracticeTopic).map((topic) => {
                        const isSelected = selectedTopics.includes(topic);
                        return (
                          <button
                            key={topic}
                            id={`topic-${topic.replace(/\s|\./g, '-')}`}
                            onClick={() => handleTopicToggle(topic)}
                            className={`px-4 py-2 rounded-full text-[13px] font-medium border-[1.5px] transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {topic}
                          </button>
                        );
                      })}

                      {/* Custom Topics Display */}
                      {customTopics.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => handleTopicToggle(topic)}
                          className="px-4 py-2 rounded-full text-[13px] font-medium border-[1.5px] bg-indigo-600 text-white border-indigo-600"
                        >
                          {topic} ✕
                        </button>
                      ))}
                    </div>

                    {/* Custom Topic Input */}
                    <div className="flex gap-2 max-w-sm">
                      <input
                        type="text"
                        placeholder="Add a custom topic, e.g. GraphQL"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTopic()}
                        className="flex-1 px-3.5 py-2 rounded-lg border-[1.5px] border-slate-200 bg-slate-50 text-[13px] focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                        maxLength={50}
                      />
                      <Button
                        onClick={handleAddCustomTopic}
                        className="px-4 py-0 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-lg text-[13px] transition-colors"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Step 03 — Duration */}
                <div className="p-8">
                  <div className="flex gap-4 mb-5">
                    <div
                      className="text-[15px] text-slate-400 w-6 flex-shrink-0 pt-0.5"
                      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                    >
                      03
                    </div>
                    <div>
                      <h2 className="text-[16.5px] font-semibold text-slate-900 mb-0.5">Duration</h2>
                      <p className="text-[13px] text-slate-400">How long the session should run.</p>
                    </div>
                  </div>

                  <div className="pl-10">
                    <div className="flex flex-wrap gap-2">
                      {[5, 10, 15, 20, 25, 30].map((duration) => {
                        const isSelected = selectedDuration === duration;
                        return (
                          <button
                            key={duration}
                            id={`duration-${duration}`}
                            onClick={() => setSelectedDuration(duration)}
                            className={`px-4 py-2.5 rounded-lg text-[13.5px] font-semibold border-[1.5px] transition-colors ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {duration} min
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary bar */}
              <div className="bg-slate-900 rounded-2xl px-7 py-5 flex items-center justify-between gap-5 flex-wrap">
                <div className="flex gap-7 flex-wrap">
                  <div>
                    <div className="text-[10.5px] font-semibold text-slate-400 tracking-wide mb-1">DIFFICULTY</div>
                    <div className="text-[14px] font-semibold text-white">
                      {selectedDifficultyMeta ? selectedDifficultyMeta.label : 'Not selected'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-semibold text-slate-400 tracking-wide mb-1">TOPICS</div>
                    <div className="text-[14px] font-semibold text-white">
                      {selectedTopics.length > 0 ? selectedTopics.join(', ') : 'None selected'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-semibold text-slate-400 tracking-wide mb-1">DURATION</div>
                    <div className="text-[14px] font-semibold text-white">{selectedDuration} minutes</div>
                  </div>
                </div>

                <Button
                  id="btn-configure-session"
                  onClick={handleCreatePractice}
                  disabled={loading}
                  className="flex-shrink-0 px-6 py-3.5 rounded-xl flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-[14px] transition-colors"
                >
                  {loading ? 'Preparing your practice interview…' : 'Continue to interview setup'}
                  <ArrowRight size={17} />
                </Button>
              </div>
            </motion.div>
          )}


        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}