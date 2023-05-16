import express from "express";
import authRoutes from "./routes/auth.routes";
import { handleException } from "./middleware/exception.middleware";
import bodyParser from "body-parser";
const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 5000;

app.use(bodyParser.json());
app.use("/auth", authRoutes);
app.get("*", (req, res, next) => {
  res.send("Auth service");
  next();
});
app.use(handleException);

const start = () => {
  try {
    app.listen(PORT, () => {
      console.log("Auth service is online on port: " + PORT);
    });
  } catch (error) {}
};

start();
