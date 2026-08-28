import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HRUser } from "@domain/entities/HRUser";

export interface IUpdateHRProfileUseCase {
  execute(hrUserId: string, data: { firstName?: string; lastName?: string; designation?: string }): Promise<any>;
}

export class UpdateHRProfileUseCase implements IUpdateHRProfileUseCase {
  constructor(private readonly _hrUserRepository: IHRUserRepository) {}

  async execute(hrUserId: string, data: { firstName?: string; lastName?: string; designation?: string }) {
    const hrUser = await this._hrUserRepository.findById(hrUserId);
    
    if (!hrUser) {
      throw new AppError("HR User not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const updatedProps = hrUser.toJSON();
    if (data.firstName !== undefined) updatedProps.firstName = data.firstName;
    if (data.lastName !== undefined) updatedProps.lastName = data.lastName;
    if (data.designation !== undefined) updatedProps.designation = data.designation;

    // We do NOT update email or password here to prevent mass assignment
    
    // Convert back to domain entity properties structure, but we just pass the object to the repo
    const updatedEntity = await this._hrUserRepository.update(hrUserId, HRUser.create(updatedProps));
    
    const { password, ...userWithoutPassword } = updatedEntity.toJSON ? updatedEntity.toJSON() : updatedEntity as any;
    return userWithoutPassword;
  }
}
