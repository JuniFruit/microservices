import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import gatewayRouter from "./routes/index";
import { handleException } from "./middleware/error.middleware";
import mongoose from "mongoose";
import cors from "cors";
import { MONGO_CONFIG } from "./config/mongo";
import { connectQueue } from "./rabbitmq/connection";
import { RMQerrorService } from "./rabbitmq/error.service";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_SERVICE_PORT || 6000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/", gatewayRouter);

app.use(handleException);

const start = async () => {
  const makeConnections = async () => {
    try {
      await connectQueue();
      await mongoose.connect(process.env.MONGO_URL || "", MONGO_CONFIG);
      await RMQerrorService.listen();

      console.log("MongoDB connected");
    } catch (error) {
      console.error(error);
    }
  };

  await makeConnections();

  app.listen(PORT, () => {
    console.log("Gateway service listening on port: " + PORT);
  });
};

start();
