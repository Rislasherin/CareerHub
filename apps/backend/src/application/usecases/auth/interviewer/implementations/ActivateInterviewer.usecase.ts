import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { UserStatus } from "@domain/enums/user.status.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Interviewer } from "@domain/entities/Interviewer";

export interface IActivateInterviewerUseCase {
  execute(interviewerId: string, password: string): Promise<void>;
}

export class ActivateInterviewerUseCase implements IActivateInterviewerUseCase {
  constructor(
    private readonly _interviewerRepository: IInterviewerRepository,
    private readonly _bcryptService: IBcryptService
  ) {}

  async execute(interviewerId: string, password: string) {
    const interviewer = await this._interviewerRepository.findById(interviewerId);
    if (!interviewer) {
      throw new AppError("Interviewer not found", HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR);
    }

    if (interviewer.status !== UserStatus.PENDING) {
      throw new AppError("Account already active", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    const hashedPassword = await this._bcryptService.hash(password);

    const updatedInterviewer = Interviewer.create({
      ...interviewer.toJSON(),
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    await this._interviewerRepository.update(updatedInterviewer);
  }
}
