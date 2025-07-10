import jwt from "jsonwebtoken";
import validator from "validator";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { searchDictionary } from "../utils/dictionary.util.js";
import {
  uploadCloudinary,
  deleteCloudinary,
} from "../utils/cloudinary.util.js";
import { Company } from "../models/companies.model.js";
import { sendEmail } from "../utils/nodemailer.util.js";
import { Job } from "../models/jobs.model.js";
import { Application } from "../models/applications.model.js";
import { Bookmark } from "../models/bookmarks.model.js";
import { User } from "../models/users.model.js";

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
    "Email Verification",
    mailBody
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
  const { companyPhoneNumber, companyDistrict, companyCity, companyArea } =
    req.body;

  if (
    [companyPhoneNumber, companyDistrict, companyCity, companyArea].some(
      (val) => !val?.trim()
    )
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
  const query = encodeURIComponent(
    `${companyArea} ${companyCity} ${companyDistrict}`
  );

  const properLocation = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&accept-language=en&format=json&limit=1&addressdetails=1`,
    {
      headers: {
        "User-Agent": `CareerNest/1.0 (${process.env.BUSSINESS_EMAIL})`,
      },
    }
  ).then((data) => data.json());

  if (properLocation.length === 0) {
    throw new ApiError(
      400,
      "Invalid Location",
      "Please Provide Proper Location"
    );
  }

  const normalizedArea = properLocation[0].display_name.split(",")[0];
  const normalizedCity = properLocation[0].address.city_district;
  const normalizedDistrict = properLocation[0].address.county;

  const isInNepal = properLocation[0].address.country;

  if (isInNepal !== "Nepal") {
    throw new ApiError(400, "Wrong Area", "Provide Locations Inside Nepal");
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
  company.companyDistrict = normalizedDistrict;
  company.companyCity = normalizedCity;
  company.companyArea = normalizedArea;
  company.isVerified = "Pending";

  await company.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { redirectLink: `${process.env.CORS_ORIGIN}/login` },
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
    sameSite: "none",
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

export const companyLogOut = asyncHandler(async function (req, res) {
  if (!req.user?._id) throw new ApiError(401, "Unauthorized");

  const companyInfo = await Company.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  ).select("-password -isVerified");

  if (!companyInfo) throw new ApiError(404, "Company Not Found");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "Successfully Logout"));
});

export const companyProfile = asyncHandler(async function (req, res) {
  if (req.user && !req.user.isVerified === "Verified")
    throw new ApiError(400, "Unverified User");

  const companyProfileInfo = await Company.findById(req.user?._id)
    .select("-refreshToken -password")
    .lean();

  if (!companyProfileInfo) throw new ApiError(404, "Company Not Found");

  const jobs = await Job.countDocuments({ companyID: companyProfileInfo._id });

  companyProfileInfo.totalJobPosting = jobs;

  return res
    .status(200)
    .json(new ApiResponse(200, companyProfileInfo, "Company Profile Info"));
});

export const updateCompanyProfileInfo = asyncHandler(async function (req, res) {
  if (!req.body || Object.keys(req.body).length === 0)
    throw new ApiError(400, "No fields provided for update");

  const allowedFields = [
    "companyName",
    "companyBio",
    "companyDistrict",
    "companyCity",
    "companyArea",
  ];

  const companyId = req.user?._id;
  if (!companyId) throw new ApiError(400, "Unauthorized", "Unverified Company");

  const updateFields = {};

  for (const key in req.body) {
    if (!allowedFields.includes(key))
      throw new ApiError(400, "Wrong", "Wrong Field To Update Provided");
    if (req.body[key].trim() === "") continue;
    if (req.body[key].trim() === "#") req.body[key] = "";
    updateFields[key] = req.body[key].trim();
  }

  const query = encodeURIComponent(
    `${updateFields.companyArea} ${updateFields.companyCity} ${updateFields.companyDistrict}`
  );

  const properLocation = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&accept-language=en&format=json&limit=1&addressdetails=1`,
    {
      headers: {
        "User-Agent": `CareerNest/1.0 (${process.env.BUSSINESS_EMAIL})`,
      },
    }
  ).then((data) => data.json());

  if (properLocation.length === 0) {
    throw new ApiError(
      400,
      "Invalid Location",
      "Please Provide Proper Location"
    );
  }

  updateFields.companyArea = properLocation[0].display_name.split(",")[0];
  updateFields.companyCity = properLocation[0].address.city_district;
  updateFields.companyDistrict = properLocation[0].address.county;

  const isInNepal = properLocation[0].address.country;

  if (isInNepal !== "Nepal") {
    throw new ApiError(400, "Wrong Area", "Provide Locations Inside Nepal");
  }

  const updatedCompany = await Company.findByIdAndUpdate(
    companyId,
    updateFields,
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updatedCompany)
    throw new ApiError(404, "Update Failed", "Company Not Found");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedCompany,
        "Company Profile Updated Successfully"
      )
    );
});

