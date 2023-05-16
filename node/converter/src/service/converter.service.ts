import { ConsumeMessage } from "amqplib";
import { Buffer } from "buffer";
import mongoose from "mongoose";
import { getChannel, sendDataToQueue } from "../rabbitmq/connect";
import { IConsumedMsg } from "./converter.types";
import { getMongoDb } from "./storage";

class ConverterService {
  bucket: mongoose.mongo.GridFSBucket | null = null;

  async listen() {
    const channel = getChannel();

    channel.consume(process.env.VIDEO_Q!, async msg => {
      try {
        if (!msg) return;
        await this.convert(msg);
      } catch (error: any) {
        const msgStr = JSON.stringify({ error: "Conversion failed." + error });
        channel.nack({
          content: Buffer.from(msgStr, "utf-8"),
          properties: msg?.properties!,
          fields: msg?.fields!,
        });
      }
    });
  }

  async convert(message: ConsumeMessage) {
    const parsedMsg: IConsumedMsg = JSON.parse(Buffer.from(message.content).toString("utf-8"));
    const videoId = new mongoose.Types.ObjectId(parsedMsg.video_id);
    const messageToSend = {
      video_id: parsedMsg.video_id,
      video_name: parsedMsg.video_name,
      mp3_name: "test",
      email: parsedMsg.email,
      video_size: parsedMsg.video_size,
      mp3_size: 691245,
      mp3_id: "ssafafasfsaf",
      bucketName: parsedMsg.bucketName,
    };
    this.getBucket(parsedMsg.bucketName);

    if (!this.bucket) throw new Error("Internal. Failed to get bucket " + parsedMsg.bucketName);
    console.log(parsedMsg);

    let downloadedChunks = 0;
    const readStream = this.bucket
      .openDownloadStream(videoId)
      .on("data", (chunk: any) => {
        downloadedChunks += chunk.byteLength;
        const percent = ((downloadedChunks / parsedMsg.video_size) * 100).toFixed(2);
        console.log(`Downloading chunks...${percent}% done`);
      })
      .on("end", () => {
        sendDataToQueue(process.env.AUDIO_Q || "", messageToSend);
        console.log("Sent to " + process.env.AUDIO_Q + " queue");
        readStream.emit("close");
      })
      .on("error", (err: any) => {
        readStream.emit("close");
        throw new Error("Internal." + err);
      });
  }

  private getBucket(bucketName: string) {
    this.bucket = new mongoose.mongo.GridFSBucket(getMongoDb(), {
      bucketName: bucketName,
    });
  }
}

export const converterService = new ConverterService();
