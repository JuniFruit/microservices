import { ConsumeMessage } from "amqplib";
import { Buffer } from "buffer";
import mongoose from "mongoose";
import { ServiceException } from "../exception/Service.exception";
import { handleException } from "../middleware/error.middleware";
import { getChannel, sendDataToQueue } from "../rabbitmq/connect";
import { IConsumedMsg } from "./converter.types";
import { getMongoDb } from "./storage";

class ConverterService {
  bucket: mongoose.mongo.GridFSBucket | null = null;

  async listen() {
    const channel = getChannel();

    await channel.consume(process.env.VIDEO_Q!, async msg => {
      try {
        if (!msg) return;
        await this.convert(msg);
        channel.ack(msg);
      } catch (error: any) {
        handleException(error);
      }
    });
  }

  async convert(message: ConsumeMessage) {
    const parsedMsg: IConsumedMsg = JSON.parse(Buffer.from(message.content).toString("utf-8"));

    const videoId = new mongoose.Types.ObjectId(parsedMsg.video_id);
    const messageToSend = {
      ...parsedMsg,
      mp3_name: "test",
      mp3_size: 691245,
      mp3_id: "ssafafasfsaf",
      isError: false,
    };
    this.getBucket(parsedMsg.bucketName);
    console.log(parsedMsg);
    if (!this.bucket)
      throw ServiceException.ProcessingFailure(
        "Failed to get bucket: " + parsedMsg.bucketName,
        message
      );

    let downloadedChunks = 0;

    await new Promise((res, rej) => {
      const readStream = this.bucket!.openDownloadStream(videoId)
        .on("data", (chunk: any) => {
          downloadedChunks += chunk.byteLength;
          const percent = ((downloadedChunks / parsedMsg.video_size) * 100).toFixed(2);
          console.log(`Downloading chunks...${percent}% done`);
        })
        .on("end", () => {
          sendDataToQueue(process.env.AUDIO_Q || "", messageToSend);
          console.log("Sent to " + process.env.AUDIO_Q + " queue");
          readStream.emit("close");
          res("");
        })
        .on("error", (err: any) => {
          readStream.emit("close");
          rej(ServiceException.ProcessingFailure(err, message));
        });
    });
  }

  private getBucket(bucketName: string) {
    this.bucket = new mongoose.mongo.GridFSBucket(getMongoDb(), {
      bucketName: bucketName,
    });
  }
}

export const converterService = new ConverterService();