export const updateCompanyLogo = asyncHandler(async function (req, res) {
  const companyId = req.user?._id;
  const localFilePath = req.file?.path;

  if (!localFilePath) throw new ApiError(400, "No logo uploaded");

  const company = await Company.findById(companyId);
  if (!company) throw new ApiError(404, "Company not found");

  const uploaded = await uploadCloudinary(localFilePath);
  if (!uploaded || !uploaded.secure_url)
    throw new ApiError(500, "Failed to upload company logo");

  // Delete old logo if it's not the default
  const defaultLogoName = "ChatGPT_Image_Jun_16_2025_01_15_18_AM_jap5gt.png";
  if (
    company.companyLogo &&
    company.companyLogo.length > 0 &&
    !company.companyLogo.includes(defaultLogoName)
  ) {
    await deleteCloudinary(company.companyLogo);
  }

  // Update company's logo
  company.companyLogo = uploaded.secure_url;
  await company.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        company.companyLogo,
        "Company logo successfully updated"
      )
    );
});

export const updateCompanyPassword = asyncHandler(async function (req, res) {
  const { updatedPassword, currentPassword, confirmPassword } = req.body;

  if (
    [updatedPassword, currentPassword, confirmPassword].some(
      (val) => !val?.trim?.()
    )
  ) {
    throw new ApiError(400, "Provide all required password fields");
  }

  if (!validator.isStrongPassword(updatedPassword)) {
    throw new ApiError(
      400,
      "Weak Password",
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol."
    );
  }

  if (updatedPassword !== confirmPassword) {
    throw new ApiError(
      400,
      "Password Mismatch",
      "New password and confirm password do not match"
    );
  }

  const company = await Company.findById(req.user?._id);
  if (!company) throw new ApiError(404, "Company not found");

  const isCurrentPasswordCorrect = await company.checkPassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    throw new ApiError(400, "Incorrect current password");
  }

  const isSameAsOld = await company.checkPassword(updatedPassword);
  if (isSameAsOld)
    throw new ApiError(400, "New password must be different from the old one");

  company.companyPassword = updatedPassword;
  company.refreshToken = undefined;

  await company.save({ validateBeforeSave: true });

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "Company password updated successfully"));
});

export const updateCompanyEmail = asyncHandler(async function (req, res) {
  const { email } = req.body;

  const trimmedEmail = email.trim().toLowerCase();

  if (!validator.isEmail(trimmedEmail)) {
    throw new ApiError(
      400,
      "Invalid Email",
      "Please enter a valid email address"
    );
  }

  const companyId = req.user?._id;
  const company = await Company.findById(companyId);

  if (!company) throw new ApiError(404, "Company not found");

  if (trimmedEmail === company.companyEmail)
    throw new ApiError(400, "Same Email", "New email is same as current email");

  const existingCompany = await Company.findOne({ companyEmail: trimmedEmail });
  if (existingCompany) {
    throw new ApiError(400, "Email Already Taken");
  }

  const token = jwt.sign(
    { _id: company._id, email: trimmedEmail, type: "companyEmailUpdate" },
    process.env.TOKEN_SECRET,
    { expiresIn: "5m" }
  );

  const mailBody = `<a href="${process.env.CORS_ORIGIN}/company/verifyemail?token=${token}">Verify Company Email</a>`;

  await sendEmail(trimmedEmail, "Company Email Update", mailBody);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Verification email sent"));
});

export const verifyCompanyEmail = asyncHandler(async function (req, res) {
  const { token } = req.query;

  if (!token) {
    throw new ApiError(400, "Token Not Found");
  }

  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

  if (decodedToken.type !== "companyEmailUpdate") {
    throw new ApiError(400, "Invalid Token Type");
  }

  const company = await Company.findById(decodedToken._id);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  if (company.companyEmail === decodedToken.email) {
    throw new ApiError(400, "Email Already Verified");
  }

  company.companyEmail = decodedToken.email;
  await company.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { Success: true },
        "Company email successfully updated"
      )
    );
});

