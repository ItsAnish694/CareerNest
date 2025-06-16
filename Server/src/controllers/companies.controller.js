import jwt from "jsonwebtoken";
import validator from "validator";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { uploadCloudinary } from "../utils/cloudinary.util.js";
import { Company } from "../models/companies.model.js";
import { sendEmail } from "../utils/nodemailer.util.js";

export const registerCompany = asyncHandler(async function (req, res) {
  const { companyName, companyEmail, companyPassword } = req.body;

  if ([companyName, companyEmail, companyPassword].some((val) => !val?.trim()))
    throw new ApiError(
      400,
      "Empty Fields",
      "Please Fill All The Required Fields"
    );

  if (!validator.isEmail(companyEmail)) {
    throw new ApiError(
      400,
      "Invalid Email",
      "Please enter a valid email address"
    );
  }

  if (!validator.isStrongPassword(companyPassword)) {
    throw new ApiError(
      400,
      "Weak Password",
      "Please Provide Strong Password Containig More Than 8 Characters, Numbers, UpperCase And LowerCase Letters"
    );
  }

  const companyExist = await Company.findOne({ companyEmail });

  if (companyExist) {
    throw new ApiError(
      400,
      "Company Already Exists",
      "The Email is Already in Use"
    );
  }

  const company = await Company.create({
    companyName,
    companyPassword,
    companyEmail,
  });

  if (!company)
    throw new ApiError(
      500,
      "Error Registering",
      "Error Trying To Register Company"
    );

  if (req.file?.path) {
    const uploadedCompanyLogo = await uploadCloudinary(req.file?.path);

    if (!uploadedCompanyLogo) {
      throw new ApiError(
        500,
        "File Upload Error",
        "Error While Uploading File"
      );
    }
    const companyLogo = uploadedCompanyLogo.secure_url;
    company.companyLogo = companyLogo;
    company.save({ validateBeforeSave: false });
  }

  const token = jwt.sign({ _id: company._id }, process.env.TOKEN_SECRET, {
    expiresIn: "1d",
  });

  const mailBody = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">
    <h2 style="color: #333;">Welcome to CareerNest!</h2>
    <p style="font-size: 16px; color: #555;">
      Hi <strong>${company.companyName}</strong>,
    </p>
    <p style="font-size: 16px; color: #555;">
      Thanks for registering your company. To proceed, please verify your email by clicking below:
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CORS_ORIGIN}/company/verify/${token}" style="padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
        Verify Company
      </a>
    </div>
    <p style="font-size: 14px; color: #999;">
      Or paste this in your browser:<br/>
      <span style="color: #007BFF;">${process.env.CORS_ORIGIN}/company/verify/${token}</span>
    </p>
    <p style="font-size: 14px; color: #aaa;">
      CareerNest Team
    </p>
  </div>
`;

  const emailSent = await sendEmail(
    companyEmail,
    mailBody,
    "Email Verification"
  );

  if (!emailSent) {
    throw new ApiError(500, "Email Error", "Cant Send The Email");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        undefined,
        "An Email Is Sent To Your Email Address Verify"
      )
    );
});

export const verifyCompany = asyncHandler(async function (req, res) {
  const { token } = req.params;
  const { companyPhoneNumber, companyLocation, industry } = req.body;

  if (
    [companyPhoneNumber, industry, companyLocation].some((val) => !val?.trim())
  ) {
    throw new ApiError(
      400,
      "Empty Fields",
      "Please Fill All The Required Fields"
    );
  }

  if (!validator.isMobilePhone(companyPhoneNumber, "any")) {
    throw new ApiError(
      400,
      "Invalid Phone",
      "Please Enter a Valid Phone Number"
    );
  }

  const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);

  if (!verifiedToken || !verifiedToken._id)
    throw new ApiError(400, "Verification Expired");

  const company = await Company.findById(verifiedToken._id);

  if (!company) throw new ApiError(404, "Company Doesnt Exists");

  if (company.isVerified === "Verified") {
    throw new ApiError(
      400,
      "Already Verified",
      "Company With This Id Is Already Verified"
    );
  }

  if (company.isVerified === "Pending") {
    throw new ApiError(400, "Pending", "Verification Request Send");
  }

  if (await Company.findOne({ companyPhoneNumber })) {
    throw new ApiError(
      400,
      "Reused Phone Number",
      "User With This Phone Number Already Exists"
    );
  }

  const documentFilePath = req.file?.path;

  if (!documentFilePath) {
    throw new ApiError(
      404,
      "Documents Not Found",
      "Please Provide The Documents"
    );
  }

  const uploadedDocument = await uploadCloudinary(documentFilePath);

  if (!uploadedDocument)
    throw new ApiError(500, "Upload Failed", "Error Uploading The Documents");

  company.document = uploadedDocument.secure_url;
  company.companyPhoneNumber = companyPhoneNumber;
  company.companyLocation = companyLocation;
  company.industry = industry;
  company.isVerified = "Pending";

  await company.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { redirectLink: `${process.env.CORS_ORIGIN}/company/login` },
        "Verified Successfully"
      )
    );
});

export const loginCompany = asyncHandler(async function (req, res) {
  const { companyEmail, companyPassword } = req.body;

  if ([companyPassword, companyEmail].some((val) => !val?.trim()))
    throw new ApiError(
      400,
      "Empty Fields",
      "Please Provide All The Required Fields"
    );

  const emailTrimmed = companyEmail?.trim();
  const passwordTrimmed = companyPassword.trim();

  if (!validator.isEmail(emailTrimmed))
    throw new ApiError(
      400,
      "Invalid Email",
      "The Email You Provided Is Invalid"
    );

  const company = await Company.findOne({ companyEmail: emailTrimmed });

  if (!company)
    throw new ApiError(
      404,
      "Company Not Found",
      "Company With This Email Not Found"
    );

  if (!(await company.checkPassword(passwordTrimmed)))
    throw new ApiError(
      400,
      "Wrong Password",
      "The Provided Password is Invalid"
    );

  const accessToken = company.generateAccessToken();
  const refreshToken = company.generateRefreshToken();

  company.refreshToken = refreshToken;

  await company.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Lax", // for localHost
  };

  return res
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
