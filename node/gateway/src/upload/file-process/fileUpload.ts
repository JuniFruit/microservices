import { FILE_SIZE_LIMIT, UPLOAD_TIMEOUT, getBusboyConfig } from "../../config/upload";
import { RequestHandler } from "express-serve-static-core";
import busboy from "busboy";
import { ApiException } from "../../exception/api.exception";
import { convertBytes, isAllowedReq } from "./utils";
import mongoUpload from "./mongoUpload";
import { ReqFileMetadata } from "./fileUpload.type";
import { Transform, TransformCallback } from "stream";
import { UploadTimer } from "./timer";
import { LOG_PROGRESS } from "../../config/upload";
class SizeTracker extends Transform {
  bytes_read = 0;
  constructor() {
    super();
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
    if (this.bytes_read > FILE_SIZE_LIMIT)
      return callback(
        ApiException.BadRequest(
          `File size exceeded the limit. Max is ${convertBytes(FILE_SIZE_LIMIT)}`
        )
      );

    this.bytes_read += chunk.byteLength;
    if (LOG_PROGRESS) {
      console.log(`Read: ${convertBytes(this.bytes_read)}`);
    }
    callback(null, chunk);
  }
}

const flushPromise = Symbol("flush promise");

const processRequest: RequestHandler = (req, res, next) => {
  const userData = (req as any)?.userData;
  if (req.body instanceof Buffer) {
    req.body = Object.create(null);
  }
  const bb = busboy(getBusboyConfig(req));

  bb.on("file", (field, file, info) => {
    const request = req as any;

    const uploadTimer = new UploadTimer(UPLOAD_TIMEOUT, () => {
      file.destroy(ApiException.BadRequest("Upload timeout"));
    });
    const { getWritable, metadata, getWritablePromise, cleanup, getStringId } = mongoUpload(
      userData?.username || "",
      info
    );

    const writablePromise = getWritablePromise().catch(err => {
      req.unpipe();
      file.destroy();
      uploadTimer.clear();
      cleanup();
      next(err);
    });

    const tracker = new SizeTracker().on("error", err => file.destroy(err));

    file.on("error", err => {
      req.unpipe();

      uploadTimer.clear();
      cleanup();
      next(err);
    });

    uploadTimer.set();
    file.pipe(tracker).pipe(getWritable());

    file.on("end", () => {
      const data: ReqFileMetadata = {
        ...metadata(),
        size: tracker.bytes_read,
        id: getStringId(),
        username: userData?.username,
      };
      request.fileMetadata = data;

      if (!request[flushPromise]) request[flushPromise] = [];
      request[flushPromise].push(writablePromise);
      uploadTimer.clear();
    });
  });
  bb.on("error", (err: any) => {
    req.unpipe();
    next(err);
  });
  bb.on("finish", () => {
    console.log("Busboy finished parsing");

    const request = req as any;
    Promise.all(request[flushPromise]).then(() => {
      delete request[flushPromise];

      next();
    });
  });

  req.pipe(bb);
};

const upload: RequestHandler = (req, res, next) => {
  if (isAllowedReq(req)) {
    processRequest(req, res, next);
  } else {
    next(
      ApiException.BadRequest(
        "This request is not eligible for processing. It might contain incorrect headers. Try to set 'multipart/form-data'"
      )
    );
  }
};

export { upload };
