export class ApiException extends Error {
  status: number;
  errors: any[] = [];

  constructor(message: string, status: number, errors: any[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new ApiException("User is unauthorized", 401);
  }

  static BadRequest(message: string, errors?: any[]) {
    return new ApiException(message, 400, errors);
  }
}
