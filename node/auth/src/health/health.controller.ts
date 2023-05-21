import { RequestHandler } from "express";
import { getPostgresDB } from "../db/db.connect";

class HealthCheckController {
  checkHealth: RequestHandler = async (req, res, next) => {
    try {
      const db = getPostgresDB();

      if (!db.isInitialized) return next(new Error("Internal. No DB connection was found"));

      res.status(200).send("Liveliness checked");
    } catch (error) {
      next(error);
    }
  };
}

export const healthController = new HealthCheckController();
