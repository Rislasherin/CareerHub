import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ValidationError } from "@application/errors/validation.error";

type ClassConstructor<T extends object> = new (...args: any[]) => T;

export const validateDto = <T extends object>(dtoClass: ClassConstructor<T>) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body, {
      excludeExtraneousValues: true,
    });

    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors
        .map((error) => Object.values(error.constraints || {}))
        .flat()
        .join(", ");

      return next(new ValidationError(messages));
    }

    req.body = dto;
    next();
  };
};
