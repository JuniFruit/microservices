import { FileInfo } from "busboy";
import { ObjectId } from "mongoose";

export type ReqFileMetadata = FileInfo & {
  id: string | ObjectId;
  size: number;
  username: string;
};

export interface IUploadTimer {
  timeout: number;
  timer: ReturnType<typeof setTimeout> | null | number;
  callback: TimerHandler;

  set: () => void;
  clear: () => void;
}
