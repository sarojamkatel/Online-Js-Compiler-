import express from "express";
import {
  createFile,
  deleteFile,
  getFile,
  getUserFile,
  renameFile,
} from "../controller/file";
import { auth } from "../middleware/auth";

const router = express();

router.post("/", auth, createFile);
router.get("/", auth, getFile);
router.get("/:userId", auth, getUserFile);
router.delete("/:fileName", auth, deleteFile);
router.put("/rename", auth, renameFile);

export default router;
