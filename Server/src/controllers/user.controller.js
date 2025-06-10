import jwt from "jsonwebtoken";
import validator from "validator";
import fs from "fs/promises";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { uploadCloudinary } from "../utils/cloudinary.util.js";
import { User } from "../models/users.model.js";
import { tempStore } from "../models/temp.model.js";
import { sendEmail } from "../utils/nodemailer.util.js";

export const registerUser = asyncHandler(async function (req, res) {
  const { fullname, email, password, phoneNumber, location } = req.body;

  if (
    [fullname, email, password, phoneNumber, location].some(
      (val) => !val?.trim()
    )
  )
    throw new ApiError(
      400,
      "Empty Fields",
      "Please Fill All The Required Fields"
    );

  if (!validator.isEmail(email)) {
    throw new ApiError(
      400,
      "Invalid Email",
      "Please enter a valid email address"
    );
  }

  if (!validator.isMobilePhone(phoneNumber, "any")) {
    throw new ApiError(
      400,
      "Invalid Phone",
      "Please Enter a Valid Phone Number"
    );
  }

  const userExist = await User.findOne({ $or: [{ email }, { phoneNumber }] });

  if (userExist) {
    throw new ApiError(
      400,
      "User Already Exists",
      "The Email And Phone Number is Already in Use"
    );
  }

  const existedTempData = await tempStore.findOne({
    $or: [{ "data.email": email }, { "data.phoneNumber": phoneNumber }],
  });

  if (existedTempData) {
    await tempStore.deleteOne({
      $or: [{ "data.email": email }, { "data.phoneNumber": phoneNumber }],
    });
  }

  const profilePicPath = req.file?.path;

  if (!profilePicPath) {
    throw new ApiError(
      404,
      "File Path Not Found",
      "Can't Find The Path Of the Profile Picture"
    );
  }

  const token = jwt.sign({ email, phoneNumber }, process.env.TOKEN_SECRET, {
    expiresIn: "3m",
  });

  const temp = await tempStore.create({
    data: {
      fullname,
      email,
      password,
      phoneNumber,
      location,
      profilePicture: profilePicPath,
    },
    token,
  });

  if (!temp) {
    throw new ApiError(500, "Cant Create User", "error");
  }

  setTimeout(async () => {
    const stillExists = await tempStore.findOne({
      $or: [{ "data.email": email }, { "data.phoneNumber": phoneNumber }],
    });

    if (stillExists) {
      await tempStore.deleteOne({
        $or: [{ "data.email": email }, { "data.phoneNumber": phoneNumber }],
      });
      await fs.unlink(profilePicPath);
    }
  }, 300000);

  const mailBody = `
  <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
    <p>Hi there,</p>
    <p>Thanks for signing up on <strong>CareerNest</strong>! Please verify your email by clicking the button below:</p>
    
    <a
      href="http://127.0.0.1:3000/api/v1/user/verifyemail?token=${token}"
      style="
        display: inline-block;
        padding: 12px 24px;
        margin: 16px 0;
        background-color: #1d4ed8;
        color: #ffffff;
        text-decoration: none;
        font-weight: bold;
        border-radius: 6px;
        border: 1px solid #1d4ed8;
      "
      target="_blank"
    >
      Verify Email
    </a>

    <p>If you didn't request this email, you can safely ignore it.</p>
    <p style="margin-top: 24px;">Thanks,<br/>The CareerNest Team</p>
  </div>
`;

  const emailSent = await sendEmail(email, mailBody, "Email Verification");

  if (!emailSent) {
    throw new ApiError(500, "Email Error", "Cant Send The Email");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        undefined,
        "An Email Is Sent To Your Email Address Verify"
      )
    );
});

export const verifyUserEmail = asyncHandler(async function (req, res) {
  const { token } = req.query;

  if (!token) {
    throw new ApiError(404, "Token Not Found", "The Token Doesnt exists");
  }

  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

  const userInfo = await tempStore.findOne({ token });

  if (!userInfo) {
    throw new ApiError(
      404,
      "Token Expired",
      "The Token Doesnt exists or Expired"
    );
  }

  if (
    decodedToken.email !== userInfo.data.email ||
    decodedToken.phoneNumber !== userInfo.data.phoneNumber
  ) {
    throw new ApiError(400, "Wrong Token", "The Token You Provided Is Wrong");
  }

  const uploadedProfilePic = await uploadCloudinary(
    userInfo.data.profilePicture
  );

  if (!uploadedProfilePic) {
    throw new ApiError(500, "File Upload Error", "Error While Uploading File");
  }

  userInfo.data.profilePicture = uploadedProfilePic.secure_url;

  const user = await User.create({ ...userInfo.data });

  if (!user) {
    throw new ApiError(
      500,
      "Error Registering",
      "Error Trying To Register User"
    );
  }

  await tempStore.findOneAndDelete({ token });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { redirLink: `${process.env.CORS_ORIGIN}/user/login` },
        "User Created"
      )
    );
});

export const loginUser = asyncHandler(async function (req, res) {
  const { email, password } = req.body;

  if ([password, email].some((val) => !val?.trim()))
    throw new ApiError(
      400,
      "Empty Fields",
      "Please Provide All The Required Fields"
    );

  const emailTrimmed = email?.trim();

  if (!validator.isEmail(emailTrimmed))
    throw new ApiError(
      400,
      "Invalid Email",
      "The Email You Provided Is Invalid"
    );

  const user = await User.findOne({ email });

  if (!user)
    throw new ApiError(404, "User Not Found", "User With This Email Not Found");

  if (!(await user.checkPassword(password)))
    throw new ApiError(
      400,
      "Wrong Password",
      "The Provided Password is Invalid"
    );

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          redirLink: `${process.env.CORS_ORIGIN}/user/home`,
        },
        "Logged In Successfully"
      )
    );
});
