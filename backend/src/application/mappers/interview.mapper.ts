import { Interview } from '@domain/entities/Interview';
import { InterviewStatus } from '@domain/enums/InterviewStatus.enum';
import { InterviewType } from '@domain/enums/InterviewType.enum';
import { InterviewDocument } from '@infrastructure/database/models/company/interview.model';


export const toInterviewEntity = (doc: InterviewDocument): Interview => {
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
  };
};
