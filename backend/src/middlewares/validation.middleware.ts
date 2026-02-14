import { RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { HttpException } from '../exceptions/httpException';

export const ValidationMiddleware = (schema: ZodSchema<any>, source: 'body' | 'query' | 'params' = 'body'): RequestHandler => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const validatedData = schema.parse(data);
      req[source] = validatedData; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new HttpException(400, `Validation Error: ${message}`));
      } else {
        next(error);
      }
    }
  };
};
