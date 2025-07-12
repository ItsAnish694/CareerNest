export function globalErrorHandler(error, req, res, next) {
  const Status = error.status || 500;
  const Message = error.message;
  const Name = error.name;
  const Stack = error.stack || undefined;

  return res.status(Status).json({
    Success: false,
    Error: {
      Status,
      Name,
      Message,
      Stack,
    },
  });
}
