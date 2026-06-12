import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { ISuperAdminRepository } from "@domain/repositories/ISuperAdminRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Role } from "@domain/enums/Roles.enum";

export class RefreshTokenController {
  constructor(
    private readonly _jwtService: IJwtService,
    private readonly _studentRepository: IStudentRepository,
    private readonly _hrUserRepository: IHRUserRepository,
    private readonly _interviewerRepository: IInterviewerRepository,
    private readonly _collegeAdminRepository: ICollegeAdminRepository,
    private readonly _superAdminRepository: ISuperAdminRepository
  ) { }

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken: string | undefined = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError(
        "Refresh token not found",
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED
      );
    }

    // Verify the refresh token (throws if invalid/expired)
    const payload = this._jwtService.verifyRefreshToken(refreshToken) as any;

    // Check user status before refreshing
    let user: any;
    switch (payload.role) {
      case Role.STUDENT:
        user = await this._studentRepository.findById(payload.id);
        break;
      case Role.HR:
        user = await this._hrUserRepository.findById(payload.id);
        break;
      case Role.INTERVIEWER:
        user = await this._interviewerRepository.findById(payload.id);
        break;
      case Role.COLLEGE_ADMIN:
        user = await this._collegeAdminRepository.findById(payload.id);
        break;
      case Role.SUPER_ADMIN:
        user = await this._superAdminRepository.findById(payload.id);
        break;
    }

    if (!user || user.status === UserStatus.BLOCKED) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      throw new AppError(
        "Your account has been blocked or no longer exists.",
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED
      );
    }

    // Issue a new access token
    const newAccessToken = this._jwtService.signAccessToken({
      id: payload.id,
      role: payload.role,
      orgId: payload.orgId,
      companyId: payload.companyId,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    sendSuccess(res, null, "Token refreshed successfully");
  });

  status = asyncHandler(async (_req: Request, res: Response) => {
    // This is essentially a no-op that just returns success.
    // The actual status check happens in the AuthMiddleware that should protect this route.
    sendSuccess(res, _req.user, "Account is active");
  });

  logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    sendSuccess(res, null, "Logged out successfully");
  });
}
