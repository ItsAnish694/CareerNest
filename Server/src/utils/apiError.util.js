export class ApiError extends Error {
  constructor(
    status,
    name = "Api Error",
    message = "An Error Occured",
    stack = ""
  ) {
    super(message);
    this.name = name;
    this.status = status;
    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}
