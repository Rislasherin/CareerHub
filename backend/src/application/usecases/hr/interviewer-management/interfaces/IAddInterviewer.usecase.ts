import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { IEmailService } from "@application/services/IEmailService";
import { Interviewer } from "@domain/entities/Interviewer";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Role } from "@domain/enums/Roles.enum";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { CrossRoleAuthService } from "@application/services/CrossRoleAuthService";

import { env } from "@infrastructure/config/env.validator";

export interface IAddInterviewerUseCase {
  execute(companyId: string, firstName: string, lastName: string, email: string): Promise<void>;
}
