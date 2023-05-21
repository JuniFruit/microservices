import { notificationService } from "./notification-service/notification.service";
import { connectQueue } from "./rabbitmq/connect";

const start = async () => {
  const makeConnections = async () => {
    try {
      await connectQueue();
      notificationService.listen();
    } catch (error) {
      console.log(error);
    }
  };

  await makeConnections();
};

start();
