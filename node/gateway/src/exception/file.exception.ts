export class UploadException extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}
