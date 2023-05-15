import { ConsumeMessage, Message } from "amqplib";
import { getChannel } from "../rabbitmq/connect";

class ConverterService {
  async listen() {
    const channel = getChannel();

    channel.consume("videos", async msg => {
      try {
        if (!msg) return;
        const message = await this.convert(msg);
        channel.ack(message);
      } catch (error) {
        channel.nack(error);
      }
    });
  }

  async convert(message: ConsumeMessage): Promise<Message> {}
}
