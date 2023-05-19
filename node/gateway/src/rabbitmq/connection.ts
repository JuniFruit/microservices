import amqp, { Channel, Connection } from "amqplib";
import { QUEUE_CONFIG } from "../config/rabbitmq";
const CONNECT_URL = process.env.RABBIT_MQ_URL || "";

let channel: Channel | undefined;

let connection: Connection;

async function connectQueue() {
  try {
    console.log(CONNECT_URL);
    connection = await amqp.connect(CONNECT_URL);
    channel = await connection.createChannel();
    channel.assertQueue(process.env.VIDEO_Q || "", QUEUE_CONFIG);
    channel.assertQueue(process.env.AUDIO_Q || "", QUEUE_CONFIG);
    console.log("RabbitMQ connected");
  } catch (error) {
    console.log(error);
  }
}

connectQueue();

const sendDataToQueue = (queueName: string, data: Object) => {
  if (!channel || !queueName)
    throw new Error("Internal. No RabbitMQ channel found or queue was not specified");
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
};

export { channel, connection, sendDataToQueue };
