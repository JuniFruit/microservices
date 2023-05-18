import { FileInfo } from "busboy";
import mongoose from "mongoose";
import { getBucket, getMongoDb } from "../../mongo-db/mongo";
import { sanitizeFilename } from "./utils";
import { FILE_SIZE_LIMIT } from "../../config/upload";
import { ApiException } from "../../exception/api.exception";
import { Readable, Stream } from "stream";

let BYTES_UPLOADED = 0;
let BYTES_READ = 0;
// utils

const trackProgress = (chunk: Buffer) => {
  BYTES_READ += chunk.byteLength;
  console.log(`Reading... ${BYTES_READ} bytes read`);
};

const trackDrain = (chunk: mongoose.mongo.GridFSChunk) => {
  BYTES_UPLOADED += chunk.data.byteLength;
  console.log(`Loading... ${BYTES_UPLOADED} bytes uploaded`);
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
    chunkSizeBytes: 16540,
    metadata,
  });
  const mongoWritablePromise = new Promise((res, rej) => {
    mongoWritable.on("finish", () => {
      res("");
    });
    mongoWritable.on("error", async err => {
      await mongoWritable.abort();
      mongoWritable.end();

      rej(new Error("Internal." + err + " Bytes uploaded: " + BYTES_UPLOADED));
    });
  });

  mongoWritable.on("drain", (chunk: mongoose.mongo.GridFSChunk) => {
    trackDrain(chunk);
  });

  const dataHandler = async (chunk: Buffer, file: Readable) => {
    if (mongoWritable.writable && file.readable) {
      if (!mongoWritable.write(chunk)) {
        file.pause();
        mongoWritable.emit("drain", { data: { byteLength: chunk.byteLength } });
      } else {
        trackProgress(chunk);
        file.resume();
      }
    }
  };

  return {
    dataHandler,
    metadata: () => getMetadata(info, username),
    getSize: () => BYTES_READ,
    getWritablePromise: () => mongoWritablePromise,
    cleanup: () => {
      mongoWritable.end();
      mongoWritable
        .abort()
        .then(() => console.log("Aborted successfully"))
        .catch(err => console.error(err));
    },
    getStringId: () => mongoWritable.id.toString(),
  };
};

export default mongoUpload;
