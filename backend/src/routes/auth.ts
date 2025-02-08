import express from "express";
import { login, refresh, signup } from "../controller/auth";
import { auth, verifyUser } from "../middleware/auth";
import { validateReqBody } from "../middleware/validator";
import { createUserBodySchema } from "../schema/user";

const router = express();

router.post("/login", login);
router.post("/signup", validateReqBody(createUserBodySchema), signup);
router.post("/refresh-token", auth, refresh);
router.get("/me", auth, verifyUser);
router.get("/status", auth);

export default router;
