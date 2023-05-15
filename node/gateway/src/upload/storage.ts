import fileUpload from "express-fileupload";
import { UPLOAD_CONFIG } from "../config/upload";
import mongoose from "mongoose";

let db: mongoose.mongo.Db;

mongoose.connection.on("connected", () => {
  db = mongoose.connections[0].db;
});
const uploadsBucket = () =>
  new mongoose.mongo.GridFSBucket(db, {
    bucketName: process.env.BUCKET_NAME,
  });

const upload = fileUpload(UPLOAD_CONFIG);

export { uploadsBucket, upload };
