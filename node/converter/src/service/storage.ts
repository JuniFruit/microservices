import mongoose from "mongoose";

let db: mongoose.mongo.Db;

mongoose.connection.on("connected", () => {
  db = mongoose.connections[0].db;
});

const getMongoDb = () => db;

export { getMongoDb };
