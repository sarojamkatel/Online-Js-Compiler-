import bcrypt from "bcrypt";
import ConflictError from "../error/ConflictError";
import { ForbiddenError } from "../error/ForbiddenError";
import NotFoundError from "../error/NotFoundError";
import { UnauthorizeError } from "../error/UnauthorizedError";
import { GetUserQueryPage, User } from "../interfaces/user";
import * as UserModel from "../model/user";

/**
 * Creates a new user in the database.
 * @param {User} user - The user object containing the user details.
 * @returns {Promise<void>} A promise that resolves when the user is created.
 */
export async function createUser(user: User) {
  return UserModel.UserModel.createUser(user);
}

/**
 * Retrieves a paginated list of users based on the provided query.
 * @param {GetUserQueryPage} query - The query parameters for pagination and filtering.
 * @returns {Promise<{ data: User[]; meta: { page: number; limit: number; total: number; totalPages: number } }>} A promise that resolves with the user data and metadata.
 */
export async function getUsers(query: GetUserQueryPage) {
  const data = await UserModel.UserModel.getUsers(query);
  // this come as object
  const count = await UserModel.UserModel.count(query);
  const totalPages = Math.ceil(count.count / query.limit);
  const meta = {
    page: query.page,
    limit: query.limit,
    total: +count.count,
    totalPages,
  };
  return { data, meta };
}

/**
 * Retrieves a user by their ID.
 * @param {string} id - The ID of the user to retrieve.
 * @returns {Promise<User>} A promise that resolves with the user data.
 * @throws {NotFoundError} If no user with the given ID is found.
 */
export function getUserById(id: string) {
  const data = UserModel.UserModel.getUserById(id);
  if (!data) {
    throw new NotFoundError(`User with id ${id} does not exist`);
  }
  return data;
}

/**
 * Retrieves a user by their email. Throws an error if the user exists.
 * @param {string} email - The email of the user to retrieve.
 * @returns {Promise<User>} A promise that resolves with the user data.
 * @throws {ConflictError} If a user with the given email already exists.
 */
export async function getUserByEmail(email: string) {
  const data = await UserModel.UserModel.getUserByEmail(email);
  return data;
}

/**
 * Updates the password for a user. Throws an error if the old password is incorrect or if the user does not exist.
 * @param {string} email - The email of the user whose password is to be updated.
 * @param {string} oldPassword - The current password of the user.
 * @param {string} newPassword - The new password to set.
 * @returns {Promise<void>} A promise that resolves when the password is updated.
 * @throws {NotFoundError} If no user with the given email is found.
 * @throws {UnauthorizeError} If the old password is incorrect.
 */
export async function updatePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
) {
  const user = await UserModel.UserModel.getUserById(userId);
  if (!user) {
    throw new NotFoundError(`User with id ${userId} does not exist`);
  }
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizeError("Invalid old password");
  }
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await UserModel.UserModel.updateUser(userId, hashedNewPassword);
}

/**
 * Deletes a user by their ID. Throws an error if the user is an admin or if no user is found.
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<void>} A promise that resolves when the user is deleted.
 * @throws {NotFoundError} If no user with the given ID is found.
 * @throws {ForbiddenError} If attempting to delete an admin user.
 */
export async function deleteUser(id: string) {
  const existingUser = await UserModel.UserModel.getUserById(id);
  if (!existingUser) {
    throw new NotFoundError(`User with id ${id} does not exist`);
  }
  try {
    const deleted = await UserModel.UserModel.deleteUser(id);
    return deleted;
  } catch (error) {
    if (error.message === "Cannot delete an admin user") {
      throw new ForbiddenError("Cannot delete an admin user");
    }
    throw error;
  }
}
