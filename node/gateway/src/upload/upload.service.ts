import fileUpload from "express-fileupload";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { ApiException } from "../exception/api.exception";
import { sendDataToQueue } from "../rabbitmq/connection";
import { uploadsBucket as bucket } from "./storage";
import { ISendMsg } from "./upload.type";

class UploadService {
  async upload(
    fileInput: fileUpload.UploadedFile | fileUpload.UploadedFile[] | undefined,
    username: string
  ) {
    if (!fileInput)
      throw ApiException.BadRequest(
        "No file provided or incorrect header. Try setting 'multipart/form-data'"
      );

    const fileArr = [];
    if (Array.isArray(fileInput)) {
      fileArr.push(...fileInput);
    } else {
      fileArr.push(fileInput);
    }

    const messages: ISendMsg[] = [];

    const tempDir = path.join(__dirname, "/temp/");

    for (let file of fileArr) {
      let chunksUploaded = 0;
      const filePath = tempDir + username + file.name + this.getExtention(file.mimetype);
      await file.mv(filePath);
      const readStream = fs.createReadStream(filePath);
      await new Promise((res, rej) => {
        const writeStream = readStream.pipe(
          bucket()
            .openUploadStream(username + file.name, {
              metadata: {
                username: username,
                originalName: file.name,
                size: file.size,
                mimetype: file.mimetype,
                encoding: file.encoding,
              },
            })
            .on("drain", (chunk: mongoose.mongo.GridFSChunk) => {
              chunksUploaded += chunk.data.byteLength;
              const percent = ((chunksUploaded / file.data.byteLength) * 100).toFixed(2);
              console.log(`Loading chunks... ${percent}% done`);
            })
            .on("finish", () => {
              const message = {
                video_name: username + file.name,
                mp3_name: null,
                video_id: writeStream.id.toString(),
                username: username,
                video_size: file.size,
                mp3_size: 0,
              };
              messages.push(message);
              this.sendMessages(messages);
              this.cleanupTemp(filePath);
              writeStream.emit("close");
              res("Uploaded");
            })
            .on("error", async err => {
              if (err) {
                this.cleanupTemp(filePath);
                await bucket().delete(writeStream.id);
                rej(new Error("Internal." + err));
              }
            })
        );
      });
    }
  }

  private getExtention(mimetype: fileUpload.UploadedFile["mimetype"]) {
    return "." + mimetype.slice(mimetype.length - 3, mimetype.length);
  }

  private cleanupTemp(filePath: string) {
    fs.unlink(filePath, err => {
      if (err) throw new Error("Internal." + err);
      console.log(`File located in ${filePath} has been removed`);
    });
  }

  private async sendMessages(msgArr: ISendMsg[]) {
    for (let msg of msgArr) {
      try {
        await sendDataToQueue(process.env.VIDEO_Q || "", msg);
      } catch (error) {
        await bucket().delete(new mongoose.mongo.ObjectId(msg.video_id));
        throw new Error("Internal." + error);
      }
    }
    console.log("sent");
  }
}

export const uploadService = new UploadService();
