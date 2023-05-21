import express from "express";
import { authController } from "../auth-service/auth.controller";
import { upload } from "../upload/file-process/fileUpload";
import { verifyAuth } from "../middleware/auth.middleware";
import { uploadController } from "../upload/upload.controller";
import { downloadController } from "../download/download.controller";
import { healthController } from "../health/healthCheck.controller";

const router = express.Router();

router.get("/download/:id", verifyAuth, downloadController.download);
router.get("/health", healthController.checkHealth);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/register", authController.register);
router.post("/upload", verifyAuth, upload, uploadController.upload);

export default router;
