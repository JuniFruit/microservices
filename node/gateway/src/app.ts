import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import gatewayRouter from "./routes/index";
import { handleException } from "./middleware/error.middleware";
import mongoose from "mongoose";
import cors from "cors";
import { MONGO_CONFIG } from "./config/mongo";

const app = express();
const PORT = process.env.GATEWAY_SERVICE_PORT || 6000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/", gatewayRouter);

app.get("*", (req, res, next) => {
  res.send("Gateway");
  next();
});

app.use(handleException);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || "", MONGO_CONFIG);
    console.log("Mongo connected");

    app.listen(PORT, () => {
      console.log("Gateway service listening on port: " + PORT);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
