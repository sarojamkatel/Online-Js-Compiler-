import { NextFunction, Request, Response } from "express";
import { Schema } from "joi";
import { BadRequestError } from "../error/BadRequestError";

/**
 * Middleware to validate query parameters against a Joi schema.
 * @param schema - The Joi schema to validate the query parameters.
 * @returns A middleware function that validates the query parameters.
 */
export function validateReqQuery(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query);
    if (error) {
      next(new BadRequestError(error.message));
    }
    req.query = value;
    next();
  };
}

/**
 * Middleware to validate request body against a Joi schema.
 * @param schema - The Joi schema to validate the request body.
 * @returns A middleware function that validates the request body.
 */
export function validateReqBody(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      next(new BadRequestError(error.message));
    }
    req.body = value;
    next();
  };
}

/**
 * Middleware to validate request parameters against a Joi schema.
 * @param schema - The Joi schema to validate the request parameters.
 * @returns A middleware function that validates the request parameters.
 */
export function validateReqParams(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params);
    if (error) {
      next(new BadRequestError(error.message));
    }
    req.params = value;
    next();
  };
}
