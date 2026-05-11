import { GetPendingStudentsUseCase } from "@application/usecases/college/student-management/GetPendingStudents.usecase";
import { ApproveStudentUseCase } from "@application/usecases/college/student-management/ApproveStudent.usecase";
import { RejectStudentUseCase } from "@application/usecases/college/student-management/RejectStudent.usecase";
import { studentRepository } from "@infrastructure/di/infra.container";
import { StudentManagementController } from "@presentation/http/controllers/college/student.management.controller";

export const makeGetPendingStudentsUseCase = () => {
  return new GetPendingStudentsUseCase(studentRepository);
};

export const makeApproveStudentUseCase = () => {
  return new ApproveStudentUseCase(studentRepository);
};

export const makeRejectStudentUseCase = () => {
  return new RejectStudentUseCase(studentRepository);
};

export const makeStudentManagementController = () => {
  return new StudentManagementController(
    makeGetPendingStudentsUseCase(),
    makeApproveStudentUseCase(),
    makeRejectStudentUseCase()
  );
};
