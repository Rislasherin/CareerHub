import { Interview } from '@domain/entities/Interview';
import { InterviewStatus } from '@domain/enums/InterviewStatus.enum';
import { InterviewType } from '@domain/enums/InterviewType.enum';
import { InterviewDifficulty } from '@domain/enums/InterviewDifficulty.enum';
import { InterviewConfiguration } from '@domain/value-objects/InterviewConfiguration';
import { InterviewDocument } from '@infrastructure/database/models/company/interview.model';

export const toInterviewEntity = (doc: InterviewDocument): Interview => {
  let configuration: InterviewConfiguration | undefined;
  if (doc.configuration) {
    const types = (doc.configuration.types && doc.configuration.types.length > 0)
      ? doc.configuration.types.map((t: string) => t as InterviewType)
      : [doc.type as InterviewType];

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

  return new Interview({
    id: doc._id.toString(),
    studentId: doc.studentId.toString(),
    jobId: doc.jobId.toString(),
    companyId: doc.companyId.toString(),
    type: doc.type as InterviewType,
    status: doc.status as InterviewStatus,
    scheduledAt: doc.scheduledAt,
    startedAt: doc.startedAt ?? null,
    completedAt: doc.completedAt ?? null,
    createdAt: doc.createdAt,
    durationMinutes: doc.durationMinutes,
    configuration,
  });
};

export const toInterviewPersistence = (entity: Interview): Record<string, unknown> => {
  return {
    studentId: entity.studentId,
    jobId: entity.jobId,
    companyId: entity.companyId,
    type: entity.type,
    status: entity.status,
    scheduledAt: entity.scheduledAt,
    startedAt: entity.startedAt,
    completedAt: entity.completedAt,
    durationMinutes: entity.getDurationMinutes(),
    configuration: entity.configuration ? entity.configuration.toJSON() : undefined,
  };
};