export const createJobPosting = asyncHandler(async function (req, res) {
  const companyID = req.user._id;

  if (!mongoose.isValidObjectId(companyID)) {
    throw new ApiError(
      400,
      "Invalid Id",
      "The Id You Have Provided Is Invalid"
    );
  }

  const company = await Company.findById(companyID).select("isVerified").lean();

  if (company.isVerified !== "Verified") {
    throw new ApiError(
      400,
      "Company Not Verified",
      "You Can't Post Job Until Verified"
    );
  }

  const {
    jobTitle,
    jobDescription,
    jobType,
    requiredSkills,
    requiredExperience,
    experienceLevel,
    salary,
    vacancies,
    applicationDeadline,
  } = req.body;

  const requiredStringFields = [
    jobTitle,
    jobDescription,
    jobType,
    requiredExperience,
    experienceLevel,
    applicationDeadline,
  ];

  const hasEmptyRequiredFields = requiredStringFields.some(
    (val) => typeof val !== "string" || !val.length
  );
  if (hasEmptyRequiredFields)
    throw new ApiError(400, "Empty Fields", "Fill all the required fields.");

  if (!validator.isDate(applicationDeadline, { format: "YYYY-MM-DD" }))
    throw new ApiError(
      400,
      "Invalid Date Format",
      "Please provide application deadline in a proper date format."
    );

  if (new Date(applicationDeadline) < new Date()) {
    throw new ApiError(400, "Invalid Date", "Deadline must be in the future.");
  }

  if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
    throw new ApiError(
      400,
      "Skills Required",
      "Please provide at least one required skill."
    );
  }

  if (!validator.isNumeric(String(vacancies)) || Number(vacancies) <= 0) {
    throw new ApiError(
      400,
      "Invalid Vacancies",
      "Vacancies must be a numeric value greater than zero."
    );
  }

  const normalizedSkills = requiredSkills.map(
    (skill) => searchDictionary.skillNormalizationMap[skill.toLowerCase()]
  );

  const availableFields = {
    jobTitle,
    jobDescription,
    requiredSkills: normalizedSkills,
    jobType,
    requiredExperience,
    experienceLevel,
    applicationDeadline,
    vacancies: Number(vacancies),
    companyID: companyID,
  };

  if (salary) availableFields.salary = salary;

  const createdJob = await Job.create(availableFields);

  if (!createdJob)
    throw new ApiError(
      500,
      "Creation Failed",
      "Unable to create the job posting."
    );

  res
    .status(200)
    .json(
      new ApiResponse(200, createdJob, "Job posting created successfully.")
    );
});

export const deleteJobPosting = asyncHandler(async function (req, res) {
  const jobID = req.params.jobID;
  const companyID = req.user._id;

  if (!mongoose.isValidObjectId(jobID)) {
    throw new ApiError(400, "Not Valid MongoID", "JobID is Not Valid");
  }

  const jobInfo = await Job.findById(jobID);

  if (!jobInfo) {
    throw new ApiError(404, "No Job Found", "No Job Found with Given ID");
  }

  if (!jobInfo.companyID.equals(companyID)) {
    throw new ApiError(403, "Forbidden", "You Can't Delete This Job");
  }

  await jobInfo.deleteOne();
  await Application.deleteMany({ jobID });
  await Bookmark.deleteMany({ jobID });

  res.status(200).json(new ApiResponse(200, null, "Job Posting Deleted"));
});

