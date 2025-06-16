import validator from "validator";
import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

export const loginAdmin = asyncHandler(async (req, res) => {
  const { adminEmail, adminPassword } = req.body;

  if ([adminEmail, adminPassword].some((val) => !val.trim()))
    throw new ApiError(400, "Empty Fields", "Fill All The Required Fields");

  const emailTrimmed = adminEmail.trim();
  const passwordTrimmed = adminPassword.trim();

  if (!validator.isEmail(emailTrimmed))
    throw new ApiError(
      400,
      "Invalid Email",
      "Please enter a valid email address"
    );

  const admin = await Admin.findOne({ adminEmail: emailTrimmed });

  if (!admin)
    throw new ApiError(
      404,
      "Admin Not Found",
      "Admin With This Email Not Found"
    );

  if (!(await admin.checkPassword(passwordTrimmed)))
    throw new ApiError(
      400,
      "Wrong Password",
      "The Provided Password is Invalid"
    );

  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();

  admin.refreshToken = refreshToken;
  admin.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Lax", // for localHost
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          redirLink: `${process.env.CORS_ORIGIN}/admin/dashboard`,
        },
        "Logged In Successfully"
      )
    );
});
