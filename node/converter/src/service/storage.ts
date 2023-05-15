import mongoose from "mongoose";

let bucket: mongoose.mongo.GridFSBucket;

mongoose.connection.on("connected", () => {
  const db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: process.env.BUCKET_NAME,
  });
});

const getUploadsBucket = () => bucket;

export { getUploadsBucket };
