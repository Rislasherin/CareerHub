import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IGetHRProfileUseCase {
  execute(hrUserId: string): Promise<any>;
}

export class GetHRProfileUseCase implements IGetHRProfileUseCase {
  constructor(private readonly _hrUserRepository: IHRUserRepository) {}

  async execute(hrUserId: string) {
    const hrUser = await this._hrUserRepository.findById(hrUserId);
    
    if (!hrUser) {
      throw new AppError("HR User not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const { password, ...userWithoutPassword } = hrUser.toJSON();
    return userWithoutPassword;
  }
}
