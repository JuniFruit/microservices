import amqp, { Channel, Connection } from "amqplib";

const CONNECT_URL = process.env.RABBIT_MQ_URL || "amqp://localhost:5672";
let channel: Channel;

let connection: Connection;

async function connectQueue() {
  try {
    connection = await amqp.connect(CONNECT_URL);
    channel = await connection.createChannel();
    channel.assertQueue(process.env.AUDIO_Q || "", { durable: true });
    console.log("RabbitMQ connected");
  } catch (error) {
    console.log(error);
  }
}

const getChannel = () => channel;

const sendDataToQueue = async (queueName: string, data: Object) => {
  if (!channel || !queueName)
    throw new Error("Internal. No RabbitMQ channel found or queue was not specified");
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
};

export { getChannel, sendDataToQueue, connectQueue };
