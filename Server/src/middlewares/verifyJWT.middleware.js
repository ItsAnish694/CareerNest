import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";
import { User } from "../models/user.model.js";

export const verifyJWTAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const accessToken = req.cookies?.accessToken || bearerToken || null;

  if (!accessToken)
    throw new ApiError(401, "Unauthorized Access", "Access Token is Missing");

  const verifiedToken = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );

  if (!verifiedToken || !verifiedToken._id)
    throw new ApiError(403, "Invalid Token", "Failed To Verify Token");

  const user = await User.findById(verifiedToken._id).select(
    "-password -refreshToken"
  );

  if (!user)
    throw new ApiError(404, "User Not Found", "User Not Found in Database");

  req.user = user;
  next();
});
