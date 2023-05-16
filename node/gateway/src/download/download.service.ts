import mongoose from "mongoose";
import { getBucket, getMongoDb } from "../mongo-db/mongo";
import { ApiException } from "../exception/api.exception";

class DownloadService {
  bucket: mongoose.mongo.GridFSBucket | null = null;
  async downloadMp3(id: string, username: string) {
    const bucketName = username + "_bucket";
    this.bucket = getBucket(bucketName, getMongoDb());
    if (!this.bucket) throw new Error("Internal. Failed to create bucket");

    const collection = getMongoDb().collection(bucketName + ".files");
    const objectId = new mongoose.mongo.ObjectId(id);
    const fileData = await collection.findOne(objectId);

    if (!fileData) throw ApiException.BadRequest("No file with such id was found");

    let downloadedChunks = 0;
    const readStream = this.bucket
      .openDownloadStream(objectId)
      .on("data", (chunk: any) => {
        downloadedChunks += chunk.byteLength;
        const percent = ((downloadedChunks / fileData.metadata?.mp3_size) * 100).toFixed(2);
        console.log(`Downloading chunks...${percent}% done`);
      })
      .on("end", () => {
        console.log("Finished downloading");
        readStream.emit("close");
      })
      .on("error", (err: any) => {
        readStream.emit("close");
        throw new Error("Internal." + err);
      });
  }
}

export const downloadService = new DownloadService();
