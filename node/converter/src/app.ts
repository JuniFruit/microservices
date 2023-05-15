import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || "");
    console.log("Mongo connected");

    app.listen(PORT, () => {
      console.log("Converter service is listening on port: " + PORT);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
