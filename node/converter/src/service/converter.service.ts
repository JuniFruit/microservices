import { ConsumeMessage } from "amqplib";
import { Buffer } from "buffer";
import mongoose from "mongoose";
import tmp from "tmp";
import { getChannel, sendDataToQueue } from "../rabbitmq/connect";
import { IConsumedMsg } from "./converter.types";
import { getUploadsBucket } from "./storage";

class ConverterService {
  async listen() {
    const channel = getChannel();

    channel.consume("videos", async msg => {
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
    const messageToSend: IConsumedMsg = {
      video_id: parsedMsg.video_id,
      video_name: parsedMsg.video_name,
      mp3_name: "test",
      username: parsedMsg.username,
      video_size: parsedMsg.video_size,
      mp3_size: 691245,
    };

    console.log(parsedMsg);

    let downloadedChunks = 0;
    const readStream = getUploadsBucket()
      .openDownloadStream(videoId)
      .on("data", chunk => {
        downloadedChunks += chunk.byteLength;
        const percent = ((downloadedChunks / parsedMsg.video_size) * 100).toFixed(2);
        console.log(`Downloading chunks...${percent}% done`);
      })
      .on("end", () => sendDataToQueue(process.env.AUDIO_Q || "", messageToSend))
      .on("error", err => {
        throw new Error("Internal." + err);
      });
  }
}

export const converterService = new ConverterService();
