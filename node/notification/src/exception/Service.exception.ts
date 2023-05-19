import { Message } from "amqplib";
export class ServiceException extends Error {
  queueMessage: Message | null;
  constructor(msg: string, queueMsg?: Message) {
    super(msg);
    this.queueMessage = queueMsg || null;
  }

  static ProcessingFailure(errMsg: string, queueMsg: Message) {
    return new ServiceException("Couldn't process the message" + errMsg, queueMsg);
  }

  static Internal(errMsg: string) {
    return new ServiceException("Internal." + errMsg);
  }
}
