import mongoose from "mongoose";

let db: mongoose.mongo.Db;

mongoose.connection.on("connected", () => {
  db = mongoose.connections[0].db;
});

const getMongoDb = () => db;

const getBucket = (bucketName: string, dbInstance: mongoose.mongo.Db) => {
  return new mongoose.mongo.GridFSBucket(dbInstance, {
    bucketName,
  });
};

export { getMongoDb, getBucket };
