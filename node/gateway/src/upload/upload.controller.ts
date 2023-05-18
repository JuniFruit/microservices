import { RequestHandler } from "express";
import { ReqFileMetadata } from "./file-process/fileUpload.type";
import { sendDataToQueue } from "../rabbitmq/connection";
import { ISendMsg } from "./upload.type";
class UploadController {
  upload: RequestHandler = async (req, res, next) => {
    try {
      const fileInfo: ReqFileMetadata = (req as any).fileMetadata;
      console.log(fileInfo);
      const message: ISendMsg = {
        video_id: fileInfo.id.toString(),
        video_size: fileInfo.size,
        video_name: fileInfo.filename,
        mp3_name: "",
        mp3_size: 0,
        email: (req as any)?.userData?.email,
      };

      sendDataToQueue(process.env.VIDEO_Q || "", message);

      res.json({
        message:
          "Uploading is complete. Your file will be ready shortly, please check your email for notifications",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const uploadController = new UploadController();
