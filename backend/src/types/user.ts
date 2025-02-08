import { User } from "../interfaces/user";

export type UserWithoutPassword = Pick<
  User,
  "userId" | "name" | "email" | "role"
>;
