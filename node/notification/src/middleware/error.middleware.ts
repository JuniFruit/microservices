import { getChannel } from "../../../notification/src/rabbitmq/connect";
import { ServiceException } from "../exception/Service.exception";

export const handleException = (err: any) => {
  const channel = getChannel();
  if (err instanceof ServiceException) {
    if (err.queueMessage) {
      return channel.reject(err.queueMessage, true);
    }
  }
  console.error(err);
};
