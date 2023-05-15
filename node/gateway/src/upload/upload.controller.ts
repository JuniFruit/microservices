import { RequestHandler } from "express";
import { uploadService } from "./upload.service";

class UploadController {
  upload: RequestHandler = async (req, res, next) => {
    try {
      const result = await uploadService.upload(
        req.files?.videos,
        (req as any)?.userData?.username
      );
      res.json({ message: "Uploading is complete" });
    } catch (error) {
      next(error);
    }
  };
}

export const uploadController = new UploadController();
