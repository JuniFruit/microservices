import { getChannel } from "../rabbitmq/connect";

class HealthCheckController {
  checkHealth() {
    const RQchannel = getChannel();
    if (!RQchannel) throw Error("Internal. RabbitMQ or DB is not connected");
    return 0;
  }
}

export const healthController = new HealthCheckController();
