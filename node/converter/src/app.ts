import mongoose from "mongoose";
import * as ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { converterService } from "./service/converter.service";
import { connectQueue } from "./rabbitmq/connect";
import appListener from "./app-listen/appListen";

ffmpeg.setFfmpegPath(ffmpegPath);

const start = async () => {
  const makeConnections = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URL || "");
      console.log("Mongo connected");
      await connectQueue();
      await converterService.listen();
    } catch (error) {
      console.error(error);
    }
  };

  await makeConnections();

  appListener.listen();
};

start();
