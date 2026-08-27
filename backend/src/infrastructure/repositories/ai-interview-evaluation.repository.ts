import { IAIInterviewEvaluationRepository } from '@domain/repositories/ai-interview/IAIInterviewEvaluationRepository';
import { AIInterviewEvaluation } from '@domain/entities/ai-interview/AIInterviewEvaluation';
import { CompetencyEvaluation } from '@domain/value-objects/CompetencyEvaluation';
import { QuestionEvaluationAnalysis } from '@domain/value-objects/QuestionEvaluationAnalysis';
import { HRDecision } from '@domain/value-objects/HRDecision';
import { AIRecommendation } from '@domain/enums/AIRecommendation.enum';
import { EvaluationConfidence } from '@domain/enums/EvaluationConfidence.enum';
import { EvaluationStatus } from '@domain/enums/EvaluationStatus.enum';
import { HRDecisionAction } from '@domain/enums/HRDecisionAction.enum';
import { AIInterviewEvaluationModel, IAIInterviewEvaluationDocument } from '../database/models/company/ai-interview-evaluation.model';
import mongoose from 'mongoose';

export class AIInterviewEvaluationRepository implements IAIInterviewEvaluationRepository {
  private _toDomain(doc: IAIInterviewEvaluationDocument): AIInterviewEvaluation {
    const competencies = (doc.competencies || []).map(c => new CompetencyEvaluation({
      name: c.name,
      category: c.category,
      score: c.score,
      status: c.status,
      explanation: c.explanation,
      evidence: c.evidence || [],
    }));

    const questionAnalyses = (doc.questionAnalyses || []).map(q => new QuestionEvaluationAnalysis({
      questionId: q.questionId,
      questionText: q.questionText,
      candidateAnswer: q.candidateAnswer,
      score: q.score,
      feedback: q.feedback,
      evidence: q.evidence || [],
      competencyCovered: q.competencyCovered,
    }));

    let hrDecision: HRDecision | undefined;
    if (doc.hrDecision && doc.hrDecision.action) {
      hrDecision = new HRDecision({
        action: doc.hrDecision.action as HRDecisionAction,
        decisionNotes: doc.hrDecision.decisionNotes,
        overriddenRecommendation: doc.hrDecision.overriddenRecommendation,
        overrideReason: doc.hrDecision.overrideReason,
        decidedBy: doc.hrDecision.decidedBy,
        decidedAt: doc.hrDecision.decidedAt,
      });
    }

    return new AIInterviewEvaluation({
      id: doc._id.toString(),
      interviewId: doc.interviewId.toString(),
      sessionId: doc.sessionId.toString(),
      studentId: doc.studentId.toString(),
      jobId: doc.jobId ? doc.jobId.toString() : '',
      companyId: doc.companyId.toString(),
      overallScore: doc.overallScore,
      overallSummary: doc.overallSummary,
      competencies,
      strengths: doc.strengths || [],
      developmentAreas: doc.developmentAreas || [],
      questionAnalyses,
      insufficientEvidenceAreas: doc.insufficientEvidenceAreas || [],
      recommendation: doc.recommendation as AIRecommendation,
      recommendationReasoning: doc.recommendationReasoning,
      confidence: doc.confidence as EvaluationConfidence,
      confidenceScore: doc.confidenceScore,
      confidenceReasoning: doc.confidenceReasoning,
      aiSuggestedActions: doc.aiSuggestedActions || [],
      hrDecision,
      status: (doc.status as EvaluationStatus) || EvaluationStatus.PENDING,
      failureReason: doc.failureReason,
      metadata: {
        evaluationVersion: doc.metadata?.evaluationVersion || '1.0.0',
        model: doc.metadata?.model || 'unknown',
        provider: doc.metadata?.provider || 'unknown',
        evaluatedAt: doc.metadata?.evaluatedAt || new Date(),
        interviewDurationMinutes: doc.metadata?.interviewDurationMinutes || 0,
        totalQuestionsAnswered: doc.metadata?.totalQuestionsAnswered || 0,
      },
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private _toPersistence(entity: AIInterviewEvaluation): Partial<IAIInterviewEvaluationDocument> {
    const rawCompetencies = entity.competencies.map(c => ({
      name: c.name,
      category: c.category,
      score: c.score,
      status: c.status,
      explanation: c.explanation,
      evidence: [...c.evidence],
    }));

    const rawQuestions = entity.questionAnalyses.map(q => ({
      questionId: q.questionId,
      questionText: q.questionText,
      candidateAnswer: q.candidateAnswer,
      score: q.score,
      feedback: q.feedback,
      evidence: [...q.evidence],
      competencyCovered: q.competencyCovered,
    }));

    const hrDecision = entity.hrDecision ? {
      action: entity.hrDecision.action,
      decisionNotes: entity.hrDecision.decisionNotes,
      overriddenRecommendation: entity.hrDecision.overriddenRecommendation,
      overrideReason: entity.hrDecision.overrideReason,
      decidedBy: entity.hrDecision.decidedBy,
      decidedAt: entity.hrDecision.decidedAt,
    } : undefined;

    return {
      interviewId: new mongoose.Types.ObjectId(entity.interviewId),
      sessionId: new mongoose.Types.ObjectId(entity.sessionId),
      studentId: new mongoose.Types.ObjectId(entity.studentId),
      jobId: entity.jobId ? new mongoose.Types.ObjectId(entity.jobId) : undefined,
      companyId: new mongoose.Types.ObjectId(entity.companyId),
      overallScore: entity.overallScore,
      overallSummary: entity.overallSummary,
      competencies: rawCompetencies,
      strengths: [...entity.strengths],
      developmentAreas: [...entity.developmentAreas],
      questionAnalyses: rawQuestions,
      insufficientEvidenceAreas: [...entity.insufficientEvidenceAreas],
      recommendation: entity.recommendation,
      recommendationReasoning: entity.recommendationReasoning,
      confidence: entity.confidence,
      confidenceScore: entity.confidenceScore,
      confidenceReasoning: entity.confidenceReasoning,
      aiSuggestedActions: [...entity.aiSuggestedActions],
      hrDecision,
      status: entity.status,
      failureReason: entity.failureReason,
      metadata: {
        evaluationVersion: entity.metadata.evaluationVersion,
        model: entity.metadata.model,
        provider: entity.metadata.provider,
        evaluatedAt: entity.metadata.evaluatedAt,
        interviewDurationMinutes: entity.metadata.interviewDurationMinutes,
        totalQuestionsAnswered: entity.metadata.totalQuestionsAnswered,
      },
    };
  }

  async save(evaluation: AIInterviewEvaluation): Promise<AIInterviewEvaluation> {
    const data = this._toPersistence(evaluation);
    const updatedDoc = await AIInterviewEvaluationModel.findOneAndUpdate(
      { interviewId: data.interviewId },
      { $set: data },
      { upsert: true, new: true }
    );
    return this._toDomain(updatedDoc);
  }

  async findByInterviewId(interviewId: string): Promise<AIInterviewEvaluation | null> {
    if (!mongoose.Types.ObjectId.isValid(interviewId)) return null;
    const doc = await AIInterviewEvaluationModel.findOne({ interviewId: new mongoose.Types.ObjectId(interviewId) });
    return doc ? this._toDomain(doc) : null;
  }

  async findBySessionId(sessionId: string): Promise<AIInterviewEvaluation | null> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) return null;
    const doc = await AIInterviewEvaluationModel.findOne({ sessionId: new mongoose.Types.ObjectId(sessionId) });
    return doc ? this._toDomain(doc) : null;
  }

  async findById(id: string): Promise<AIInterviewEvaluation | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const doc = await AIInterviewEvaluationModel.findById(id);
    return doc ? this._toDomain(doc) : null;
  }

  async update(evaluation: AIInterviewEvaluation): Promise<AIInterviewEvaluation> {
    return this.save(evaluation);
  }

  async recordHRDecision(interviewId: string, decision: HRDecision): Promise<AIInterviewEvaluation | null> {
    if (!mongoose.Types.ObjectId.isValid(interviewId)) return null;
    const rawDecision = {
      action: decision.action,
      decisionNotes: decision.decisionNotes,
      overriddenRecommendation: decision.overriddenRecommendation,
      overrideReason: decision.overrideReason,
      decidedBy: decision.decidedBy,
      decidedAt: decision.decidedAt,
    };

    const doc = await AIInterviewEvaluationModel.findOneAndUpdate(
      { interviewId: new mongoose.Types.ObjectId(interviewId) },
      { $set: { hrDecision: rawDecision, updatedAt: new Date() } },
      { new: true }
    );

    return doc ? this._toDomain(doc) : null;
  }
}
