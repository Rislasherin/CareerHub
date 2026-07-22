import { Interview, RescheduleRequest } from "@domain/entities/Interview";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { InterviewType } from "@domain/enums/InterviewType.enum";
import { InterviewDocument } from "@infrastructure/database/models/company/interview.model";

export const toInterviewEntity = (doc: InterviewDocument): Interview => {
  return Interview.create({
    id: doc._id.toString(),
    jobId: doc.jobId.toString(),
    applicationId: doc.applicationId.toString(),
    studentId: doc.studentId.toString(),
    companyId: doc.companyId.toString(),
    interviewerId: doc.interviewerId.toString(),
    title: doc.title,
    type: doc.type as InterviewType,
    roundNumber: (doc as InterviewDocument & { roundNumber?: number }).roundNumber ?? 1,
    status: doc.status as InterviewStatus,
    scheduledAt: doc.scheduledAt,
    durationMinutes: doc.durationMinutes,
    meetingLink: doc.meetingLink,
    feedback: doc.feedback,
    rescheduleRequest: doc.rescheduleRequest as RescheduleRequest | undefined,
    cancellationReason: doc.cancellationReason,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  });
};

export const toInterviewPersistence = (entity: Interview): Record<string, unknown> => {
  const props = entity.toJSON();
  return {
    jobId: props.jobId,
    applicationId: props.applicationId,
    studentId: props.studentId,
    companyId: props.companyId,
    interviewerId: props.interviewerId,
    title: props.title,
    type: props.type,
    roundNumber: props.roundNumber,
    status: props.status,
    scheduledAt: props.scheduledAt,
    durationMinutes: props.durationMinutes,
    meetingLink: props.meetingLink,
    feedback: props.feedback,
    rescheduleRequest: props.rescheduleRequest,
    cancellationReason: props.cancellationReason,
  };
};
