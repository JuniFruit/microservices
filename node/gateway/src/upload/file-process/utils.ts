import { Request } from "express";

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

export { isAllowedReq, sanitizeFilename };
