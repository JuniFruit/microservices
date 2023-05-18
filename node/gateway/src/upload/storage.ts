import fileUpload from "express-fileupload";
import { getBusboyConfig, UPLOAD_CONFIG } from "../config/upload";
import { RequestHandler } from "express-serve-static-core";
import busboy from "busboy";
import { ApiException } from "../exception/api.exception";
const upload: RequestHandler = (req, res, next) => {
  const bb = busboy(getBusboyConfig(req));

  bb.on("field", (field, val) => {
    console.log(field, val);
  });
  bb.on("file", (field, file, info) => {
    console.log("fired");
    console.log(field, file, info);
  });
  bb.on("error", (err: any) => {
    next(ApiException.BadRequest(err));
  });
  //   next();
};

export { upload };
