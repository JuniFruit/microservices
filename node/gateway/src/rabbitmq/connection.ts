import amqp, { Channel, Connection } from "amqplib";

const CONNECT_URL = process.env.RABBIT_MQ_URL || "amqp://localhost:5672";
let channel: Channel;

let connection: Connection;

async function connectQueue() {
  try {
    connection = await amqp.connect(CONNECT_URL);
    channel = await connection.createChannel();
    channel.assertQueue("videos", { durable: true });
    console.log("RabbitMQ connected");
  } catch (error) {
    console.log(error);
  }
}

connectQueue();

const sendDataToQueue = async (queueName: string, data: Object) => {
  if (!channel) throw new Error("Internal. No RabbitMQ channel found");
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
};

export { channel, connection, sendDataToQueue };