export const getJobApplications = asyncHandler(async function (req, res) {
  const jobID = req.params.jobID;
  const companyID = req.user._id;
  const status = req.query.status;
  const page = Number(req.query.page || "1");
  const limit = Number(req.query.limit || "10");
  const skip = (page - 1) * limit;

  const validStatus = ["Accepted", "Rejected", "Pending"];

  if (status && !validStatus.includes(status)) {
    throw new ApiError(
      400,
      "Invalid Status",
      "The Status You Provided is Invalid"
    );
  }

  if (
    !(mongoose.isValidObjectId(jobID) && mongoose.isValidObjectId(companyID))
  ) {
    throw new ApiError(
      400,
      "Not Valid Company Or Job",
      "The ID's You Provided Are Not Valid"
    );
  }

  const job = await Job.findOne({ _id: jobID, companyID });
  if (!job) {
    throw new ApiError(403, "Unauthorized", "This job doesn't belong to you");
  }

  const applications = await Application.aggregate([
    {
      $match: {
        jobID: new mongoose.Types.ObjectId(jobID),
        ...(status ? { status } : {}),
      },
    },
    {
      $sort: { createdAt: 1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "users",
        localField: "userID",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: {
        path: "$userInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        resume: 1,
        name: "$userInfo.fullname",
        email: "$userInfo.email",
        bio: "$userInfo.bio",
        appliedAt: "$createdAt",
        skills: "$userInfo.skills",
        profilePicture: "$userInfo.profilePicture",
        experiencedYears: "$userInfo.experiencedYears",
        status: 1,
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, applications, ""));
});

export const updateApplicationStatus = asyncHandler(async function (req, res) {
  const applicationID = req.params.id;
  const status = req.query.status;
  const companyID = req.user._id;
  const emailSubject = req.body?.subject;
  const emailBody = req.body?.body;

  const validStatuses = ["Accepted", "Rejected"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(
      400,
      "Invalid Status",
      "Status must be Accepted, Rejected"
    );
  }

  if (!mongoose.isValidObjectId(applicationID)) {
    throw new ApiError(400, "Not Valid Application ID");
  }

  const application = await Application.findById(applicationID);

  if (!application) {
    throw new ApiError(404, "Application Not Found");
  }

  if (application.status === status) {
    throw new ApiError(400, `Already ${application.status}`);
  }

  const userInfo = await User.findById(application.userID)
    .select("email")
    .lean();

  if (!userInfo) {
    throw new ApiError(
      404,
      "User Not Found",
      "User That You Are Trying to Find Doesn't Exists"
    );
  }

  const jobInfo = await Job.findById(application.jobID)
    .select("companyID jobTitle")
    .lean();

  if (!jobInfo) {
    throw new ApiError(404, "Job Not Found");
  }

  if (jobInfo.companyID.toString() !== companyID.toString()) {
    throw new ApiError(400, "Forbiden", "You can't Update the status");
  }

  application.status = status;
  await application.save({ validateBeforeSave: false });

  await sendEmail(
    userInfo.email,
    emailSubject || `Application ${status} - ${jobInfo.jobTitle}`,
    emailBody ||
      `Dear Applicant,\n\nYour application for "${
        jobInfo.jobTitle
      }" has been ${status.toLowerCase()} by ${
        req.user.companyName
      }.\n\nThank you for applying.`
  );

  res.status(200).json(new ApiResponse(200, null, `Application Accepted`));
});

export const getAllJobsPosted = asyncHandler(async function (req, res) {
  const companyID = req.user._id;
  const page = Number(req.query.page || "1");
  const limit = Number(req.query.limit || "10");
  const skip = (page - 1) * limit;

  if (!mongoose.isValidObjectId(companyID)) {
    throw new ApiError(400, "Not a Valid ID", "Company ID is not a valid ID");
  }

  const jobInfos = Job.aggregate([
    {
      $match: { companyID },
    },
    {
      $lookup: {
        from: "applications",
        foreignField: "jobID",
        localField: "_id",
        as: "allApplications",
      },
    },

    {
      $addFields: { applicationCount: { $size: "$allApplications" } },
    },
    {
      $project: {
        companyID: 0,
        allApplications: 0,
      },
    },
  ]);

  // const jobInfos = await Job.find({ companyID })
  //   .select("-companyID")
  //   .sort({ createdAt: -1 })
  //   .skip(Number(skip))
  //   .limit(Number(limit))
  //   .lean();

  res.status(200).json(new ApiResponse(200, jobInfos, ""));
});

export const companyDashboard = asyncHandler(async function (req, res) {
  const companyID = req.user._id;

  if (!mongoose.isValidObjectId(companyID)) {
    throw new ApiError(400, "Invalid Company ID", "Provided ID is not valid");
  }

  const jobs = await Job.find({ companyID }).select("_id").lean();

  const jobIDs = jobs.map((job) => job._id);

  const totalJobPosting = jobIDs.length;

  const applicationStats = await Application.aggregate([
    {
      $match: {
        jobID: { $in: jobIDs },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const allStats = {
    totalJobPosting,
    totalApplications: 0,
    totalAcceptedApplications: 0,
    totalRejectedApplications: 0,
    totalPendingApplications: 0,
  };

  for (const stats of applicationStats) {
    allStats.totalApplications += stats.count;
    if (stats._id === "Accepted") {
      allStats.totalAcceptedApplications = stats.count;
    } else if (stats._id === "Rejected") {
      allStats.totalRejectedApplications = stats.count;
    } else if (stats._id === "Pending") {
      allStats.totalPendingApplications = stats.count;
    }
  }

  return res.status(200).json(new ApiResponse(200, allStats, ""));
});
