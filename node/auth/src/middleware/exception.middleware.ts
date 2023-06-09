import { ErrorRequestHandler } from "express";
import { ApiException } from "../exception/api.exception";

export const handleException: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  if (err instanceof ApiException) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }

  return res.status(500).json({ message: "Something went wrong!" });
};
