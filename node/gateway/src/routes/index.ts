import express from "express";
import { authController } from "../auth-service/auth.controller";
import { upload } from "../upload/file-process/fileUpload";
import { verifyAuth } from "../middleware/auth.middleware";
import { uploadController } from "../upload/upload.controller";
import { downloadController } from "../download/download.controller";

const router = express.Router();

router.get("/download/:id", verifyAuth, downloadController.download);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/register", authController.register);
router.post("/upload", upload, uploadController.upload);

export default router;
