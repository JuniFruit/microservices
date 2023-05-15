import express from "express";
import { authController } from "../auth-service/auth.controller";
import { upload } from "../upload/storage";
import { verifyAuth } from "../middleware/auth.middleware";
import { uploadController } from "../upload/upload.controller";

const router = express.Router();

router.get("/download");
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/register", authController.register);
router.post("/upload", verifyAuth, upload, uploadController.upload);

export default router;
