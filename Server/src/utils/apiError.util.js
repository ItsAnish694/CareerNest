export class ApiError extends Error {
  constructor(
    status,
    message = "An Error Occured",
    name = "Api Error",
    stack = ""
  ) {
    super(message);
    this.name = name;
    this.status = status;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
