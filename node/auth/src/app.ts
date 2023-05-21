import express from "express";
import indexRoutes from "./routes";
import { handleException } from "./middleware/exception.middleware";
import bodyParser from "body-parser";
const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 5000;

app.use(bodyParser.json());
app.use("/auth", indexRoutes);

app.use(handleException);

const start = () => {
  app.listen(PORT, () => {
    console.log("Auth service is online on port: " + PORT);
  });
};

start();
