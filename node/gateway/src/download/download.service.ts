import { Response } from "express";
import mongoose from "mongoose";
import { LOG_PROGRESS } from "../config/upload";
import { getBucket, getMongoDb } from "../mongo-db/mongo";
import { PassThrough, convertBytes } from "../utils/general";

class DownloadService {
  async downloadMp3(id: string, username: string, res: Response) {
    const bucketName = username + "_bucket";
    const audioId = new mongoose.Types.ObjectId(id);

    const audioFile = await this.findFile(bucketName, audioId);
    const {
      getReadable,
      logReadable,
      getReadablePromise,
      cleanup: readableCleanup,
    } = this.getDownloadStream(bucketName, audioId);

    const {
      getWritable,
      getWritablePromise,
      cleanup: writableCleanup,
    } = this.getResponseStream(res);

    const disposition = 'attachment; filename="' + audioFile.filename + '"';
    res.setHeader("Content-Type", audioFile.metadata?.mimeType);
    res.setHeader("Content-Disposition", disposition);

    const passer = new PassThrough(logReadable);

    getReadable().pipe(passer).pipe(getWritable());

    // flush promises, it will throw an error if something happened during any stream
    await getReadablePromise();
    await getWritablePromise();
    readableCleanup();
    writableCleanup();
  }

  private getResponseStream(res: Response) {
    const responseWritable = res;
    const responseWritablePromise = new Promise((res, rej) => {
      responseWritable
        .on("error", err => {
          responseWritable.destroy();

          rej(new Error("Internal." + err));
        })
        .on("finish", () => {
          res("");
        });
    });

    return {
      getWritable: () => responseWritable,
      getWritablePromise: () => responseWritablePromise,
      cleanup: () => {
        responseWritable.destroy();
      },
    };
  }

  private getDownloadStream(bucketName: string, audioId: mongoose.mongo.ObjectId) {
    const bucket = getBucket(bucketName, getMongoDb());

    let DOWNLOADED_BYTES = 0;

    const mongoReadable = bucket.openDownloadStream(audioId);

    const logReadable = (chunk: Buffer) => {
      DOWNLOADED_BYTES += chunk.byteLength;
      if (LOG_PROGRESS) console.log(`Dowloaded: ${convertBytes(DOWNLOADED_BYTES)}`);
    };

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
      logReadable,
    };
  }

  private async findFile(bucketName: string, audioId: mongoose.mongo.ObjectId) {
    const collection = getMongoDb().collection(bucketName + ".files");
    const fileData = await collection.findOne(audioId);

    if (!collection || !fileData) throw new Error("File with such id does not exist");
    return fileData;
  }
}

export const downloadService = new DownloadService();
