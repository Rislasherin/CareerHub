import { RegisterStudentRequestDto } from "@application/dtos/auth/student/Request/register.student.request.dto";

export interface IRegisterStudentUseCase {
  execute(dto: RegisterStudentRequestDto): Promise<void>;
}
