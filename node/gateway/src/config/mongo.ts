import { ConnectOptions } from "mongoose";

export const MONGO_CONFIG: ConnectOptions = {
  socketTimeoutMS: 1000 * 60 * 5,
  connectTimeoutMS: 1000 * 60 * 5,
  keepAlive: true,
};
