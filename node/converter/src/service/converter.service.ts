import { ConsumeMessage } from "amqplib";
import { Buffer } from "buffer";
import Ffmpeg from "fluent-ffmpeg";
import mongoose from "mongoose";
import { getBucket, getMongoDb } from "../mongo-db/mongo";
import { getChannel, sendDataToQueue } from "../rabbitmq/connect";
import { IConsumedMsg } from "./converter.types";
import { convertBytes } from "./utils";

class ConverterService {
  async listen() {
    const channel = getChannel();

    await channel.consume(process.env.VIDEO_Q!, async msg => {
      try {
        if (!msg) return;
        const res = await this.convert(msg);
        sendDataToQueue(process.env.AUDIO_Q!, res);
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

    const bucketName = parsedMsg.username + "_bucket";

    await this.checkFileInDB(bucketName, videoId);

    const {
      getReadable,
      getReadablePromise,
      cleanup: readableCleanup,
    } = this.getDownloadStream(bucketName, videoId);
    const {
      getWritable,
      getWritablePromise,
      getStringId,
      cleanup: writableCleanup,
    } = this.getUploadStream(bucketName, parsedMsg.video_name);

    Ffmpeg().input(getReadable()).noVideo().format("mp3").pipe(getWritable());

    // flush promises
    await getReadablePromise();
    await getWritablePromise();
    readableCleanup();
    writableCleanup();

    return {
      ...parsedMsg,
      mp3_name: parsedMsg.video_name + "_audio",
      mp3_size: 0,
      mp3_id: getStringId(),
    };
  }

  private getUploadStream(bucketName: string, filename: string) {
    const bucket = getBucket(bucketName, getMongoDb());
    const mongoWritable = bucket.openUploadStream(filename + "_audio", {
      chunkSizeBytes: 1048576, // 1 MB
      metadata: {
        mimeType: "audio/mp3",
      },
    });
    const mongoWritablePromise = new Promise((res, rej) => {
      mongoWritable.on("finish", () => {
        console.log("Uploading finished");
        res("");
      });
      mongoWritable.on("error", async err => {
        mongoWritable.end();

        rej(new Error("Internal." + err));
      });
    });

    return {
      getWritablePromise: () => mongoWritablePromise,
      cleanup: () => {
        mongoWritable.destroy();
      },
      getStringId: () => mongoWritable.id.toString(),
      getWritable: () => mongoWritable,
    };
  }

  private getDownloadStream(bucketName: string, videoId: mongoose.mongo.ObjectId) {
    const bucket = getBucket(bucketName, getMongoDb());

    let DOWNLOADED_BYTES = 0;

    const mongoReadable = bucket.openDownloadStream(videoId);

    mongoReadable.on("data", (chunk: Buffer) => {
      DOWNLOADED_BYTES += chunk.byteLength;
      console.log(`Dowloaded: ${convertBytes(DOWNLOADED_BYTES)}`);
    });

    const mongoReadablePromise = new Promise((res, rej) => {
      mongoReadable
        .on("end", () => {
          console.log("Dowloading finished");
          res("");
        })
        .on("error", (err: any) => {
          mongoReadable.destroy();
          rej(new Error("Internal." + err));
        });
    });

    return {
      getReadable: () => mongoReadable,
      getReadablePromise: () => mongoReadablePromise,
      cleanup: () => {
        mongoReadable.destroy();
        DOWNLOADED_BYTES = 0;
      },
    };
  }

  private async checkFileInDB(bucketName: string, videoId: mongoose.mongo.ObjectId) {
    const collection = getMongoDb().collection(bucketName + ".files");
    const fileData = await collection.findOne(videoId);

    if (!collection || !fileData) throw new Error("File does not exist");
    return true;
  }
}

export const converterService = new ConverterService();
