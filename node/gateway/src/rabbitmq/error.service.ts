import { getBucket, getMongoDb } from "../mongo-db/mongo";
import { getChannel } from "./connection";
class RMQErrorService {
  listen() {
    const channel = getChannel();
    if (!channel) throw new Error("Internal.No RabbitMQ channel was found");

    channel.consume(process.env.DELETE_FILES_Q!, msg => {
      if (!msg) return;
      const parsedMsg = JSON.parse(Buffer.from(msg.content).toString("utf-8"));

      // deleting files in any case, this means user would have to make a new upload
      const bucketName = parsedMsg.username + "_bucket";
      getBucket(bucketName, getMongoDb())
        .drop()
        .then(() => console.log(`Bucket ${bucketName} deleted`))
        .catch(err => console.log(err));

      channel.ack(msg);
    });
  }
}

export const RMQerrorService = new RMQErrorService();
