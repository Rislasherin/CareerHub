import { Types } from "mongoose";
import { AIInterviewSessionDocument, IInterviewQuestionDocument } from "@infrastructure/database/models/company/ai-interview.model";
import { AIInterviewSession } from "@domain/entities/ai-interview/AIInterviewSession";
import { InterviewQuestion } from "@domain/entities/ai-interview/InterviewQuestion";
import { AnswerEvaluation } from "@domain/value-objects/AnswerEvaluation";
import { InterviewPhase } from "@domain/enums/InterviewPhase.enum";
import { QuestionType } from "@domain/enums/QuestionType.enum";
import { AnswerQuality } from "@domain/enums/AnswerQuality.enum";
import { InterviewType } from "@domain/enums/InterviewType.enum";
import { InterviewDifficulty } from "@domain/enums/InterviewDifficulty.enum";
import { InterviewConfiguration } from "@domain/value-objects/InterviewConfiguration";
import { InterviewPlan, InterviewPlanItem } from "@domain/value-objects/InterviewPlan";

export const toAIInterviewSessionEntity = (doc: AIInterviewSessionDocument): AIInterviewSession => {
  const questions = doc.questions.map((q: IInterviewQuestionDocument) => {
    let evaluation: AnswerEvaluation | undefined;
    if (q.evaluation) {
      evaluation = new AnswerEvaluation({
        score: q.evaluation.score,
        quality: q.evaluation.quality as AnswerQuality,
        feedback: q.evaluation.feedback,
        needsFollowUp: q.evaluation.needsFollowUp
      });
    }

    return new InterviewQuestion({
      id: q.id,
      text: q.text,
      type: q.type,
      context: q.context,
      category: q.category as InterviewType,
      candidateAnswer: q.candidateAnswer,
      evaluation
    });
  });

  let configuration: InterviewConfiguration | undefined;
  if (doc.configuration) {
    const types = (doc.configuration.types && doc.configuration.types.length > 0)
      ? doc.configuration.types.map((t: string) => t as InterviewType)
      : [InterviewType.TECHNICAL];

    configuration = new InterviewConfiguration({
      types,
      difficulty: (doc.configuration.difficulty as InterviewDifficulty) || InterviewDifficulty.MID,
      durationMinutes: doc.configuration.durationMinutes || doc.durationMinutes,
      skills: (doc.configuration.skills as string[]) || [],
      questionDistribution: doc.configuration.questionDistribution as any,
      customInstructions: (doc.configuration.customInstructions as string[]) || [],
      prohibitedTopics: (doc.configuration.prohibitedTopics as string[]) || [],
      evaluationCriteria: (doc.configuration.evaluationCriteria as string[]) || [],
    });
  }

  let interviewPlan: InterviewPlan | undefined;
  if (doc.interviewPlan && doc.interviewPlan.items && doc.interviewPlan.items.length > 0) {
    const items: InterviewPlanItem[] = doc.interviewPlan.items.map((i: any) => ({
      category: i.category as InterviewType,
      skillOrTopic: i.skillOrTopic,
      targetQuestions: i.targetQuestions,
      questionsAsked: i.questionsAsked || 0,
    }));
    interviewPlan = new InterviewPlan(items);
  }

  return new AIInterviewSession({
    id: doc._id.toString(),
    interviewId: doc.interviewId.toString(),
    studentId: doc.studentId.toString(),
    jobId: doc.jobId ? doc.jobId.toString() : undefined,
    phase: doc.phase,
    questions,
    startedAt: doc.startedAt,
    completedAt: doc.completedAt,
    durationMinutes: doc.durationMinutes,
    interviewContext: doc.interviewContext,
    configuration,
    interviewPlan,
    currentTopic: doc.currentTopic,
    coveredTopics: doc.coveredTopics || [],
    followUpCount: doc.followUpCount,
  });
};

export const toAIInterviewSessionPersistence = (entity: AIInterviewSession): Record<string, unknown> => {
  return {
    interviewId: new Types.ObjectId(entity.interviewId),
    studentId: new Types.ObjectId(entity.studentId),
    jobId: entity.jobId ? new Types.ObjectId(entity.jobId) : undefined,
    phase: entity.phase,
    questions: entity.questions.map((q) => {
      const qDoc: Record<string, unknown> = {
        id: q.id,
        text: q.text,
        type: q.type,
        context: q.context,
        category: q.category,
        candidateAnswer: q.candidateAnswer
      };
      if (q.evaluation) {
        qDoc.evaluation = {
          score: q.evaluation.score,
          quality: q.evaluation.quality,
          feedback: q.evaluation.feedback,
          needsFollowUp: q.evaluation.needsFollowUp
        };
      }
      return qDoc;
    }),
    startedAt: entity.startedAt,
    completedAt: entity.completedAt,
    durationMinutes: entity.getDurationMinutes(),
    interviewContext: entity.interviewContext,
    configuration: entity.configuration ? entity.configuration.toJSON() : undefined,
    interviewPlan: entity.interviewPlan ? { items: entity.interviewPlan.toJSON() } : undefined,
    currentTopic: entity.currentTopic,
    coveredTopics: [...entity.coveredTopics],
    followUpCount: entity.followUpCount,
  };
};
