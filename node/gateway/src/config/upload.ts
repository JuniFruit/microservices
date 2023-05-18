import fileUpload from "express-fileupload";
import { ApiException } from "../exception/api.exception";
import { BusboyConfig } from "busboy";
import { Request } from "express";

export const FILE_SIZE_LIMIT = 1000000 * 400; // 400 MB
export const UPLOAD_TIMEOUT = 1000 * 60 * 5;

export const UPLOAD_CONFIG: fileUpload.Options = {
  createParentPath: true,
  limits: { fileSize: FILE_SIZE_LIMIT },
  safeFileNames: true,
  uploadTimeout: UPLOAD_TIMEOUT,
  debug: false,
  limitHandler(req, res, next) {
    return next(ApiException.BadRequest("File exceeded the limit. Max is 1GB"));
  },
};

export const getBusboyConfig = (req: Request): BusboyConfig => ({
  headers: req.headers,
  limits: {
    fieldNameSize: 200,
    fields: 5,
    fileSize: FILE_SIZE_LIMIT,
  },
});
