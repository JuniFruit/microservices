import { BusboyConfig } from "busboy";
import { Request } from "express";

export const FILE_SIZE_LIMIT = 1000000 * 400; // 400 MB
export const UPLOAD_TIMEOUT = 1000 * 60 * 5; // 5 MIN
export const MONGO_CHUNK_SIZE = 1048576; // 1 MB
export const LOG_PROGRESS = process.env.LOG_PROGRESS; // logging uploading and downloading progress

export const getBusboyConfig = (req: Request): BusboyConfig => ({
  headers: req.headers,
  highWaterMark: 20000,
  limits: {
    fieldNameSize: 200,
    fields: 5,
    fileSize: FILE_SIZE_LIMIT,
  },
});
