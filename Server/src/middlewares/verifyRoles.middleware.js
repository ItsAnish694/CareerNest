import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";

export const verifyRoleAccess = (...roles) =>
  asyncHandler((req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      throw new ApiError(403, "Access Denied", "Unauthorized Access");
    next();
  });
