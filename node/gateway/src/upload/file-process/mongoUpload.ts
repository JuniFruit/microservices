import { FileInfo } from "busboy";
import mongoose from "mongoose";
import { getBucket, getMongoDb } from "../../mongo-db/mongo";
import { sanitizeFilename } from "./utils";
import { LOG_PROGRESS } from "../../config/upload";

let BYTES_UPLOADED = 0;

// utils

const trackDrain = (chunk: mongoose.mongo.GridFSChunk) => {
  BYTES_UPLOADED += chunk.data.byteLength;
  if (LOG_PROGRESS) {
    console.log(`Loading... ${BYTES_UPLOADED} bytes uploaded`);
  }
};

const getMetadata = (info: FileInfo, username: string) => ({
  ...info,
  username,
  filename: sanitizeFilename(info.filename),
});

// main

const mongoUpload = (username: string, info: FileInfo) => {
  const bucketName = username + "_bucket";
  const bucket = getBucket(bucketName, getMongoDb());

  const metadata = getMetadata(info, username);

  const mongoWritable = bucket.openUploadStream(username + metadata.filename, {
    chunkSizeBytes: 1048576, // 1 MB
    metadata,
  });
  const mongoWritablePromise = new Promise((res, rej) => {
    mongoWritable.on("finish", () => {
      BYTES_UPLOADED = 0;
      res("");
    });
    mongoWritable.on("error", async err => {
      bucket
        .drop()
        .then(() => console.log("Bucket dropped successfully"))
        .catch(err => console.error(err));
      BYTES_UPLOADED = 0;
      mongoWritable.end();

      rej(new Error("Internal." + err + " Bytes uploaded: " + BYTES_UPLOADED));
    });
  });

  mongoWritable.on("drain", (chunk: mongoose.mongo.GridFSChunk) => {
    trackDrain(chunk);
  });

  return {
    metadata: () => getMetadata(info, username),
    getWritablePromise: () => mongoWritablePromise,
    cleanup: () => {
      mongoWritable.end();
      BYTES_UPLOADED = 0;
    },
    getStringId: () => mongoWritable.id.toString(),
    getWritable: () => mongoWritable,
  };
};

export default mongoUpload;
