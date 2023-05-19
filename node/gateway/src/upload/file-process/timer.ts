import { IUploadTimer } from "./fileUpload.type";

export class UploadTimer implements IUploadTimer {
  timeout: number;
  callback: TimerHandler;
  timer: NodeJS.Timeout | null | number;

  constructor(timeout = 0, callback = () => {}) {
    this.timeout = timeout;
    this.callback = callback;
    this.timer = null;
  }

  clear() {
    if (!this.timer) return;
    clearTimeout(this.timer);
  }

  set() {
    if (!this.timeout) return false;
    this.clear();
    this.timer = setTimeout(this.callback, this.timeout);
    return true;
  }
}
