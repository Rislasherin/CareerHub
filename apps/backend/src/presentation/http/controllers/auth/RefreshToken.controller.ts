import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

export class RefreshTokenController {
  constructor(private readonly jwtService: IJwtService) {}

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
    const payload = this.jwtService.verifyRefreshToken(refreshToken);

    // Issue a new access token
    const newAccessToken = this.jwtService.signAccessToken({
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

  logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    sendSuccess(res, null, "Logged out successfully");
  });
}
