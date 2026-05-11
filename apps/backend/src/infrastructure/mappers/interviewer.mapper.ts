import { Interviewer } from "@domain/entities/Interviewer";
import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";
import { InterviewerDocument } from "@infrastructure/database/models/company/interviewer.model";

export const toInterviewerEntity = (doc: InterviewerDocument): Interviewer => {
  return Interviewer.create({
    id: doc._id.toString(),
    companyId: doc.companyId,
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    password: doc.password,
    designation: doc.designation,
    specialization: doc.specialization,
    role: doc.role as Role,
    status: doc.status as UserStatus,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
};

export const toInterviewerPersistence = (entity: Interviewer) => {
  const props = entity.toJSON();

  return {
    companyId: props.companyId,
    firstName: props.firstName,
    lastName: props.lastName,
    email: props.email,
    password: props.password,
    designation: props.designation,
    specialization: props.specialization,
    role: props.role,
    status: props.status,
  };
};
