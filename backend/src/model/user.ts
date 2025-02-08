import { ROLE } from "../enums/role";
import { GetUserQueryPage, User } from "../interfaces/user";
import { BaseModel } from "./base";

/**
 * Class for handling user-related database operations.
 */
export class UserModel extends BaseModel {
  /**
   * Creates a new user in the database.
   * @param user - The user object containing user details.
   * @returns The result of the insert query.
   * @throws Will throw an error if user creation fails.
   */
  static async createUser(user: User) {
    const userToCreate = {
      name: user.name,
      email: user.email,
      password: user.password,
      role: ROLE.USER,
    };
    const query = await this.queryBuilder().insert(userToCreate).table("users");
    return query;
  }

  /**
   * Updates the password for a user identified by email.
   * @param email - The email of the user whose password is to be updated.
   * @param newPassword - The new password for the user.
   * @throws Will throw an error if the update operation fails.
   */
  static async updateUser(userId: string, newPassword: string) {
    try {
      await this.queryBuilder()
        .update({ password: newPassword })
        .table("users")
        .where({ userId });
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Unable to update user password");
    }
  }

  /**
   * Retrieves a list of users based on the filter criteria.
   * @param filter - An object containing filter criteria, pagination, and search query.
   * @returns A query object for the list of users.
   */
  static getUsers(filter: GetUserQueryPage) {
    const { q } = filter;
    const query = this.queryBuilder()
      .select("userId", "name", "email")
      .table("users")
      .limit(filter.limit)
      .offset((filter.page - 1) * filter.limit);
    if (q) {
      query.whereLike("name", `%${q}%`);
    }
    return query;
  }

  /**
   * Counts the total number of users based on the filter criteria.
   * @param filter - An object containing filter criteria and search query.
   * @returns A query object for the user count.
   */
  static count(filter: GetUserQueryPage) {
    const { q } = filter;
    const query = this.queryBuilder().count("*").table("users").first();
    if (q) {
      query.whereLike("name", `%${q}%`);
    }
    return query;
  }

  /**
   * Retrieves a user by their user ID.
   * @param userId - The ID of the user to retrieve.
   * @returns A query object for the user details.
   */
  static getUserById(userId: string) {
    const query = this.queryBuilder()
      .select("*")
      .table("users")
      .where({ userId })
      .first();
    return query;
  }

  /**
   * Retrieves a user by their email.
   * @param email - The email of the user to retrieve.
   * @returns A query object containing user details or null if no user is found.
   */
  static async getUserByEmail(email: string) {
    const query = await this.queryBuilder()
      .select("userId", "name", "email", "password", "role")
      .table("users")
      .where({ email })
      .first();
    return query;
  }

  /**
   * Deletes a user by their user ID.
   * @param userId - The ID of the user to delete.
   * @returns The result of the delete query.
   * @throws Will throw an error if trying to delete an admin user.
   */
  static async deleteUser(userId: string) {
    const userToDelete = await this.queryBuilder()
      .select("role")
      .table("users")
      .where({ userId })
      .first();

    if (userToDelete && userToDelete.role === ROLE.ADMIN) {
      throw new Error("Cannot delete an admin user");
    }
    const query = await this.queryBuilder()
      .delete()
      .table("users")
      .where({ userId });
    return query;
  }
  // for testing purpose
  static async deleteUserByEmail(email) {
    const userToDelete = await this.queryBuilder()
      .select("role")
      .table("users")
      .where({ email })
      .first();

    if (!userToDelete) {
      throw new Error("User not found");
    }

    if (userToDelete.role === ROLE.ADMIN) {
      throw new Error("Cannot delete an admin user");
    }

    // Delete the user by email
    const query = await this.queryBuilder()
      .delete()
      .table("users")
      .where({ email });

    return query; // Returns the result of the delete operation
  }
}
