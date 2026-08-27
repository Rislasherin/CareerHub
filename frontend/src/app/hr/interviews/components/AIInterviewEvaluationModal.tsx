'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  Sparkles, 
  RefreshCw, 
  MessageSquare, 
  UserCheck, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Zap,
  Briefcase,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  IAIInterviewEvaluation, 
  HRDecisionAction, 
  ICompetencyEvaluation, 
  IQuestionEvaluationAnalysis 
} from '@/types/ai-interview-evaluation';
import { InterviewEvaluationService } from '@/services/hr/interview-evaluation.service';
import { useRouter } from 'next/navigation';

interface AIInterviewEvaluationModalProps {
  interviewId: string;
  candidateName: string;
  jobTitle: string;
  onClose: () => void;
  onDecisionRecorded?: (evaluation: IAIInterviewEvaluation) => void;
}

export const AIInterviewEvaluationModal: React.FC<AIInterviewEvaluationModalProps> = ({
  interviewId,
  candidateName,
  jobTitle,
  onClose,
  onDecisionRecorded,
}) => {
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<IAIInterviewEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'COMPETENCIES' | 'QUESTIONS' | 'SUGGESTIONS'>('OVERVIEW');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // HR Decision Form State
  const [selectedAction, setSelectedAction] = useState<HRDecisionAction | ''>('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEvaluation = async (isBackgroundPoll = false) => {
    try {
      if (!isBackgroundPoll) setLoading(true);
      const data = await InterviewEvaluationService.getEvaluation(interviewId);
      setEvaluation(data);
      if (data?.hrDecision) {
        setSelectedAction(data.hrDecision.action);
        setDecisionNotes(data.hrDecision.decisionNotes || '');
        setOverrideReason(data.hrDecision.overrideReason || '');
      }
      return data;
    } catch (err: unknown) {
      console.error('Failed to load evaluation', err);
      if (!isBackgroundPoll) {
        toast.error('Failed to load interview evaluation details.');
      }
      return null;
    } finally {
      if (!isBackgroundPoll) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [interviewId]);

  // Real-time polling when status is EVALUATING or PENDING
  useEffect(() => {
    if (!evaluation || evaluation.status === 'EVALUATING' || evaluation.status === 'PENDING') {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(async () => {
        const updated = await fetchEvaluation(true);
        if (updated && updated.status !== 'EVALUATING' && updated.status !== 'PENDING') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (updated.status === 'COMPLETED') {
            toast.success('Interview evaluation is ready!');
          }
        }
      }, 3500);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [evaluation?.status]);

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const updated = await InterviewEvaluationService.regenerateEvaluation(interviewId, evaluation?.sessionId);
      setEvaluation(updated);
      if (updated) {
        if (updated.status === 'COMPLETED') {
          toast.success('Evaluation generated successfully.');
        } else if (updated.status === 'EVALUATING') {
          toast.info('Evaluation calculation started in the background...');
        }
      } else {
        toast.info('Evaluation calculation queued in the background...');
      }
    } catch (err: unknown) {
      console.error('Failed to generate evaluation', err);
      toast.error('Failed to start evaluation generation.');
    } finally {
      setRegenerating(false);
    }
  };

  const isOverride = () => {
    if (!evaluation || !selectedAction) return false;
    const aiRec = evaluation.recommendation;
    if (aiRec === 'DO_NOT_PROCEED' && (selectedAction === 'SHORTLIST' || selectedAction === 'NEXT_ROUND')) {
      return true;
    }
    if ((aiRec === 'STRONG_PROCEED' || aiRec === 'PROCEED') && selectedAction === 'REJECT') {
      return true;
    }
    return false;
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAction) {
      toast.error('Please select an HR action.');
      return;
    }

    if (isOverride() && !overrideReason.trim()) {
      toast.error('An override reason is required when deciding against the AI recommendation.');
      return;
    }

    try {
      setSubmittingDecision(true);
      const updated = await InterviewEvaluationService.recordDecision(interviewId, {
        action: selectedAction as HRDecisionAction,
        decisionNotes: decisionNotes.trim() || undefined,
        overrideReason: isOverride() ? overrideReason.trim() : undefined,
      });
      setEvaluation(updated);
      if (onDecisionRecorded) {
        onDecisionRecorded(updated);
      }
      toast.success('HR hiring decision recorded successfully.');
      
      if (selectedAction === 'HIRE') {
        onClose();
        router.push('/hr/hire-requests');
      }
    } catch (err: unknown) {
      console.error('Failed to record decision', err);
      toast.error('Failed to record decision.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  const getRecommendationBadge = (rec?: string) => {
    switch (rec) {
      case 'STRONG_PROCEED':
        return (
          <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm">
            <Sparkles size={15} className="text-emerald-500" /> STRONG PROCEED
          </span>
        );
      case 'PROCEED':
        return (
          <span className="px-3.5 py-1.5 bg-blue-500/10 text-blue-600 border border-blue-500/30 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 size={15} className="text-blue-500" /> PROCEED
          </span>
        );
      case 'CONSIDER':
        return (
          <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-600 border border-amber-500/30 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm">
            <AlertTriangle size={15} className="text-amber-500" /> CONSIDER FOR REVIEW
          </span>
        );
      case 'DO_NOT_PROCEED':
      default:
        return (
          <span className="px-3.5 py-1.5 bg-rose-500/10 text-rose-600 border border-rose-500/30 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm">
            <X size={15} className="text-rose-500" /> DO NOT PROCEED
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence?: string, score?: number) => {
    const color = confidence === 'HIGH' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                  confidence === 'MEDIUM' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                  'text-amber-600 bg-amber-50 border-amber-200';
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 ${color}`}>
        <ShieldCheck size={13} /> {confidence || 'MEDIUM'} CONFIDENCE {score !== undefined ? `(${score}%)` : ''}
      </span>
    );
  };

  const calculatedScore = React.useMemo(() => {
    if (evaluation?.overallScore !== null && evaluation?.overallScore !== undefined) return evaluation.overallScore;
    if (!evaluation?.competencies || evaluation.competencies.length === 0) return null;
    const evaluatedComps = evaluation.competencies.filter(c => c.score !== null && c.score !== undefined);
    if (evaluatedComps.length === 0) return null;
    const sum = evaluatedComps.reduce((acc, c) => acc + (c.score || 0), 0);
    return Math.round(sum / evaluatedComps.length);
  }, [evaluation]);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-6xl shadow-2xl relative max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between relative border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Brain size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider rounded-md border border-indigo-500/30">
                  AI Evaluation &amp; Feedback
                </span>
                {evaluation?.metadata?.model && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {evaluation.metadata.provider}:{evaluation.metadata.model}
                  </span>
                )}
                {evaluation?.status && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                    evaluation.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    evaluation.status === 'EVALUATING' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse' :
                    evaluation.status === 'FAILED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {evaluation.status}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{candidateName}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <Briefcase size={12} /> {jobTitle} &bull; AI Voice Technical Round
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={regenerating || loading || evaluation?.status === 'EVALUATING'}
              title="Recalculate AI Evaluation"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <RefreshCw size={15} className={regenerating || evaluation?.status === 'EVALUATING' ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Recalculate</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 md:p-8 space-y-6 bg-slate-50/60">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
              <RefreshCw size={38} className="text-indigo-600 animate-spin" />
              <h3 className="text-base font-bold text-slate-800">Loading Evaluation...</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Retrieving comprehensive candidate evaluation data.
              </p>
            </div>
          ) : evaluation?.status === 'EVALUATING' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-3xl border border-indigo-100 p-8 shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
                <RefreshCw size={32} className="animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Analyzing Interview Evidence...</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  The AI evaluator is analyzing candidate responses across job competencies, identifying key technical evidence, and generating weighted competency ratings.
                </p>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 animate-pulse">
                <Sparkles size={14} /> Evaluation in progress &bull; Auto-updating
              </div>
            </div>
          ) : evaluation?.status === 'FAILED' ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-rose-200 p-8 shadow-sm space-y-4">
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-3xl flex items-center justify-center text-rose-600 mx-auto">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Evaluation Generation Encountered an Error</h3>
                <p className="text-xs text-rose-600 font-medium max-w-lg mx-auto mt-1 leading-relaxed bg-rose-50/60 p-3 rounded-xl border border-rose-100 font-mono">
                  {evaluation.failureReason || evaluation.overallSummary || 'The evaluation engine encountered an unexpected timeout or formatting issue.'}
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
                  You can retry the evaluation synthesis now. The interview session and candidate transcript remain safely preserved.
                </p>
              </div>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-indigo-600/25 cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCw size={15} className={regenerating ? 'animate-spin' : ''} />
                {regenerating ? 'Retrying Evaluation...' : 'Retry Evaluation Now'}
              </button>
            </div>
          ) : !evaluation || evaluation.status === 'PENDING' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center text-slate-600 shadow-inner">
                <RefreshCw size={32} className="animate-spin text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Evaluation is being prepared</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  The candidate's interview session data is being finalized. The background worker will automatically begin evaluation shortly.
                </p>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 animate-pulse">
                <RefreshCw size={14} className="animate-spin" /> Pending Evaluation Worker
              </div>
            </div>
          ) : (
            <>
              {/* Score & Recommendation Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Overall Score</span>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                      {calculatedScore !== null ? `${calculatedScore}/100` : 'N/A'}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">Weighted Competency Average</span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Award size={28} />
                  </div>
                </div>

                {/* Recommendation Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">AI Recommendation</span>
                    <span className="text-[10px] font-bold text-slate-400">(Advisory Only)</span>
                  </div>
                  <div className="my-2">{getRecommendationBadge(evaluation.recommendation)}</div>
                  <p className="text-[11px] text-slate-600 font-medium line-clamp-2 leading-relaxed" title={evaluation.recommendationReasoning}>
                    {evaluation.recommendationReasoning}
                  </p>
                </div>

                {/* Confidence Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Evaluation Confidence</span>
                    {getConfidenceBadge(evaluation.confidence, evaluation.confidenceScore)}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {evaluation.confidenceReasoning}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 gap-2">
                {[
                  { id: 'OVERVIEW', label: 'Executive Summary', icon: Layers },
                  { id: 'COMPETENCIES', label: `Competencies (${evaluation.competencies.length})`, icon: Brain },
                  { id: 'QUESTIONS', label: `Questions & Answers (${evaluation.questionAnalyses.length})`, icon: MessageSquare },
                  { id: 'SUGGESTIONS', label: 'AI Next Steps', icon: Zap },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'OVERVIEW' | 'COMPETENCIES' | 'QUESTIONS' | 'SUGGESTIONS')}
                      className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                        isActive
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Icon size={14} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Overview & Strengths/Development */}
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  {/* Summary Box */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Executive Summary</h4>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                      {evaluation.overallSummary}
                    </p>
                  </div>

                  {/* Strengths & Growth Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider mb-3">
                        <TrendingUp size={16} className="text-emerald-600" /> Evidence-Based Strengths
                      </div>
                      {evaluation.strengths.length > 0 ? (
                        <ul className="space-y-2">
                          {evaluation.strengths.map((str, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                              <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No standout strengths observed in recorded answers.</p>
                      )}
                    </div>

                    {/* Development Areas */}
                    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs uppercase tracking-wider mb-3">
                        <TrendingDown size={16} className="text-amber-600" /> Development &amp; Verification Areas
                      </div>
                      {evaluation.developmentAreas.length > 0 ? (
                        <ul className="space-y-2">
                          {evaluation.developmentAreas.map((dev, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                              <span>{dev}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No significant skill gaps flagged.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Competency Matrix */}
              {activeTab === 'COMPETENCIES' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evaluation.competencies.map((comp: ICompetencyEvaluation, idx: number) => {
                      const isInsufficient = comp.status === 'INSUFFICIENT_EVIDENCE';
                      return (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                {comp.category}
                              </span>
                              <h4 className="text-sm font-black text-slate-900">{comp.name}</h4>
                            </div>
                            <div>
                              {isInsufficient ? (
                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold rounded-lg flex items-center gap-1">
                                  <HelpCircle size={12} /> INSUFFICIENT EVIDENCE
                                </span>
                              ) : (
                                <div className="text-right">
                                  <span className="text-lg font-black text-indigo-600">{comp.score}%</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {!isInsufficient && comp.score !== null && (
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  comp.score >= 80 ? 'bg-emerald-500' :
                                  comp.score >= 65 ? 'bg-blue-500' :
                                  comp.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                }`} 
                                style={{ width: `${comp.score}%` }} 
                              />
                            </div>
                          )}

                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {comp.explanation}
                          </p>

                          {comp.evidence && comp.evidence.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 space-y-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Observed Evidence:</span>
                              {comp.evidence.map((ev, eIdx) => (
                                <div key={eIdx} className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  &bull; {ev}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Question & Answer Breakdown */}
              {activeTab === 'QUESTIONS' && (
                <div className="space-y-3">
                  {evaluation.questionAnalyses.map((q: IQuestionEvaluationAnalysis, idx: number) => {
                    const isExpanded = expandedQuestion === q.questionId || (expandedQuestion === null && idx === 0);
                    return (
                      <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <button
                          onClick={() => setExpandedQuestion(isExpanded ? '' : q.questionId)}
                          className="w-full p-4.5 text-left flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 pr-4">
                            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-900 line-clamp-1">{q.questionText}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                              q.score >= 80 ? 'bg-emerald-50 text-emerald-700' :
                              q.score >= 65 ? 'bg-blue-50 text-blue-700' :
                              q.score >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {q.score}/100
                            </span>
                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/40 space-y-4">
                            <div className="mt-3">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Candidate Response</span>
                              <div className="mt-1 p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap">
                                "{q.candidateAnswer}"
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Technical Evaluation &amp; Feedback</span>
                              <p className="mt-1 text-xs text-slate-700 leading-relaxed">{q.feedback}</p>
                            </div>

                            {q.evidence && q.evidence.length > 0 && (
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Key Evidence Points</span>
                                <ul className="mt-1 space-y-1">
                                  {q.evidence.map((ev, evIdx) => (
                                    <li key={evIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                                      <span className="text-indigo-600 font-bold">&bull;</span> {ev}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 4: AI Next Steps */}
              {activeTab === 'SUGGESTIONS' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider">
                    <Zap size={16} className="text-indigo-600" /> Actionable Next Step Suggestions for HR
                  </div>
                  {evaluation.aiSuggestedActions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {evaluation.aiSuggestedActions.map((sug, idx) => (
                        <div key={idx} className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl text-xs text-slate-800 flex items-start gap-3">
                          <ArrowRight size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-medium">{sug}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No specific follow-up suggestions generated.</p>
                  )}
                </div>
              )}

              {/* HR Authoritative Decision Section */}
              <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <UserCheck size={20} className="text-indigo-400" /> Authoritative HR Hiring Decision
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      HR holds full authority over candidate progression. AI recommendations are purely advisory.
                    </p>
                  </div>
                  {evaluation.hrDecision && (
                    <div className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                      <CheckCircle2 size={14} /> Decision Recorded: {evaluation.hrDecision.action}
                    </div>
                  )}
                </div>

                <form onSubmit={handleDecisionSubmit} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                      Select Action
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      {[
                        { action: 'HIRE', label: 'Hire Candidate', color: 'hover:border-indigo-500' },
                        { action: 'SHORTLIST', label: 'Shortlist Candidate', color: 'hover:border-emerald-500' },
                        { action: 'NEXT_ROUND', label: 'Move to Next Round', color: 'hover:border-blue-500' },
                        { action: 'HOLD', label: 'Hold for Review', color: 'hover:border-amber-500' },
                        { action: 'REJECT', label: 'Reject Candidate', color: 'hover:border-rose-500' },
                      ].map(btn => {
                        const isSelected = selectedAction === btn.action;
                        return (
                          <button
                            type="button"
                            key={btn.action}
                            onClick={() => setSelectedAction(btn.action as HRDecisionAction)}
                            className={`py-3 px-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer text-center ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                                : `bg-slate-800/80 border-slate-700 text-slate-300 ${btn.color}`
                            }`}
                          >
                            {btn.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Override Justification Notice */}
                  {isOverride() && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold">
                        <AlertTriangle size={16} /> Recommendation Override Detected
                      </div>
                      <p className="text-[11px] text-slate-300">
                        You are selecting an action that differs from the AI recommendation ({evaluation.recommendation}). Please document your reasoning below for compliance and auditability.
                      </p>
                      <textarea
                        value={overrideReason}
                        onChange={e => setOverrideReason(e.target.value)}
                        placeholder="State reason for overriding AI recommendation..."
                        rows={2}
                        required
                        className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Internal HR Notes (Optional)
                    </label>
                    <textarea
                      value={decisionNotes}
                      onChange={e => setDecisionNotes(e.target.value)}
                      placeholder="Add internal feedback notes or instructions for the hiring manager..."
                      rows={2}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={submittingDecision || !selectedAction}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
                    >
                      {submittingDecision ? 'Saving Decision...' : 'Confirm & Save Decision'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
