import { Request } from "express";
import { ALLOWED_EXT } from "../../config/upload";

const isAllowedReq = (req: Request) => {
  const ACCEPTABLE_CONTENT_TYPE = /^(multipart\/.+);(.*)$/i;
  const UNACCEPTABLE_METHODS = ["GET", "HEAD"];

  if (!req.headers["content-type"]) return false;

  const hasBody = (req: Request) => {
    return (
      "transfer-encoding" in req.headers ||
      ("content-length" in req.headers && req.headers["content-length"] !== "0")
    );
  };

  return (
    hasBody(req) &&
    !UNACCEPTABLE_METHODS.includes(req.method) &&
    ACCEPTABLE_CONTENT_TYPE.test(req.headers["content-type"])
  );
};

const sanitizeFilename = (filename: string) => {
  return filename.replace(/\.|(<\w*|\w*>)/g, "");
};

const isAllowedExt = (filename: string) => {
  const ext = filename.slice(filename.length - 3, filename.length);
  return ALLOWED_EXT.includes(ext);
};

export { isAllowedReq, sanitizeFilename, isAllowedExt };
