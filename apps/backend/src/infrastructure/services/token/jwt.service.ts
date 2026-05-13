import jwt, { JsonWebTokenError, SignOptions, TokenExpiredError } from "jsonwebtoken";
import { IJwtService, JwtPayload } from "@application/interfaces/IJwt.service";
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
} from "@infrastructure/config/jwt.constants";
import { TokenExpiredCustomError, TokenInvalidError } from "@application/errors/AuthError";

export class JwtService implements IJwtService {
  private _accessOptions: SignOptions = { expiresIn: JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"] };
  private _refreshOptions: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] };

  signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_ACCESS_SECRET, this._accessOptions);
  }

  signRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, this._refreshOptions);
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
    } catch (error) {
      return this.handleJwtError(error);
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
    } catch (error) {
      return this.handleJwtError(error);
    }
  }

  generateResetToken(payload: any): string {
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "1h" });
  }

  verifyResetToken(token: string): any {
    try {
      return jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (error) {
      return this.handleJwtError(error);
    }
  }

  private handleJwtError(error: unknown): never {
    if (error instanceof TokenExpiredError) {
      throw new TokenExpiredCustomError();
    }
    if (error instanceof JsonWebTokenError) {
      throw new TokenInvalidError();
    }
    throw new TokenInvalidError();
  }
}
