import { NextFunction, Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";
import config from "../config";
import * as authService from "../service/auth";
import loggerWithNameSpace from "../utils/logger";

import HttpStatusCodes from "http-status-codes";
const logger = loggerWithNameSpace("UserController");

/**
 * Handles user signup.
 * @param {Request} req - The request object containing user signup details.
 * @param {Response} res - The response object to send the result of the signup.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>}
 */
export async function signup(req: Request, res: Response, next: NextFunction) {
  const { body } = req;
  const { email, password, role } = body;
  if (role) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: "You cannot provide role",
    });
    return;
  }

  if (!email || !password) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: "All the required fields are not provided",
    });
    return;
  }
  try {
    const data = await authService.signup(body);
    if (data) {
      logger.info("Called signup");
      res.status(HttpStatusCodes.OK).json({
        message: "user created",
        ...body,
      });
    }
  } catch (e) {
    logger.error("Error during signup: ", e);
    next(e);
  }
}

/**
 * Handles user login.
 * @param {Request} req - The request object containing user login details.
 * @param {Response} res - The response object to send the result of the login.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>}
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { body } = req;
    const data = await authService.login(body);

    res.status(HttpStatusCodes.OK).json(data);
  } catch (e) {
    next(e);
  }
}

/**
 * Refreshes the access token using the provided refresh token.
 * @param {Request} req - The request object containing the authorization header with the refresh token.
 * @param {Response} res - The response object to send the new access token and refresh token.
 * @returns {Promise<void>}
 */
export async function refresh(req: Request, res: Response) {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(HttpStatusCodes.NOT_FOUND).json({
      error: "Invalid token",
    });
    return;
  }

  const token = authorization.split(" ");

  if (token.length !== 2 || token[0] !== "Bearer") {
    res.status(HttpStatusCodes.NOT_FOUND).json({
      error: "Invalid method",
    });
    return;
  }

  const refreshToken = token[1];
  verify(refreshToken, config.jwt.secret!, async (error, data) => {
    if (error) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        error: error.message,
      });
    }

    if (typeof data !== "string" && data) {
      const payload = {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      // create new accessToken
      const accessToken = await sign(payload, config.jwt.secret!, {
        expiresIn: config.jwt.acccessTokenExpiraryMS,
      });
      const refreshToken = token[1];
      logger.info("Called refresh token");
      res.status(HttpStatusCodes.OK).json({
        accessToken,
        refreshToken,
      });
    }
  });
}
