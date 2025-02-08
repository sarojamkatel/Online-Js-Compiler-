import { NextFunction, Response } from "express";
import HttpsStatusCode from "http-status-codes";
import { BadRequestError } from "../error/BadRequestError";
import ConflictError from "../error/ConflictError";
import { ForbiddenError } from "../error/ForbiddenError";
import NotFoundError from "../error/NotFoundError";
import { UnauthenticatedError } from "../error/UnauthenticateError";
import { UnauthorizeError } from "../error/UnauthorizedError";
import { Request } from "../interfaces/auth";
import loggerWithNameSpace from "../utils/logger";
const logger = loggerWithNameSpace("ErrorHandler");

/**
 * Middleware to handle 404 Not Found errors.
 * @param req - The request object.
 * @param res - The response object.
 */
export function notFoundError(req: Request, res: Response) {
  return res.status(HttpsStatusCode.NOT_FOUND).json({
    message: "not found",
  });
}

/**
 * Generic error handler middleware.
 * @param error - The error object.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export function genericErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error.stack) {
    logger.error(error.stack);
  }
  if (error instanceof UnauthenticatedError) {
    return res.status(HttpsStatusCode.UNAUTHORIZED).json({
      message: error.message,
    });
  }
  // put extra features in here
  if (error instanceof NotFoundError) {
    return res.status(HttpsStatusCode.NOT_FOUND).json({
      message: error.message,
    });
  }
  if (error instanceof ConflictError) {
    return res.status(HttpsStatusCode.CONFLICT).json({
      message: error.message,
    });
  }
  if (error instanceof UnauthorizeError) {
    return res.status(HttpsStatusCode.UNAUTHORIZED).json({
      message: error.message,
    });
  }
  if (error instanceof BadRequestError) {
    return res.status(HttpsStatusCode.BAD_REQUEST).json({
      message: error.message,
    });
  }
  if (error instanceof ForbiddenError) {
    return res.status(HttpsStatusCode.FORBIDDEN).json({
      message: error.message,
    });
  }
  return res.status(HttpsStatusCode.INTERNAL_SERVER_ERROR).json({
    message: "Internal server Error",
    stack: error.stack,
  });
}
