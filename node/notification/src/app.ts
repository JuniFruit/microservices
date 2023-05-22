import appListen from "./app-listen/appListen";
import { notificationService } from "./notification-service/notification.service";
import { connectQueue } from "./rabbitmq/connect";

const start = async () => {
  const makeConnections = async () => {
    try {
      await connectQueue();
      await notificationService.listen();
    } catch (error) {
      console.log(error);
    }
  };

  await makeConnections();
  appListen.listen();
};

start();
