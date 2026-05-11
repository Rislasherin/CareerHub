import { JwtPayload } from "@application/interfaces/IJwt.service";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
