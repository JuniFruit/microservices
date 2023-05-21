import { getMongoDb } from "../mongo-db/mongo";
import { getChannel } from "../rabbitmq/connect";
class HealthCheckController {
  checkHealth() {
    const db = getMongoDb();
    const RQchannel = getChannel();
    if (!db || !RQchannel) throw Error("Internal. RabbitMQ or DB is not connected");
    return 0;
  }
}

export const healthController = new HealthCheckController();
