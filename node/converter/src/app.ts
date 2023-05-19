import mongoose from "mongoose";
import { converterService } from "./service/converter.service";
import { connectQueue } from "./rabbitmq/connect";

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || "");
    console.log("Mongo connected");
    await connectQueue();
    converterService.listen();
  } catch (error) {
    console.log(error);
  }
};

start();
