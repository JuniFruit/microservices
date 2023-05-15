import fileUpload from "express-fileupload";
import fs from "fs";
import path from "path";
import { ApiException } from "../exception/api.exception";
import { sendDataToQueue } from "../rabbitmq/connection";
import { uploadsBucket as bucket } from "./storage";

class UploadService {
  async upload(
    fileInput: fileUpload.UploadedFile | fileUpload.UploadedFile[] | undefined,
    username: string
  ) {
    if (!fileInput) throw ApiException.BadRequest("No file provided");

    const fileArr = [];
    if (Array.isArray(fileInput)) {
      fileArr.push(...fileInput);
    } else {
      fileArr.push(fileInput);
    }

    const messages = [];

    const tempDir = path.join(__dirname, "/temp/");
    for (let file of fileArr) {
      const filePath = tempDir + username + file.name + this.getExtention(file.mimetype);
      await file.mv(filePath);
      fs.createReadStream(filePath).pipe(
        bucket().openUploadStream(username + file.name, {
          metadata: { username: username, originalName: file.name, size: file.size },
        })
      );
      const message = {
        video_name: username + file.name,
        mp3_name: null,
        username: username,
      };
      messages.push(message);
    }

    for (let msg of messages) {
      try {
        await this.sendMessage(msg);
      } catch (error) {
        //delete file from bucket
        throw new Error("Internal." + error);
      }
    }
  }

  private getExtention(mimetype: fileUpload.UploadedFile["mimetype"]) {
    return "." + mimetype.slice(mimetype.length - 3, mimetype.length);
  }

  private async sendMessage(data: Object) {
    await sendDataToQueue("videos", data);
    console.log("sent");
  }
}

export const uploadService = new UploadService();
