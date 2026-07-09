import { Interview, InterviewProps } from "@domain/entities/Interview";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { InterviewType } from "@domain/enums/InterviewType.enum";

export const toInterviewEntity = (doc: any): Interview => {
  return Interview.create({
    id: doc._id.toString(),
    jobId: doc.jobId.toString(),
    applicationId: doc.applicationId.toString(),
    studentId: doc.studentId.toString(),
    companyId: doc.companyId.toString(),
    interviewerId: doc.interviewerId.toString(),
    title: doc.title,
    type: doc.type as InterviewType,
    status: doc.status as InterviewStatus,
    scheduledAt: doc.scheduledAt,
    durationMinutes: doc.durationMinutes,
    meetingLink: doc.meetingLink,
    feedback: doc.feedback,
    rescheduleRequest: doc.rescheduleRequest,
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
    status: props.status,
    scheduledAt: props.scheduledAt,
    durationMinutes: props.durationMinutes,
    meetingLink: props.meetingLink,
    feedback: props.feedback,
    rescheduleRequest: props.rescheduleRequest,
  };
};
