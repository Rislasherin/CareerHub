import { IGenerateInterviewEvaluationUseCase, GenerateEvaluationResult } from '../interfaces/IGenerateInterviewEvaluationUseCase';
import { IAIInterviewRepository } from '@domain/repositories/ai-interview/IAIInterviewRepository';
import { IInterviewRepository } from '@domain/repositories/IInterviewRepository';
import { IJobRepository } from '@domain/repositories/IJobRepository';
import { IAIInterviewEvaluationRepository } from '@domain/repositories/ai-interview/IAIInterviewEvaluationRepository';
import { IInterviewEvaluationLLMService, IEvaluationTranscriptItem } from '@application/interfaces/ai-interview/IInterviewEvaluationLLMService';
import { AIInterviewEvaluation } from '@domain/entities/ai-interview/AIInterviewEvaluation';
import { CompetencyEvaluation } from '@domain/value-objects/CompetencyEvaluation';
import { QuestionEvaluationAnalysis } from '@domain/value-objects/QuestionEvaluationAnalysis';
import { AIRecommendation } from '@domain/enums/AIRecommendation.enum';
import { EvaluationConfidence } from '@domain/enums/EvaluationConfidence.enum';
import { EvaluationStatus } from '@domain/enums/EvaluationStatus.enum';
import { AppError } from '@application/errors/AppError';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { ErrorCode } from '@domain/enums/ErrorCodes.enum';
import { Logger, LogCategory } from '../../../../infrastructure/logger/logger';
import { v4 as uuidv4 } from 'uuid';

export class GenerateInterviewEvaluationUseCase implements IGenerateInterviewEvaluationUseCase {
  constructor(
    private readonly _aiInterviewRepository: IAIInterviewRepository,
    private readonly _interviewRepository: IInterviewRepository,
    private readonly _jobRepository: IJobRepository,
    private readonly _evaluationRepository: IAIInterviewEvaluationRepository,
    private readonly _evaluationLLMService: IInterviewEvaluationLLMService
  ) {}

