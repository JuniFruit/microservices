import { RequestHandler } from "express";
import { getMongoDb } from "../mongo-db/mongo";
import { getChannel } from "../rabbitmq/connection";
class HealthCheckController {
  checkHealth: RequestHandler = async (req, res, next) => {
    try {
      const db = getMongoDb();
      const RQchannel = getChannel();
      if (!db || !RQchannel) return next(new Error("Internal. RabbitMQ or DB is not connected"));

      res.status(200).send("Liveliness checked");
    } catch (error) {
      next(error);
    }
  };
}

export const healthController = new HealthCheckController();
