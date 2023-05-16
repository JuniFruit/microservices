import { notificationService } from "./notification-service/notification.service";
import { connectQueue } from "./rabbitmq/connect";

const start = async () => {
  try {
    await connectQueue();
    notificationService.listen();
  } catch (error) {
    console.log(error);
  }
};

start();
