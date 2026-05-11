import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Student } from "@domain/entities/student";
import { StudentDocument } from "@infrastructure/database/models/student/student.model";

export const toStudentEntity = (doc: StudentDocument): Student => {
  return Student.create({
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    password: doc.password,
    status: doc.status as UserStatus,
    collegeId: doc.collegeId,
    proofUrl: doc.proofUrl,
    isFirstLogin: doc.isFirstLogin,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
};

export const toStudentPersistence = (entity: Student) => {
  const props = entity.toJSON();
  return {
    firstName: props.firstName,
    lastName: props.lastName,
    email: props.email,
    password: props.password,
    status: props.status,
    collegeId: props.collegeId,
    proofUrl: props.proofUrl,
    isFirstLogin: props.isFirstLogin,
  };
};
