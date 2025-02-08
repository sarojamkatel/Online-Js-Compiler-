import { NextFunction, Response } from "express";
import HttpStatusCodes from "http-status-codes";
import { ForbiddenError } from "../error/ForbiddenError";
import * as UserService from "../service/user";
import loggerWithNameSpace from "../utils/logger";
const logger = loggerWithNameSpace("UserController");
import { Request } from "../interfaces/auth";

/**
 * Retrieves a list of users based on query parameters.
 * @param {Request<any, any, any, GetUserQuery>} req - The request object containing query parameters.
 * @param {Response} res - The response object to send the user data.
 * @returns {Promise<void>}
 */
export async function getUsers(
  req: Request,
  res: Response
) {
  const query = req.query;
  const data = await UserService.getUsers(query);
  logger.info("Called getUsers");
  res.status(HttpStatusCodes.OK).json(data);
}

/**
 * Retrieves a specific user by their ID.
 * @param {Request} req - The request object containing the user ID in params.
 * @param {Response} res - The response object to send the user data.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>}
 */
export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const data = await UserService.getUserById(id);
    logger.info("Called getUserById");
    res.status(HttpStatusCodes.OK).json(data);
  } catch (e) {
    next(e);
  }
}

/**
 * Updates the password for a user.
 * @param {Request} req - The request object containing the user email and passwords in the body.
 * @param {Response} res - The response object to send the result of the password update.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>}
 */
export async function updaePassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.userId
    await UserService.updatePassword(userId, oldPassword, newPassword);
    res.status(HttpStatusCodes.OK).json("Update user password successful");
    logger.info("Called update user password");
  } catch (e) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({ error: e.message });
    next(e);
  }
}

/**
 * Deletes a user by their ID.
 * @param {Request} req - The request object containing the user ID in params.
 * @param {Response} res - The response object to send the result of the user deletion.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>}
 */
export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const deleteResult = await UserService.deleteUser(id);

    if (deleteResult) {
      res
        .status(HttpStatusCodes.OK)
        .json({ message: `User with id ${id} has been deleted` });
      logger.info("Called delete user");
    } else {
      res
        .status(HttpStatusCodes.NOT_FOUND)
        .json({ error: `User with id ${id} not found` });
    }
  } catch (e) {
    if (e instanceof ForbiddenError) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ error: e.message });
    } else {
      next(e);
    }
  }
}
