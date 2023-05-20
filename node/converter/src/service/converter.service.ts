import { ConsumeMessage } from "amqplib";
import { Buffer } from "buffer";
import mongoose from "mongoose";

import { getChannel, sendDataToQueue } from "../rabbitmq/connect";
import { IConsumedMsg } from "./converter.types";
import { getBucket, getMongoDb } from "../mongo-db/mongo";

class ConverterService {
  async listen() {
    const channel = getChannel();

    await channel.consume(process.env.VIDEO_Q!, async msg => {
      try {
        if (!msg) return;
        await this.convert(msg);
        channel.ack(msg);
      } catch (error: any) {
        console.error(error);
        channel.reject(msg!, true);
      }
    });
  }

  async convert(message: ConsumeMessage) {
    const parsedMsg: IConsumedMsg = await JSON.parse(
      Buffer.from(message.content).toString("utf-8")
    );

    const videoId = new mongoose.Types.ObjectId(parsedMsg.video_id);
    const messageToSend = {
      ...parsedMsg,
      mp3_name: "test",
      mp3_size: 691245,
      mp3_id: "ssafafasfsaf",
    };
    const bucketName = parsedMsg.username + "_bucket";
    const bucket = getBucket(bucketName, getMongoDb());
    console.log(parsedMsg);

    let downloadedChunks = 0;
    await new Promise((res, rej) => {
      const readStream = bucket
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
          res("");
        })
        .on("error", (err: any) => {
          readStream.emit("close");
          rej(Error("Internal." + err));
        });
    });
  }
}

export const converterService = new ConverterService();
