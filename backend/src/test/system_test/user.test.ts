import expect from "expect";
import express from "express";
import HttpStatusCodes from "http-status-codes";
import { sign } from "jsonwebtoken";
import request from "supertest";
import config from "../../config";
import { ROLE } from "../../enums/role";
import { genericErrorHandler } from "../../middleware/errorHandler";
import router from "../../routes";
import { UserWithoutPassword } from "../../types/user";
import { testDb } from '../../testDbConfig';
const generateToken = (payload: UserWithoutPassword) => {
  return sign(payload, config.jwt.secret!, { expiresIn: "2h" });
};
// signup test
describe("User System test suite", () => {
  const tokenPayload = {
    userId: "1",
    name: "user1",
    email: "one@gmail.com",
    password: "test123",
    role: ROLE.ADMIN,
  };
  const token = generateToken(tokenPayload);
  const app = express();
  app.use(express.json());
  app.use(router);
  app.use(genericErrorHandler);
  describe("createUser API Test ", () => {
    let uniqueEmail;
    beforeEach(() => {
      // Generate unique email for the test user
      uniqueEmail = `system+${Date.now()}@gmail.com`;
    });
    it("Should create a new user", async () => {
      const response = await request(app)
        .post("/auth/signup")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "user1 system",
          email: uniqueEmail,
          password: "12345678!Aa",
        });
      expect(response.status).toBe(HttpStatusCodes.OK);
    });
    afterEach(async () => {
      if (uniqueEmail) {
        try {
          await testDb.cleanup();
        } catch (error) {
          console.error("Error deleting user during cleanup:", error);
        }
      }
    });
  });

  // login test
  describe("Login Api", () => {
    it("should success if credential is  valid  ", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "one@gmail.com",
        password: "12345678Aa!",
      });

      expect(response.status).toBe(HttpStatusCodes.OK);
    });
  });
  // refresh token

  // Refresh token test
  describe("Refresh Token API", () => {
    it("should refresh the access token", async () => {
      const refreshToken = generateToken(tokenPayload);
      const response = await request(app)
        .post("/auth/refresh-token")
        .set("Authorization", `Bearer ${refreshToken}`);

      expect(response.status).toBe(HttpStatusCodes.OK);
    });
  });
  //
  // get users

  // Test for getUsers API
  describe("getUsers API Test", async () => {
    it("Should return all users when no query parameter is provided", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(HttpStatusCodes.OK);
      // console.log(response.body);
    });
  });

  // get user by id
  describe("getUserById API Test", async () => {
    it("Should return the user when a valid ID is provided", async () => {
      const validUserId = "2";
      const response = await request(app)
        .get(`/users/${validUserId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(HttpStatusCodes.OK);
    });
  });


});
