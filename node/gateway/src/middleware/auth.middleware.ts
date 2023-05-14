import { RequestHandler } from "express";
import { authService } from "../auth-service/auth.service";

export const verifyAuth: RequestHandler = async (req, res, next) => {
  try {
    const data = await authService.verify(req.headers["authorization"]!);
    (req as any).userData = data;
    next();
  } catch (error) {
    next(error);
  }
};
