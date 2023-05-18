import { FILE_SIZE_LIMIT, getBusboyConfig } from "../../config/upload";
import { RequestHandler } from "express-serve-static-core";
import busboy from "busboy";
import { ApiException } from "../../exception/api.exception";
import { isAllowedReq } from "./utils";
import mongoUpload from "./mongoUpload";
import { ReqFileMetadata } from "./fileUpload.type";

const flushPromise = Symbol("flush promise");

const processRequest: RequestHandler = (req, res, next) => {
  if (req.body instanceof Buffer) {
    req.body = Object.create(null);
  }
  const bb = busboy(getBusboyConfig(req));

  bb.on("field", (field, val) => {});
  bb.on("file", (field, file, info) => {
    const request = req as any;
    const username = request?.userData?.username || "";

    const { dataHandler, metadata, getSize, getWritablePromise, cleanup, getStringId } =
      mongoUpload(username, info);

    const writablePromise = getWritablePromise().catch(err => {
      req.unpipe();
      req.resume();
      cleanup();
      next(err);
    });

    file.on("limit", () => {
      req.unpipe();
      file.destroy();
      cleanup();
      next(ApiException.BadRequest("File size exceeded the limit. Max is 400 MB"));
    });

    file.on("data", (chunk: Buffer) => {
      if (getSize() > FILE_SIZE_LIMIT) return file.emit("limit");

      dataHandler(chunk, file);
    });

    file.on("end", () => {
      const data: ReqFileMetadata = {
        ...metadata(),
        size: getSize(),
        id: getStringId(),
        username,
      };
      request.fileMetadata = data;

      if (!request[flushPromise]) request[flushPromise] = [];
      request[flushPromise].push(writablePromise);
    });
  });
  bb.on("error", (err: any) => {
    req.unpipe();
    next(new Error("Internal." + err));
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
