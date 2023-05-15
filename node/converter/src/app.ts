import mongoose from "mongoose";
import { converterService } from "./service/converter.service";

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || "");
    console.log("Mongo connected");
    converterService.listen();
  } catch (error) {
    console.log(error);
  }
};

start();
