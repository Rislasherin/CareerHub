import { Role } from "@domain/enums/Roles.enum";

export interface JwtPayload {
  id: string;
  role: Role;
  orgId?: string;
  companyId?: string;
  type?: string;
}

export interface IJwtService {
  signAccessToken(payload: JwtPayload): string;
  signRefreshToken(payload: JwtPayload): string;
  verifyAccessToken(token: string): JwtPayload;
  verifyRefreshToken(token: string): JwtPayload;
}
