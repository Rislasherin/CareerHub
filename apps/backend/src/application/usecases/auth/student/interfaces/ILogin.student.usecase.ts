import { StudentLoginRequestDto } from "@application/dtos/auth/student/Request/login.student.request.dto";
import { StudentLoginResponseDto } from "@application/dtos/auth/student/Response/login.student.response.dto";

export interface ILoginStudentUsescase {
  execute(dto: StudentLoginRequestDto): Promise<StudentLoginResponseDto>;
}
