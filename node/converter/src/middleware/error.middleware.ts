import { ServiceException } from "../exception/Service.exception";
import { getChannel } from "../rabbitmq/connect";

export const handleException = (err: any) => {
  if (err instanceof ServiceException) {
    if (err.queueMessage) {
      console.log(err.message);
      return getChannel().reject(err.queueMessage, true);
    }
  }
  console.error(err);
};
