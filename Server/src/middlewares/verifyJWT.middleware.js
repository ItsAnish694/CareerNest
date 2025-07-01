import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";

export const verifyJWTAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const accessToken = req.cookies?.accessToken || bearerToken || null;

  if (!accessToken)
    throw new ApiError(401, "Access Token is Missing", "Unauthorized Access");

  const verifiedToken = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );

  if (!verifiedToken)
    throw new ApiError(403, "Invalid Token", "Failed To Verify Token");

  req.user = verifiedToken;
  next();
});
