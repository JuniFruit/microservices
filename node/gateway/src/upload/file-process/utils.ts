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

const convertBytes = (bytes: number) => {
  if (bytes >= 10 ** 9) return `${(bytes / 10 ** 9).toFixed(2)} GB`;
  if (bytes >= 10 ** 6) return `${(bytes / 10 ** 6).toFixed(2)} MB`;
  if (bytes >= 10 ** 3) return `${(bytes / 10 ** 3).toFixed(2)} KB`;
  return `${bytes} BB`;
};

export { isAllowedReq, sanitizeFilename, convertBytes };
