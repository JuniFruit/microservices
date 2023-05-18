import { FileInfo } from "busboy";
import { ObjectId } from "mongoose";

export type ReqFileMetadata = FileInfo & {
  id: string | ObjectId;
  size: number;
  username: string;
};
