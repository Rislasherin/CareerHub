import { NextFunction, Request, Response } from "express";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { UnauthorizedError } from "@application/errors/AuthError";

export class AuthMiddleware {
  constructor(private readonly jwtService: IJwtService) {}

  protect = (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Access token missing");
    }

    const token = authHeader.split(" ")[1];
    req.user = this.jwtService.verifyAccessToken(token);
    next();
  };
}
