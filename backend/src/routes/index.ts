import express from "express";
import authRouter from "./auth";
import fileRouter from "./file";
import userRouter from "./user";

const router = express();

router.use("/files", fileRouter);
router.use("/auth", authRouter);
router.use("/users", userRouter);

export default router;
