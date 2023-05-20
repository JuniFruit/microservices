import mongoose from "mongoose";
import * as ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { converterService } from "./service/converter.service";
import { connectQueue } from "./rabbitmq/connect";

ffmpeg.setFfmpegPath(ffmpegPath);

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
