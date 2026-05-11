import { Response } from "express";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode: HttpStatus = HttpStatus.OK
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
