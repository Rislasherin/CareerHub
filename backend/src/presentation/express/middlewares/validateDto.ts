import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ValidationError } from "@application/errors/validation.error";

type ClassConstructor<T extends object> = new (...args: unknown[]) => T;

export const validateDto = <T extends object>(dtoClass: ClassConstructor<T>, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req[source], {
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

    req[source] = dto;
    next();
  };
};
