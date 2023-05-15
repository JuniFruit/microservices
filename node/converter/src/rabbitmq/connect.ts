import amqp, { Channel, Connection } from "amqplib";

const CONNECT_URL = process.env.RABBIT_MQ_URL || "amqp://localhost:5672";
let channel: Channel;

let connection: Connection;

async function connectQueue() {
  try {
    connection = await amqp.connect(CONNECT_URL);
    channel = await connection.createChannel();
    channel.assertQueue("videos", { durable: true });
    channel.assertQueue("audios", { durable: true });
    console.log("RabbitMQ connected");
  } catch (error) {
    console.log(error);
  }
}

connectQueue();

const getChannel = () => channel;

export { getChannel };
