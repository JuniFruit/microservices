import fileUpload from "express-fileupload";
import { ApiException } from "../exception/api.exception";

const FILE_SIZE_LIMIT = 1024 * 1024 * 1024;
const UPLOAD_TIMEOUT = 1000 * 60 * 5;

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
