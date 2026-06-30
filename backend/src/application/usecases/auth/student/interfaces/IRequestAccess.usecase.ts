import { RequestAccessDto } from "@application/dtos/auth/student/Request/RequestAccess.dto";

export interface IRequestAccessUseCase {
  execute(dto: RequestAccessDto): Promise<void>;
}