  async execute(params: {
    sessionId: string;
    interviewId?: string;
    forceRegenerate?: boolean;
  }): Promise<GenerateEvaluationResult> {
    const { sessionId, interviewId: passedInterviewId, forceRegenerate = false } = params;

    Logger.info(LogCategory.SYSTEM_INFO, `[GenerateInterviewEvaluationUseCase] Starting evaluation generation for session ${sessionId || 'none'}, interview ${passedInterviewId || 'none'}`);

    // 1. Fetch AI Interview Session safely
    let session = null;
    if (sessionId && sessionId.trim().length > 0) {
      session = await this._aiInterviewRepository.findById(sessionId);
    }
    if (!session && passedInterviewId && passedInterviewId.trim().length > 0) {
      session = await this._aiInterviewRepository.findByInterviewId(passedInterviewId);
    }

    if (!session) {
      Logger.error(LogCategory.AI_INTERVIEW_DB_FAILURE, `Session not found for sessionId: ${sessionId}, interviewId: ${passedInterviewId}`);
      throw new AppError(`Interview session not found for interview: ${passedInterviewId || sessionId}`, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const interviewId = passedInterviewId || session.interviewId;

    // 2. Idempotency check: if evaluation already exists
    const existingEvaluation = await this._evaluationRepository.findByInterviewId(interviewId);
    if (existingEvaluation && !forceRegenerate) {
      if (existingEvaluation.status === EvaluationStatus.COMPLETED) {
        Logger.info(LogCategory.SYSTEM_INFO, `[GenerateInterviewEvaluationUseCase] Evaluation already completed for interview ${interviewId}. Returning existing evaluation.`);
        return { status: 'ALREADY_COMPLETED', evaluation: existingEvaluation };
      }
      if (existingEvaluation.status === EvaluationStatus.EVALUATING) {
        Logger.info(LogCategory.SYSTEM_INFO, `[GenerateInterviewEvaluationUseCase] Evaluation currently in progress for interview ${interviewId}. Returning existing evaluating state.`);
        return { status: 'ALREADY_IN_PROGRESS', evaluation: existingEvaluation };
      }
      if (existingEvaluation.status === EvaluationStatus.FAILED) {
        Logger.error(LogCategory.SYSTEM_INFO, `[GenerateInterviewEvaluationUseCase] Evaluation permanently failed for interview ${interviewId}. Aborting.`);
        return { status: 'FAILED', message: existingEvaluation.failureReason || 'Evaluation permanently failed due to an error in a previous phase.' };
      }
    }

    // 3. Fetch Parent Interview & Job Details
    const parentInterview = await this._interviewRepository.findById(interviewId);
    if (!parentInterview) {
      Logger.error(LogCategory.AI_INTERVIEW_DB_FAILURE, `Parent interview not found: ${interviewId}`);
      throw new AppError(`Parent interview not found: ${interviewId}`, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    let evaluatingEntity: AIInterviewEvaluation | undefined;
    // 3.1 Persist interim EVALUATING status
    try {
      evaluatingEntity = new AIInterviewEvaluation({
        id: existingEvaluation?.id || uuidv4(),
        interviewId,
        sessionId: session.id,
        studentId: session.studentId,
        jobId: session.jobId || parentInterview.jobId,
        companyId: parentInterview.companyId,
        overallScore: null,
        overallSummary: 'Interview evaluation is currently in progress...',
        competencies: [],
        strengths: [],
        developmentAreas: [],
        questionAnalyses: [],
        insufficientEvidenceAreas: [],
        recommendation: AIRecommendation.CONSIDER,
        recommendationReasoning: 'Evaluation in progress',
        confidence: EvaluationConfidence.MEDIUM,
        confidenceScore: 50,
        confidenceReasoning: 'Evaluation in progress',
        aiSuggestedActions: [],
        status: EvaluationStatus.EVALUATING,
        metadata: {
          evaluationVersion: '1.0.0',
          model: 'evaluating',
          provider: 'system',
          evaluatedAt: new Date(),
          interviewDurationMinutes: session.getDurationMinutes(),
          totalQuestionsAnswered: 0,
        },
      });
      await this._evaluationRepository.save(evaluatingEntity);
      Logger.info(LogCategory.SYSTEM_INFO, `[GenerateInterviewEvaluationUseCase] Persisted intermediate EVALUATING state for interview ${interviewId}`);
    } catch (interimErr) {
      Logger.warn(LogCategory.SYSTEM_INFO, `[GenerateInterviewEvaluationUseCase] Could not persist interim EVALUATING state:`, interimErr);
    }

    let jobTitle = 'Software Professional';
    let jobDescription = 'General Technical Role';
    let experienceLevel = 'MID';
    let requiredSkills: string[] = ['Problem Solving', 'Technical Fundamentals', 'Communication'];
    let preferredSkills: string[] = [];

    if (session.jobId) {
      try {
        const job = await this._jobRepository.findById(session.jobId);
        if (job) {
          jobTitle = job.title;
          jobDescription = job.description || jobDescription;
          experienceLevel = job.experienceLevel || experienceLevel;
          if (job.requiredSkills && job.requiredSkills.length > 0) {
            requiredSkills = [...job.requiredSkills];
          }
          if (job.preferredSkills && job.preferredSkills.length > 0) {
            preferredSkills = [...job.preferredSkills];
          }
        }
      } catch (err) {
        Logger.warn(LogCategory.SYSTEM_INFO, `[GenerateInterviewEvaluationUseCase] Failed to fetch job details for ${session.jobId}:`, err);
      }
    }

    // Also include skills from session configuration if present
    if (session.configuration?.skills && session.configuration.skills.length > 0) {
      for (const skill of session.configuration.skills) {
        if (!requiredSkills.includes(skill)) {
          requiredSkills.push(skill);
        }
      }
    }

    // 4. Extract Answered Questions and Transcript
    const questions = session.questions;
    const transcriptItems: IEvaluationTranscriptItem[] = [];
    const missingEvaluations = [];
    
    let dbFetchToExtractStart = performance.now();

    for (const q of questions) {
      if (q.candidateAnswer && q.candidateAnswer.trim().length > 0) {
        if (!q.evaluation && !forceRegenerate) {
           missingEvaluations.push(q.id);
        }
        transcriptItems.push({
          questionId: q.id,
          questionText: q.text,
          candidateAnswer: q.candidateAnswer.trim(),
          topic: q.context,
          category: q.type,
          quality: q.evaluation?.quality,
          singleScore: q.evaluation?.score,
          feedback: q.evaluation?.feedback,
        });
      }
    }
    
    if (missingEvaluations.length > 0) {
       Logger.warn(LogCategory.SYSTEM_INFO, `[GenerateInterviewEvaluationUseCase] Questions missing evaluation: ${missingEvaluations.length}. Requeueing full evaluation.`);
       try {
         const baseEntity = existingEvaluation || evaluatingEntity;
         if (baseEntity) {
           baseEntity.markAsPending();
           await this._evaluationRepository.update(baseEntity);
         }
       } catch (err) {
         Logger.warn(LogCategory.SYSTEM_INFO, `Could not revert status to PENDING:`, err);
       }
       return { status: 'WAITING_FOR_ANSWERS', message: `Missing evaluation for ${missingEvaluations.length} questions` };
    }

    // 5. Build Target Rubric Competencies from Job Requirements
    const targetRubricCompetencies: Array<{ name: string; category: string; description: string }> = [];

    for (const skill of requiredSkills) {
      targetRubricCompetencies.push({
        name: skill,
        category: 'Core Competency',
        description: `Practical and theoretical understanding of ${skill}`,
      });
    }

    for (const pref of preferredSkills) {
      if (!targetRubricCompetencies.some(c => c.name.toLowerCase() === pref.toLowerCase())) {
        targetRubricCompetencies.push({
          name: pref,
          category: 'Preferred Competency',
          description: `Knowledge or application of ${pref}`,
        });
      }
    }

    // Always include standard behavioral & communication competencies
    if (!targetRubricCompetencies.some(c => c.name.toLowerCase() === 'communication')) {
      targetRubricCompetencies.push({
        name: 'Technical Communication',
        category: 'Professional Skills',
        description: 'Ability to articulate concepts, reasoning, and technical decisions clearly',
      });
    }
    if (!targetRubricCompetencies.some(c => c.name.toLowerCase().includes('problem solving'))) {
      targetRubricCompetencies.push({
        name: 'Problem Solving & Critical Thinking',
        category: 'Core Competency',
        description: 'Approach to decomposing problems, identifying edge cases, and reasoning through solutions',
      });
    }

    // 6. Handle Edge Case: Zero candidate answers
    if (transcriptItems.length === 0) {
      Logger.warn(LogCategory.SYSTEM_INFO, `[GenerateInterviewEvaluationUseCase] Session ${sessionId} has 0 recorded answers. Generating zero-evidence evaluation.`);
      const zeroEvaluation = new AIInterviewEvaluation({
        id: existingEvaluation?.id || uuidv4(),
        interviewId,
        sessionId,
        studentId: session.studentId,
        jobId: session.jobId || parentInterview.jobId,
        companyId: parentInterview.companyId,
        overallScore: 0,
        overallSummary: 'The candidate did not provide any spoken or recorded answers during the interview.',
        competencies: targetRubricCompetencies.map(c => new CompetencyEvaluation({
          name: c.name,
          category: c.category,
          score: null,
          status: 'INSUFFICIENT_EVIDENCE',
          explanation: 'No answers were recorded during the interview session.',
          evidence: [],
        })),
        strengths: [],
        developmentAreas: ['No responses provided during the interview session.'],
        questionAnalyses: [],
        insufficientEvidenceAreas: targetRubricCompetencies.map(c => c.name),
        recommendation: AIRecommendation.DO_NOT_PROCEED,
        recommendationReasoning: 'Unable to assess candidate competencies as no answers were provided.',
        confidence: EvaluationConfidence.HIGH,
        confidenceScore: 90,
        confidenceReasoning: 'Clear absence of candidate responses during the scheduled session.',
        aiSuggestedActions: ['Do not proceed with this candidate or verify if candidate experienced technical difficulties.'],
        status: EvaluationStatus.COMPLETED,
        metadata: {
          evaluationVersion: '1.0.0',
          model: 'rule-based',
          provider: 'system',
          evaluatedAt: new Date(),
          interviewDurationMinutes: session.getDurationMinutes(),
          totalQuestionsAnswered: 0,
        },
      });

      const savedZero = await this._evaluationRepository.save(zeroEvaluation);
      return { status: 'STARTED_AND_COMPLETED', evaluation: savedZero };
    }

    // 7. Execute LLM Multi-Competency Evidence-Based Evaluation
    try {
      const t_llm_start = performance.now();
      const llmOutput = await this._evaluationLLMService.evaluateFullInterview({
        jobTitle,
        jobDescription,
        experienceLevel,
        requiredSkills,
        preferredSkills,
        targetRubricCompetencies,
        transcript: transcriptItems,
        totalInterviewDurationMinutes: session.getDurationMinutes(),
      });
      const t_llm_end = performance.now();
      Logger.info(LogCategory.SYSTEM_INFO, `[GenerateInterviewEvaluationUseCase] LATENCY Full LLM evaluation took ${(t_llm_end - t_llm_start).toFixed(2)}ms`);

      // 8. Map to Domain Value Objects
      const domainCompetencies: CompetencyEvaluation[] = llmOutput.competencies.map(c => {
        return new CompetencyEvaluation({
          name: c.name,
          category: c.category,
          score: c.status === 'EVALUATED' && c.score !== null ? c.score : null,
          status: c.status,
          explanation: c.explanation,
          evidence: c.evidence,
        });
      });

      // Construct domainQuestions directly from local transcriptItems to avoid duplicate LLM work
      const domainQuestions: QuestionEvaluationAnalysis[] = transcriptItems.map(q => {
        return new QuestionEvaluationAnalysis({
          questionId: q.questionId,
          questionText: q.questionText,
          candidateAnswer: q.candidateAnswer,
          score: q.singleScore ?? 0,
          feedback: q.feedback || q.quality || 'No detailed feedback available.',
          evidence: [], // Evidence can be omitted per question if aggregated at competency level
          competencyCovered: q.topic || q.category,
        });
      });

      // 9. Calculate overallScore fallback if LLM omitted it
      let finalOverallScore = llmOutput.overallScore;
      if (finalOverallScore === null) {
        const evaluatedComps = domainCompetencies.filter(c => c.score !== null);
        if (evaluatedComps.length > 0) {
          const sum = evaluatedComps.reduce((acc, c) => acc + (c.score || 0), 0);
          finalOverallScore = Math.round(sum / evaluatedComps.length);
        }
      }

      // 10. Construct Final Domain Entity
      const evaluationEntity = new AIInterviewEvaluation({
        id: existingEvaluation?.id || uuidv4(),
        interviewId,
        sessionId,
        studentId: session.studentId,
        jobId: session.jobId || parentInterview.jobId,
        companyId: parentInterview.companyId,
        overallScore: finalOverallScore,
        overallSummary: llmOutput.overallSummary,
        competencies: domainCompetencies,
        strengths: llmOutput.strengths,
        developmentAreas: llmOutput.developmentAreas,
        questionAnalyses: domainQuestions,
        insufficientEvidenceAreas: llmOutput.insufficientEvidenceAreas,
        recommendation: llmOutput.recommendation,
        recommendationReasoning: llmOutput.recommendationReasoning,
        confidence: llmOutput.confidence,
        confidenceScore: llmOutput.confidenceScore,
        confidenceReasoning: llmOutput.confidenceReasoning,
        aiSuggestedActions: llmOutput.aiSuggestedActions,
        status: EvaluationStatus.COMPLETED,
        metadata: {
          evaluationVersion: '1.0.0',
          model: llmOutput.modelInfo.model,
          provider: llmOutput.modelInfo.provider,
          evaluatedAt: new Date(),
          interviewDurationMinutes: session.getDurationMinutes(),
          totalQuestionsAnswered: transcriptItems.length,
        },
      });

      const t_save_start = performance.now();
      const saved = await this._evaluationRepository.save(evaluationEntity);
      const t_save_end = performance.now();
      Logger.info(LogCategory.SYSTEM_INFO, `[GenerateInterviewEvaluationUseCase] LATENCY Save to MongoDB took ${(t_save_end - t_save_start).toFixed(2)}ms`);

      Logger.info(LogCategory.SYSTEM_INFO, `[GenerateInterviewEvaluationUseCase] Evaluation successfully saved for interview ${interviewId} (Overall score: ${saved.overallScore}, Recommendation: ${saved.recommendation})`);
      return { status: 'STARTED_AND_COMPLETED', evaluation: saved };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(LogCategory.SYSTEM_ERROR, `[GenerateInterviewEvaluationUseCase] Evaluation generation failed for session ${sessionId}:`, error);
      
      try {
        const failedEntity = new AIInterviewEvaluation({
          id: existingEvaluation?.id || uuidv4(),
          interviewId,
          sessionId: session.id,
          studentId: session.studentId,
          jobId: session.jobId || parentInterview.jobId,
          companyId: parentInterview.companyId,
          overallScore: null,
          overallSummary: `Evaluation failed to generate: ${errorMsg}`,
          competencies: [],
          strengths: [],
          developmentAreas: [],
          questionAnalyses: [],
          insufficientEvidenceAreas: [],
          recommendation: AIRecommendation.CONSIDER,
          recommendationReasoning: 'Evaluation generation encountered an error.',
          confidence: EvaluationConfidence.LOW,
          confidenceScore: 0,
          confidenceReasoning: 'Evaluation failed',
          aiSuggestedActions: ['Please retry evaluation recalculation.'],
          status: EvaluationStatus.FAILED,
          failureReason: errorMsg,
          metadata: {
            evaluationVersion: '1.0.0',
            model: 'failed',
            provider: 'system',
            evaluatedAt: new Date(),
            interviewDurationMinutes: session.getDurationMinutes(),
            totalQuestionsAnswered: transcriptItems.length,
          },
        });
        await this._evaluationRepository.save(failedEntity);
        Logger.info(LogCategory.SYSTEM_INFO, `[GenerateInterviewEvaluationUseCase] Persisted FAILED state for interview ${interviewId}`);
      } catch (saveFailedErr) {
        Logger.error(LogCategory.SYSTEM_ERROR, `[GenerateInterviewEvaluationUseCase] Could not persist FAILED state for interview ${interviewId}:`, saveFailedErr);
      }

      return { status: 'FAILED', message: errorMsg };
    }
  }
}
