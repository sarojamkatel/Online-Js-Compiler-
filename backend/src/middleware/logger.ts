import { NextFunction, Response } from "express";
import { Request } from "../interfaces/auth";
import loggerWithNameSpace from "../utils/logger";

const logger = loggerWithNameSpace("RequestLogger");

/**
 * Middleware to log incoming HTTP requests.
 * Logs the HTTP method and request URL.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function to pass control to.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  logger.info(`${req.method}: ${req.url}}`);
  next();
}
