import { default as bcript, default as bcrypt } from "bcrypt";
import { sign } from "jsonwebtoken";
import config from "../config";
import ConflictError from "../error/ConflictError";
import NotFoundError from "../error/NotFoundError";
import { User } from "../interfaces/user";
import * as UserModel from "../model/user";
import * as UserService from "../service/user";

/**
 * Handles user signup by hashing the password and creating a new user if the email is not already taken.
 * @param {User} user - The user information including email, name, and password.
 * @returns {Promise<any>} The result of the user creation operation.
 * @throws {ConflictError} If the email already exists in the database.
 */
export async function signup(user: User) {
  const password = await bcrypt.hash(user.password, 10);
  const existingUser = await UserModel.UserModel.getUserByEmail(user.email);
  if (existingUser) {
    throw new ConflictError("Email already exists in database");
  }
  const data = await UserService.createUser({ ...user, password });
  return data;
}

/**
 * Handles user login by checking the provided email and password, and generating tokens if the credentials are valid.
 * @param {Pick<User, "email" | "password">} body - The login credentials including email and password.
 * @returns {Promise<{ name: string; accessToken: string; refreshToken: string }>} The user's name and generated tokens.
 * @throws {NotFoundError} If the user does not exist or the password is invalid.
 */
export async function login(body: Pick<User, "email" | "password">) {
  const existingUser = await UserModel.UserModel.getUserByEmail(body.email);
  if (!existingUser) {
    throw new NotFoundError("User not Exists");
  }
  const isValidPassword = await bcrypt.compare(
    body.password,
    existingUser.password
  );
  if (!isValidPassword) {
    throw new NotFoundError("Invalid email or  password");
  }

  const payload = {
    userId: existingUser.userId,
    name: existingUser.name,
    email: existingUser.email,
    role: existingUser.role,
  };
  const accessToken = await sign(payload, config.jwt.secret!, {
    expiresIn: config.jwt.acccessTokenExpiraryMS,
  });

  const refreshToken = await sign(payload, config.jwt.secret!, {
    expiresIn: config.jwt.refreshTokenExpiraryMS,
  });

  const name = existingUser.name;
  return {
    name,
    accessToken,
    refreshToken,
  };
}
