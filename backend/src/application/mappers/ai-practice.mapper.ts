import { AIPracticeInterviewDocument } from "@infrastructure/database/models/student/ai-practice.model";
import { AIPracticeInterview, AIPracticeQuestion } from "@domain/entities/ai-practice/AIPracticeInterview";
import { PracticeDifficulty } from "@domain/enums/PracticeDifficulty.enum";
import { PracticeInterviewStatus } from "@domain/enums/PracticeInterviewStatus.enum";

export const toAIPracticeInterviewEntity = (doc: AIPracticeInterviewDocument): AIPracticeInterview => {
  const questions: AIPracticeQuestion[] = (doc.questions || []).map((q: any) => ({
    id: q.id,
    text: q.text,
    topic: q.topic,
    candidateAnswer: q.candidateAnswer,
    score: q.score,
    feedback: q.feedback,
    createdAt: q.createdAt,
    answeredAt: q.answeredAt
  }));

  return new AIPracticeInterview({
    id: doc._id.toString(),
    studentId: doc.studentId.toString(),
    difficulty: doc.difficulty as PracticeDifficulty,
    topics: doc.topics,
    durationMinutes: doc.durationMinutes || undefined,
    startedAt: doc.startedAt || undefined,
    completedAt: doc.completedAt || undefined,
    finalFeedback: doc.finalFeedback || undefined,
    status: doc.status as PracticeInterviewStatus,
    questions,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  });
};

export const toAIPracticeInterviewPersistence = (entity: AIPracticeInterview): Record<string, unknown> => {
  return {
    studentId: entity.studentId,
    difficulty: entity.difficulty,
    topics: entity.topics,
    durationMinutes: entity.durationMinutes,
    startedAt: entity.startedAt,
    completedAt: entity.completedAt,
    finalFeedback: entity.finalFeedback,
    status: entity.status,
    questions: entity.questions.map(q => ({
      id: q.id,
      text: q.text,
      topic: q.topic,
      candidateAnswer: q.candidateAnswer,
      score: q.score,
      feedback: q.feedback,
      createdAt: q.createdAt,
      answeredAt: q.answeredAt
    }))
  };
};
