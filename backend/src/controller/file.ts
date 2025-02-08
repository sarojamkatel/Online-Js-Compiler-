import { NextFunction, Response } from "express";
import HttpStatusCodes from "http-status-codes";
import { Request } from "../interfaces/auth";
import * as fileService from "../service/file";
import loggerWithNameSpace from "../utils/logger";
const logger = loggerWithNameSpace("UserController");

/**
 * Retrieves all files for the authenticated user.
 * @param {Request} req - The request object containing user information.
 * @param {Response} res - The response object to send the file data.
 * @returns {Promise<void>}
 */
export async function getFile(req: Request, res: Response) {
  const { userId } = req.user!;
  const data = await fileService.getFiles(userId);
  logger.info("Called getFile");
  res.status(HttpStatusCodes.OK).json({ data });
}

/**
 * Retrieves all files for a specific user by user ID.
 * @param {Request} req - The request object containing the user ID in params.
 * @param {Response} res - The response object to send the file data.
 * @returns {Promise<void>}
 */
export async function getUserFile(req: Request, res: Response) {
  const { userId } = req.params!;
  const data = await fileService.getFiles(userId);
  logger.info("Called getFile");
  res.status(HttpStatusCodes.OK).json({ data });
}

/**
 * Creates a new file for the authenticated user.
 * @param {Request} req - The request object containing the file details in the body.
 * @param {Response} res - The response object to send the result of file creation.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>}
 */
export function createFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { body } = req;
    const { userId } = req.user!;

    fileService.createFile(body.fileName, userId, body.fileData);
    logger.info("Called createFile");
    res.status(HttpStatusCodes.OK).json({
      message: "task created ",
      ...body,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Renames an existing file for the authenticated user.
 * @param {Request} req - The request object containing old and new file names in the body.
 * @param {Response} res - The response object to send the result of file renaming.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>}
 */
export async function renameFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { oldFileName, newFileName } = req.body;
    const { userId } = req.user!;
    await fileService.updateFile(oldFileName, newFileName, userId);
    logger.info(`File renamed from ${oldFileName} to ${newFileName}`);

    res.status(HttpStatusCodes.OK).json({
      message: "task updated",
      oldFileName,
      newFileName,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Deletes a file for the authenticated user.
 * @param {Request} req - The request object containing the file name in params.
 * @param {Response} res - The response object to send the result of file deletion.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>}
 */
export async function deleteFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { fileName } = req.params;
    const { userId } = req.user!;
    await fileService.deleteFile(fileName, userId);
    logger.info("Called deleteFile");
    res.status(HttpStatusCodes.OK).json({
      message: "task deleted",
    });
  } catch (e) {
    next(e);
  }
}
