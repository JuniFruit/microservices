import amqp, { Channel, Connection } from "amqplib";
import { QUEUE_CONFIG } from "../config/rabbitmq";
const CONNECT_URL = process.env.RABBIT_MQ_URL || "";

let channel: Channel | undefined;

let connection: Connection;

async function connectQueue() {
  try {
    connection = await amqp.connect(CONNECT_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(process.env.ERROR_Q!, "direct");
    await channel.assertQueue(process.env.DELETE_FILES_Q!, { durable: false });
    await channel.assertQueue(process.env.ERROR_Q! + "_messages", { durable: false });
    await channel.assertQueue(process.env.VIDEO_Q!, QUEUE_CONFIG);
    await channel.assertQueue(process.env.AUDIO_Q!, QUEUE_CONFIG);
    await channel.bindQueue(
      process.env.ERROR_Q! + "_messages",
      process.env.ERROR_Q!,
      process.env.ERROR_Q!
    ); // for simplicity in this project
    console.log("RabbitMQ connected");
  } catch (error) {
    console.log(error);
  }
}

const getChannel = () => channel;

const sendDataToQueue = (queueName: string, data: Object) => {
  if (!channel || !queueName)
    throw new Error("Internal. No RabbitMQ channel found or queue was not specified");
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
};

export { getChannel, connectQueue, sendDataToQueue };
