import { Transform, TransformCallback } from "stream";

const convertBytes = (bytes: number) => {
  if (bytes >= 10 ** 9) return `${(bytes / 10 ** 9).toFixed(2)} GB`;
  if (bytes >= 10 ** 6) return `${(bytes / 10 ** 6).toFixed(2)} MB`;
  if (bytes >= 10 ** 3) return `${(bytes / 10 ** 3).toFixed(2)} KB`;
  return `${bytes} BB`;
};

class PassThrough extends Transform {
  onPass: Function;
  constructor(onPass: (chunk: any) => void) {
    super();
    this.onPass = onPass;
  }

  _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
    this.onPass(chunk);
    this.push(chunk);
    callback(null, chunk);
  }
}

export { convertBytes, PassThrough };
