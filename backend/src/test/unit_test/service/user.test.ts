import bcrypt from "bcrypt";
import expect from "expect";
import { default as Sinon, default as sinon } from "sinon";
import { ROLE } from "../../../enums/role";
import ConflictError from "../../../error/ConflictError";
import NotFoundError from "../../../error/NotFoundError";
import { signup } from "../../../service/auth";
import * as UserService from "../../../service/user";
import { getUserById, getUsers } from "../../../service/user";
import { UserModel } from "../../../model/user";
import { UnauthorizeError } from "../../../error/UnauthorizedError";
describe("User Service Test Suite", () => {
  // get userbyid unit  test
  describe("getUserById", () => {
    let userModelGetUserByIdStub: sinon.SinonStub;
    beforeEach(() => {
      userModelGetUserByIdStub = sinon.stub(UserModel, "getUserById");
    });
    afterEach(() => {
      userModelGetUserByIdStub.restore();
    });
    it("Should throw error user id not found", () => {
      userModelGetUserByIdStub.returns(undefined);
      expect(() => getUserById("2")).toThrow(
        new NotFoundError(`User with id 2 does not exist`)
      );
    });
    it("Should return usser if user is found", () => {
      const user = {
        userId: "1",
        name: "test",
        email: "test@test.com",
        password: "test1234",
        role: ROLE.USER,
      };
      userModelGetUserByIdStub.returns(user);
      const response = getUserById("1");
      expect(response).toStrictEqual(user);
    });
  });
  // create user unit test
  describe("createUser", () => {
    let bcryptHashStub: sinon.SinonStub;
    let userModelCreateUserStub: sinon.SinonStub;
    let userModelGetUserByEmailStub: sinon.SinonStub; // Added stub for getUserByEmail
    beforeEach(() => {
      bcryptHashStub = sinon.stub(bcrypt, "hash");
      userModelCreateUserStub = sinon.stub(UserModel, "createUser");
      userModelGetUserByEmailStub = sinon.stub(UserModel, "getUserByEmail"); // Initialize the stub
    });
    afterEach(() => {
      bcryptHashStub.restore();
      userModelCreateUserStub.restore();
      userModelGetUserByEmailStub.restore(); // Restore the stub
    });
    it("Should create new user", async () => {
      bcryptHashStub.resolves("hashedPassword");
      const user = {
        userId: "10",
        name: "test",
        email: "test@test.com",
        password: "test1234",
        role: ROLE.USER,
      };
      await signup(user);
      expect(bcryptHashStub.callCount).toBe(1);
      expect(bcryptHashStub.getCall(0).args).toStrictEqual([user.password, 10]);
      expect(userModelCreateUserStub.callCount).toBe(1);

      expect(userModelCreateUserStub.getCall(0).args).toStrictEqual([
        {
          ...user,
          password: "hashedPassword",
        },
      ]);
    });
    it("Should throw error if user already exists", async () => {
      bcryptHashStub.resolves("hashedPassword");

      const user = {
        userId: "1",
        name: "test",
        email: "test@test.com",
        password: "test1234",
        role: ROLE.USER,
      };
      userModelGetUserByEmailStub.resolves(user);

      await expect(signup(user)).rejects.toThrowError("Email already exists in database");
      expect(bcryptHashStub.callCount).toBe(1);
      expect(bcryptHashStub.getCall(0).args).toStrictEqual([user.password, 10]);
      expect(userModelCreateUserStub.callCount).toBe(0);
    });
  });
  //unit test for login
  //

  // unit test for get all users
  describe("getUsers", () => {
    let userModelGetUsersStub: sinon.SinonStub;
    beforeEach(() => {
      userModelGetUsersStub = sinon.stub(UserModel, "getUsers");
    });
    afterEach(() => {
      userModelGetUsersStub.restore();
    });
    it("Should show all the user", () => {
      const query = { q: "searchQuery" };
      const expectedUsers = [
        {
          userId: "1",
          name: "user1",
          email: "one@gmail.com",
          password:
            "$2b$10$/.Fh4GGQrIZsZTBtTctgne6Hz9HkHX9NVPrW5fDU/6YbT8A7kP9PC",
          role: ROLE.ADMIN,
        },
        {
          userId: "2",
          name: "user2",
          email: "two@gmail.com",
          password:
            "$2b$10$/.Fh4GGQrIZsZTBtTctgne6Hz9HkHX9NVPrW5fDU/6YbT8A7kP9PC",
          role: ROLE.USER,
        },
      ];
      userModelGetUsersStub.returns(expectedUsers);
      const result = UserModel.getUsers(query);

      expect(userModelGetUsersStub.calledOnceWith(query)).toBeTruthy();
      expect(result).toEqual(expectedUsers);
      expect(userModelGetUsersStub.callCount).toBe(1);
      expect(userModelGetUsersStub.getCall(0).args).toStrictEqual([query]);
    });
  });

  // unit test for get user by getUserByEmail
  /**Get User By Email Test case */
  describe("getUserByEmail", () => {
    let userModelGetUserByEmail: Sinon.SinonStub;
    beforeEach(() => {
      sinon.restore()
      userModelGetUserByEmail = sinon.stub(UserModel, "getUserByEmail");
    });
    afterEach(() => {
      userModelGetUserByEmail.restore();
    });
    it("Should return user if user is found", async () => {
      const user = {
        id: "1",
        name: "admin User",
        email: "one2222@gamil.com",
        password: "12345678Aa!",
        role: ROLE.ADMIN,
      };
      userModelGetUserByEmail.resolves(user);

      const response = await UserService.getUserByEmail(user.email);
      expect(response).toStrictEqual(user);
      expect(userModelGetUserByEmail.calledOnceWith(user.email)).toBeTruthy();
    });
    it("Should return null if user not found", async () => {
      userModelGetUserByEmail.resolves(null);
      const response = await UserService.getUserByEmail("random@gmail.com");
      expect(response).toBeNull()
      expect(userModelGetUserByEmail.calledOnceWith("random@gmail.com")).toBeTruthy();
    });
  });

  // unit test for update user
  describe("updatePassword", () => {
    let userModelGetUserByIdStub: sinon.SinonStub;
    let userModelUpdateUserStub: sinon.SinonStub;
    let bcryptHashStub: sinon.SinonStub;
    let bcryptCompareStub: sinon.SinonStub;

    beforeEach(() => {
      userModelGetUserByIdStub = sinon.stub(UserModel, "getUserById");
      userModelUpdateUserStub = sinon.stub(UserModel, "updateUser");
      bcryptHashStub = sinon.stub(bcrypt, "hash");
      bcryptCompareStub = sinon.stub(bcrypt, "compare");
    });
    afterEach(() => {
      sinon.restore();
    });

    it("should throw error when user is not found", async () => {
      const userId = "2";
      const oldPassword = "oldpass";
      const newPassword = "newpass";
      userModelGetUserByIdStub.resolves(null);

      await expect(
        UserService.updatePassword(userId, oldPassword, newPassword)
      ).rejects.toThrow(new NotFoundError(`User with id ${userId} does not exist`));
      expect(userModelGetUserByIdStub.calledOnceWith(userId)).toBeTruthy();
      expect(bcryptHashStub.called).toBeFalsy();
      expect(bcryptCompareStub.called).toBeFalsy();
      expect(userModelUpdateUserStub.called).toBeFalsy();


    });

    it("should successfully update password", async () => {
      const userId = "2"
      const oldPassword = "oldpass";
      const newPassword = "newpass";
      const hashedOldPassword = "hashedOldPassword"
      const hashedNewPassword = "hashedNewPassword";

      const existingUser = {
        userId: userId,
        password: hashedOldPassword
      };

      userModelGetUserByIdStub.resolves(existingUser);
      bcryptCompareStub.resolves(true)
      bcryptHashStub.resolves(hashedNewPassword);
      userModelUpdateUserStub.resolves();

      await UserService.updatePassword(userId, oldPassword, newPassword);

      expect(userModelGetUserByIdStub.calledOnceWith(userId)).toBeTruthy();
      expect(bcryptCompareStub.calledOnceWith(oldPassword, hashedOldPassword)).toBeTruthy();
      expect(bcryptHashStub.calledOnceWith(newPassword, 10)).toBeTruthy();
      expect(userModelUpdateUserStub.calledOnceWith(userId, hashedNewPassword)).toBeTruthy();

    });

    it("should throw error for invalid old password", async () => {
      const userId = '2'
      const wrongOldPassword = "wrongpass";
      const newPassword = "newpass";
      const hashedOldPassword = "hashedCorrectOldPassword";

      const existingUser = {
        userId,
        password: hashedOldPassword
      };

      userModelGetUserByIdStub.resolves(existingUser);
      bcryptCompareStub.resolves(false)

      await expect(
        UserService.updatePassword(userId, wrongOldPassword, newPassword)
      ).rejects.toThrow(new UnauthorizeError("Invalid old password"));
      expect(userModelGetUserByIdStub.calledOnceWith(userId)).toBeTruthy();
      expect(bcryptCompareStub.calledOnceWith(wrongOldPassword, hashedOldPassword)).toBeTruthy();
      expect(bcryptHashStub.called).toBeFalsy();
      expect(userModelUpdateUserStub.called).toBeFalsy();


    });
  });

  // delete user 
  describe("UserService.deleteUser", () => {
    let userModelGetUserByIdStub: sinon.SinonStub;
    let userModelDeleteUserStub: sinon.SinonStub;

    beforeEach(() => {
      sinon.restore();
      userModelGetUserByIdStub = sinon.stub(UserModel, "getUserById");
      userModelDeleteUserStub = sinon.stub(UserModel, "deleteUser");
    });

    afterEach(() => {
      sinon.restore();
      userModelDeleteUserStub.restore();
      userModelGetUserByIdStub.restore();
    });
    it("Should throw error user id not found", () => {
      userModelGetUserByIdStub.returns(undefined);
      expect(() => getUserById("1")).toThrow(
        new NotFoundError(`User with id 1 does not exist`)
      );
    });
    it("Should delete user if user exists", async () => {
      const userId = "2";
      const user = {
        userId: userId,
        name: "User One",
        email: "one@gmail.com",
        password: "hashedPassword",
        role: "user",
      };

      userModelGetUserByIdStub.resolves(user);
      userModelDeleteUserStub.resolves(user);

      const response = await UserService.deleteUser(userId);

      expect(response).toStrictEqual(user);
      expect(userModelGetUserByIdStub.callCount).toBe(1);
      expect(userModelGetUserByIdStub.getCall(0).args).toStrictEqual([userId]);
      expect(userModelDeleteUserStub.callCount).toBe(1);
      expect(userModelDeleteUserStub.getCall(0).args).toStrictEqual([userId]);
    });
  });
});
