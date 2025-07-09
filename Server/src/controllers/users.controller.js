import jwt from "jsonwebtoken";
import validator from "validator";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import {
  uploadCloudinary,
  deleteCloudinary,
} from "../utils/cloudinary.util.js";
import { calculateJobMatchScores } from "../utils/calculateMatchJobScore.util.js";
import { sendEmail } from "../utils/nodemailer.util.js";
import { searchDictionary } from "../utils/dictionary.util.js";
import { User } from "../models/users.model.js";
import { Job } from "../models/jobs.model.js";
import { Application } from "../models/applications.model.js";
import { Bookmark } from "../models/bookmarks.model.js";

export const registerUser = asyncHandler(async function (req, res) {
  const { fullname, email, password } = req.body;

  if ([fullname, email, password].some((val) => !val?.trim()))
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

  if (!validator.isStrongPassword(password)) {
    throw new ApiError(
      400,
      "Weak Password",
      "Please Provide Strong Password Containig More Than 8 Characters, Numbers, UpperCase And LowerCase Letters"
    );
  }

  const userExist = await User.findOne({ email });

  if (userExist) {
    throw new ApiError(
      400,
      "User Already Exists",
      "The Email is Already in Use"
    );
  }

  const user = await User.create({
    fullname,
    password,
    email,
  });

  if (!user)
    throw new ApiError(
      500,
      "Error Registering",
      "Error Trying To Register User"
    );

  if (req.file?.path) {
    const uploadedProfilePic = await uploadCloudinary(req.file?.path);

    if (!uploadedProfilePic) {
      throw new ApiError(
        500,
        "File Upload Error",
        "Error While Uploading File"
      );
    }
    const profilePicture = uploadedProfilePic.secure_url;
    user.profilePicture = profilePicture;
    await user.save({ validateBeforeSave: false });
  }
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "1d",
  });

  const mailBody = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">
    <h2 style="color: #333;">Welcome to CareerNest!</h2>
    <p style="font-size: 16px; color: #555;">
      Hi <strong>${user.fullname || "User"}</strong>,
    </p>
    <p style="font-size: 16px; color: #555;">
      Thank you for registering on <strong>CareerNest</strong>. To complete your registration, please verify your email address by clicking the button below:
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${
        process.env.CORS_ORIGIN
      }/user/verify/${token}" style="padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
        Verify Email
      </a>
    </div>
    <p style="font-size: 14px; color: #999;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="font-size: 14px; color: #007BFF; word-break: break-all;">
      ${process.env.CORS_ORIGIN}/user/verify/${token}
    </p>
    <p style="font-size: 14px; color: #aaa; margin-top: 40px;">
      This link will expire in 24 hours for your security.
    </p>
    <p style="font-size: 14px; color: #aaa;">
      Regards,<br/>
      CareerNest Team
    </p>
  </div>
`;

  const emailSent = await sendEmail(email, "Email Verification", mailBody);

  if (!emailSent) {
    await User.findByIdAndDelete(user._id);
    throw new ApiError(500, "Email Error", "Cant Send The Email");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "An Email Is Sent To Your Email Address Verify"
      )
    );
});

export const verifyUser = asyncHandler(async function (req, res) {
  const { token } = req.params;

  const { phoneNumber, district, city, area, experiencedYears } = req.body;

  const skills = JSON.parse(req.body.skills);

  if (
    [phoneNumber, district, city, area, experiencedYears].some(
      (val) => !val?.trim()
    )
  ) {
    throw new ApiError(
      400,
      "Empty Fields",
      "Please Fill All The Required Fields"
    );
  }

  if (!skills || !Array.isArray(skills) || skills.length <= 0) {
    throw new ApiError(
      400,
      "Empty Fields",
      "Please Fill All The Required Fields"
    );
  }

  if (!validator.isMobilePhone(phoneNumber, "any")) {
    throw new ApiError(
      400,
      "Invalid Phone",
      "Please Enter a Valid Phone Number"
    );
  }

  const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);

  if (!verifiedToken || !verifiedToken._id)
    throw new ApiError(400, "Verification Expired");

  const user = await User.findById(verifiedToken._id);

  if (!user) throw new ApiError(404, "User Doesnt Exists");

  if (user.isVerified) {
    throw new ApiError(
      400,
      "Already Verified",
      "User With This Id Is Already Verified"
    );
  }
  const query = encodeURIComponent(`${area} ${city} ${district}`);

  const properLocation = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&accept-language=en&format=json&limit=1&addressdetails=1`,
    {
      headers: {
        "User-Agent": `CareerNest/1.0 (${process.env.BUSSINESS_EMAIL})`,
      },
    }
  ).then((data) => {
    console.log(data);

    return data.json();
  });

  if (properLocation.length === 0) {
    throw new ApiError(
      400,
      "Invalid Location",
      "Please Provide Proper Location"
    );
  }

  const normalizedArea = properLocation[0].display_name.split(",")[0];
  const normalizedCity = properLocation[0].address.city_district;
  const isInNepal = properLocation[0].address.country;
  const normalizedDistrict = properLocation[0].address.county;

  if (isInNepal !== "Nepal") {
    throw new ApiError(400, "Wrong Area", "Provide Locations Inside Nepal");
  }

  if (await User.findOne({ phoneNumber })) {
    throw new ApiError(
      400,
      "Reused Phone Number",
      "User With This Phone Number Already Exists"
    );
  }

  const resumeFilePath = req.file?.path;

  if (!resumeFilePath) {
    throw new ApiError(404, "Resume Not Found", "Please Provide The Resume");
  }

  const uploadedResume = await uploadCloudinary(resumeFilePath);

  if (!uploadedResume)
    throw new ApiError(500, "Upload Failed", "Error Uploading The Resume File");

  const normalizedSkills = skills.map(
    (skill) => searchDictionary.skillNormalizationMap[skill.toLowerCase()]
  );

  user.resumeLink = uploadedResume.secure_url;
  user.skills = normalizedSkills;
  user.phoneNumber = phoneNumber;
  user.city = normalizedCity;
  user.district = normalizedDistrict;
  user.area = normalizedArea;
  user.experiencedYears = experiencedYears;
  user.isVerified = true;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Verified Successfully"));
});

export const loginUser = asyncHandler(async function (req, res) {
  // const { email, password } = req.body;
  const email = req.body?.userEmail;
  const password = req.body?.userPassword;

  if ([password, email].some((val) => !val?.trim()))
    throw new ApiError(
      400,
      "Empty Fields",
      "Please Provide All The Required Fields"
    );

  const emailTrimmed = email.trim();
  const passwordTrimmed = password.trim();

  if (!validator.isEmail(emailTrimmed))
    throw new ApiError(
      400,
      "Invalid Email",
      "The Email You Provided Is Invalid"
    );

  const user = await User.findOne({ email: emailTrimmed });

  if (!user)
    throw new ApiError(404, "User Not Found", "User With This Email Not Found");

  if (!(await user.checkPassword(passwordTrimmed)))
    throw new ApiError(400, "Wrong Password", "The Provided Password is Wrong");

  if (!user.isVerified)
    throw new ApiError(
      400,
      "Unverified User",
      "User is Not Verified Please Verify First"
    );

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, user, "Logged In Successfully"));
});

export const userLogOut = asyncHandler(async function (req, res) {
  if (!req.user?._id) throw new ApiError(401, "Unauthorized");

  const userInfo = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  ).select("-password -isVerified");

  if (!userInfo) throw new ApiError(404, "User Not Found");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "Successfully Logout"));
});

export const userProfile = asyncHandler(async function (req, res) {
  if (req.user && !req.user.isVerified)
    throw new ApiError(400, "Unverified User");

  const user = await User.findById(req.user?._id).select(
    "-refreshToken -password"
  );

  if (!user) throw new ApiError(404, "User Not Found");

  const userProfileInfo = user.toObject();
  userProfileInfo.applicationCount = await Application.countDocuments({
    userID: userProfileInfo._id,
  });
  userProfileInfo.bookmarkCount = await Bookmark.countDocuments({
    userID: userProfileInfo._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, userProfileInfo, "User Profile Info"));
});

export const updateProfileInfo = asyncHandler(async function (req, res) {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError(400, "No fields provided for update");
  }

  const allowedFields = [
    "fullname",
    "experiencedYears",
    "bio",
    "district",
    "city",
    "area",
  ];

  const userId = req.user?._id;
  if (!userId) throw new ApiError(400, "Unverified User");

  const updateFields = {};

  for (const key in req.body) {
    if (!allowedFields.includes(key))
      throw new ApiError(400, "Wrong", "Wrong Field To Update Provided");
    if (req.body[key].trim() === "") continue;
    if (req.body[key].trim() === "#") req.body[key] = "";
    updateFields[key] = req.body[key].trim();
  }

  const query = encodeURIComponent(
    `${updateFields.area} ${updateFields.city} ${updateFields.district}`
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

  const isInNepal = properLocation[0].address.country;

  if (isInNepal !== "Nepal") {
    throw new ApiError(400, "Wrong Area", "Provide Locations Inside Nepal");
  }

  updateFields.area = properLocation[0].display_name.split(",")[0];
  updateFields.city = properLocation[0].address.city_district;
  updateFields.district = properLocation[0].address.county;

  const user = await User.findByIdAndUpdate(userId, updateFields, {
    runValidators: true,
    new: true,
  }).select("-refreshToken -password -isVerified");

  if (!user)
    throw new ApiError(
      404,
      "Update Failed",
      "User With This ID Doesn't Exists"
    );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Updated Successfully"));
});

export const updateUserSkills = asyncHandler(async function (req, res) {
  const skills = req.body.skills;

  const validSkills = skills.filter((skill) => skill.trim() !== "");
  if (validSkills.length === 0)
    throw new ApiError(400, "No valid skills provided");

  if (skills.length > 20) throw new ApiError(400, "Too Much Skill");

  const userID = req.user?._id;

  const user = await User.findById(userID).select(
    "-refreshToken -password -isVerified"
  );

  if (!user) throw new ApiError(404, "User Not Found");
  const normalizedSkills = skills.map(
    (skill) => searchDictionary.skillNormalizationMap[skill.toLowerCase()]
  );

  user.skills = normalizedSkills;

  await user.save();

  return res.json(new ApiResponse(200, user, "Skills Updated"));
});

export const updateProfilePicture = asyncHandler(async function (req, res) {
  const userID = req.user?._id;
  const updatedProfilePicture = req.file?.path;

  if (!updatedProfilePicture) throw new ApiError(404, "No Profile Picture");

  const user = await User.findById(userID);

  if (!user) throw new ApiError(404, "User Not Found");

  const uploadedPicture = await uploadCloudinary(updatedProfilePicture);

  if (!uploadedPicture)
    throw new ApiError(500, "Error Uploading Profile Picture");

  if (
    user.profilePicture.length > 0 &&
    !user.profilePicture.endsWith(
      "ChatGPT_Image_Jun_16_2025_01_15_18_AM_jap5gt.png"
    )
  ) {
    await deleteCloudinary(user.profilePicture);
  }

  user.profilePicture = uploadedPicture.secure_url;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.profilePicture,
        "Profile Picture Successfully Updated"
      )
    );
});

export const updateResume = asyncHandler(async function (req, res) {
  const userID = req.user?._id;
  const updatedResume = req.file?.path;

  if (!updatedResume) throw new ApiError(404, "No Resume");

  const user = await User.findById(userID);

  if (!user) throw new ApiError(404, "User Not Found");

  const uploadedResume = await uploadCloudinary(updatedResume);

  if (!uploadedResume) throw new ApiError(500, "Error Uploading Resume");

  if (user.resumeLink.length > 0) {
    await deleteCloudinary(user.resumeLink);
  }

  user.resumeLink = uploadedResume.secure_url;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user.resumeLink, "Resume Successfully Updated"));
});

export const updatePassword = asyncHandler(async function (req, res) {
  const { updatedPassword, currentPassword, confirmPassword } = req.body;

  if (
    [updatedPassword, currentPassword, confirmPassword].some(
      (val) => !val.trim()
    )
  ) {
    throw new ApiError(400, "Provide All The Required Information");
  }

  if (!validator.isStrongPassword(updatedPassword)) {
    throw new ApiError(
      400,
      "Weak Password",
      "Please Provide Strong Password Containig More Than 8 Characters, Numbers, UpperCase And LowerCase Letters"
    );
  }

  if (updatedPassword !== confirmPassword) {
    throw new ApiError(
      400,
      "Wrong Confirm Password",
      "New Password And Confirm Password Must Be Same"
    );
  }

  const user = await User.findById(req.user?._id);

  if (!user) throw new ApiError(404, "User Not Found");

  const isCorrectPassword = await user.checkPassword(currentPassword);

  if (!isCorrectPassword) {
    throw new ApiError(400, "", "Wrong Password");
  }

  const isSamePassword = await user.checkPassword(updatedPassword);

  if (isSamePassword)
    throw new ApiError(
      400,
      "Same Password",
      "New Password Is Same As Old Password"
    );

  user.password = updatedPassword;
  user.refreshToken = undefined;
  user.save();

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "Successfully Updated Password"));
});

export const updateEmail = asyncHandler(async function (req, res) {
  const { email } = req.body;

  const trimmedEmail = email.trim().toLowerCase();

  if (!validator.isEmail(trimmedEmail)) {
    throw new ApiError(
      400,
      "Invalid Email",
      "Please enter a valid email address"
    );
  }

  const userID = req.user?._id;

  const user = await User.findById(userID);

  if (!user) throw new ApiError(404, "User Not Found");

  if (trimmedEmail === user.email)
    throw new ApiError(400, "Same Email", "New Email Is Same As Old Email");

  const existingUser = await User.findOne({ email: trimmedEmail });
  if (existingUser) {
    throw new ApiError(400, "Existing Email", "Email Already Taken");
  }

  const token = jwt.sign(
    { _id: user._id, email: trimmedEmail, type: "emailUpdate" },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "5m",
    }
  );

  const mailBody = `<a href="${process.env.CORS_ORIGIN}/user/verifyemail?token=${token}">Verify Email</a>`;

  await sendEmail(trimmedEmail, "Email Update", mailBody);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Verification Email Sent"));
});

export const verifyEmail = asyncHandler(async function (req, res) {
  const { token } = req.query;

  if (!token) {
    throw new ApiError(400, "Token Not Found");
  }

  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

  if (decodedToken.type !== "emailUpdate") {
    throw new ApiError(400, "Invalid Token Type");
  }

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  if (user.email === decodedToken.email) {
    throw new ApiError(400, "Email Already Verified");
  }

  user.email = decodedToken.email;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Email Successfully Updated"));
});

export const applyJobApplication = asyncHandler(async function (req, res) {
  const jobID = req.params.jobID;
  const userID = req.user._id;

  if (!mongoose.isValidObjectId(jobID) || !mongoose.isValidObjectId(userID))
    throw new ApiError(400, "Not Valid Id");

  const job = await Job.findById(jobID).select("_id");

  if (!job)
    throw new ApiError(
      404,
      "Job Not Found",
      "The Job You are Trying To Apply Doesn't Exists Or Deleted"
    );

  const user = await User.findById(userID).select("_id resumeLink");

  if (!user) throw new ApiError(404, "User Not Found");

  const alreadyApplied = await Application.findOne({ userID, jobID });
  if (alreadyApplied)
    throw new ApiError(
      400,
      "Already Applied",
      "You have already applied for this job"
    );

  const newApplication = await Application.create({
    jobID: job._id,
    userID: user._id,
    status: "Pending",
    resume: user.resumeLink,
  });

  if (!newApplication)
    throw new ApiError(500, "Error Applying Job", "Please Try Again");

  await Job.updateOne({ _id: job._id }, { $inc: { applicationCount: 1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, newApplication, "Successfully Applied"));
});

export const deleteJobApplication = asyncHandler(async function (req, res) {
  const jobID = req.params.jobID;
  const userID = req.user._id;

  if (!mongoose.isValidObjectId(jobID) || !mongoose.isValidObjectId(userID))
    throw new ApiError(400, "Not Valid Id");

  const appliedJob = await Application.findOne({
    $and: [{ userID }, { jobID }],
  });

  if (!appliedJob) throw new ApiError(404, "Application Not Found");

  await Application.deleteOne({ _id: appliedJob._id });

  await Job.updateOne({ _id: jobID }, { $inc: { applicationCount: -1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Removed Application"));
});

export const addBookmarkJob = asyncHandler(async function (req, res) {
  const jobID = req.params.jobID;
  const userID = req.user._id;

  if (!(mongoose.isValidObjectId(jobID) && mongoose.isValidObjectId(userID))) {
    throw new ApiError(
      400,
      "Not Valid User Or Job",
      "The ID's You Provided Are Not Valid"
    );
  }

  const bookmarkExists = await Bookmark.findOne({ userID, jobID });

  if (bookmarkExists) {
    throw new ApiError(
      400,
      "Already Bookmarked",
      "The Job is Already Bookmarked"
    );
  }

  const bookmarkedJob = await Bookmark.create({ jobID, userID });

  if (!bookmarkedJob) {
    throw new ApiError(500, "Error Bookmark", "Can't Bookmark The Job");
  }

  await User.findByIdAndUpdate(userID, { $inc: { bookmarkCount: 1 } });

  res.status(200).json(new ApiResponse(200, null, "Saved To Bookmark"));
});

export const deleteBookmarkJob = asyncHandler(async function (req, res) {
  const jobID = req.params.jobID;
  const userID = req.user._id;

  if (!(mongoose.isValidObjectId(jobID) && mongoose.isValidObjectId(userID))) {
    throw new ApiError(
      400,
      "Not Valid User Or Job",
      "The ID's You Provided Are Not Valid"
    );
  }

  const deleteBookmark = await Bookmark.findOneAndDelete({ userID, jobID });

  if (!deleteBookmark) {
    throw new ApiError(
      404,
      "Bookmark Not Found",
      "The Bookmark Doesn't Exists"
    );
  }

  await User.findByIdAndUpdate(userID, { $inc: { bookmarkCount: -1 } });

  res.status(200).json(new ApiResponse(200, null, "Successfully Deleted"));
});

export const getAllBookmarks = asyncHandler(async function (req, res) {
  const userID = req.user._id;
  const limit = Number(req.query.limit) || 9;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  if (!mongoose.isValidObjectId(userID)) {
    throw new ApiError(
      400,
      "Invalid User ID",
      "The Id You Provided Is Invalid"
    );
  }

  const user = await User.findById(userID)
    .select("-password -refreshToken")
    .lean();

  const bookMarkedJobs = await Bookmark.aggregate([
    {
      $match: { userID: new mongoose.Types.ObjectId(user._id) },
    },
    {
      $sort: { createdAt: -1 },
    },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "jobs",
        localField: "jobID",
        foreignField: "_id",
        as: "jobInfo",
      },
    },
    {
      $unwind: {
        path: "$jobInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "companies",
        foreignField: "_id",
        localField: "jobInfo.companyID",
        as: "companyInfo",
      },
    },
    {
      $unwind: {
        path: "$companyInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: "$jobInfo._id",
        jobTitle: "$jobInfo.jobTitle",
        jobDescription: "$jobInfo.jobDescription",
        jobType: "$jobInfo.jobType",
        experienceLevel: "$jobInfo.experienceLevel",
        salary: "$jobInfo.salary",
        vacancies: "$jobInfo.vacancies",
        applicationDeadline: "$jobInfo.applicationDeadline",
        applicationCount: "$jobInfo.applicationCount",
        createdAt: "$jobInfo.createdAt",
        requiredSkills: "$jobInfo.requiredSkills",
        requiredExperience: "$jobInfo.requiredExperience",
        companyInfo: {
          companyName: "$companyInfo.companyName",
          companyLocation: {
            district: "$companyInfo.companyDistrict",
            city: "$companyInfo.companyCity",
            area: "$companyInfo.companyArea",
          },
          companyBio: "$companyInfo.companyBio",
          companyLogo: "$companyInfo.companyLogo",
        },
      },
    },
  ]);

  const jobsWithScore = calculateJobMatchScores(bookMarkedJobs, user);

  return res.status(200).json(new ApiResponse(200, jobsWithScore, ""));
});

export const getAppliedJobs = asyncHandler(async function (req, res) {
  const limit = Number(req.query.limit) || 9;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const userID = req.user._id;

  if (!mongoose.isValidObjectId(userID)) {
    throw new ApiError(
      400,
      "Invalid User ID",
      "The Id You Provided Is Invalid"
    );
  }

  const user = await User.findById(userID)
    .select("-password -refreshToken")
    .lean();

  const appliedJobs = await Application.aggregate([
    {
      $match: { userID: new mongoose.Types.ObjectId(user._id) },
    },
    { $skip: skip },
    {
      $sort: { createdAt: -1 },
    },
    { $limit: limit },
    {
      $lookup: {
        from: "jobs",
        localField: "jobID",
        foreignField: "_id",
        as: "jobInfo",
      },
    },
    {
      $unwind: { path: "$jobInfo", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "companies",
        foreignField: "_id",
        localField: "jobInfo.companyID",
        as: "companyInfo",
      },
    },
    {
      $unwind: { path: "$companyInfo", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        status: 1,
        _id: "$jobInfo._id",
        jobTitle: "$jobInfo.jobTitle",
        jobDescription: "$jobInfo.jobDescription",
        jobType: "$jobInfo.jobType",
        experienceLevel: "$jobInfo.experienceLevel",
        salary: "$jobInfo.salary",
        vacancies: "$jobInfo.vacancies",
        applicationDeadline: "$jobInfo.applicationDeadline",
        applicationCount: "$jobInfo.applicationCount",
        createdAt: "$jobInfo.createdAt",
        requiredSkills: "$jobInfo.requiredSkills",
        requiredExperience: "$jobInfo.requiredExperience",
        companyInfo: {
          companyName: "$companyInfo.companyName",
          companyLocation: {
            district: "$companyInfo.companyDistrict",
            city: "$companyInfo.companyCity",
            area: "$companyInfo.companyArea",
          },
          companyLogo: "$companyInfo.companyLogo",
          companyBio: "$companyInfo.companyBio",
        },
      },
    },
  ]);

  const jobsWithScore = calculateJobMatchScores(appliedJobs, user);

  return res.status(200).json(new ApiResponse(200, jobsWithScore, ""));
});

export const getAllJobsDetails = asyncHandler(async function (req, res) {
  const { type = "recommended", limit = "9", page = "1" } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const jobID = req.query?.jobID;
  const userID = req.user._id;

  const userInfo = await User.findById(userID)
    .select("-password -refreshToken")
    .lean();

  if (userInfo) {
    if (!userInfo.skills || !userInfo.skills.length) {
      if (type === "recommended") {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              [],
              "User skills are required for recommendations"
            )
          );
      }
    }
  }

  const sort = {
    recommended: { createdAt: -1 },
    top: { applicationCount: -1 },
    latest: { createdAt: -1 },
  };
  const aggregationLimit = type === "recommended" ? 100 : Number(limit);

  const matchObject = {
    applicationDeadline: { $gte: new Date() },
  };

  if (jobID) {
    matchObject._id = new mongoose.Types.ObjectId(jobID);
  }

  const totalCount = await Job.countDocuments(matchObject);

  const getAllJobs = await Job.aggregate([
    {
      $match: matchObject,
    },
    { $sort: sort[type] || { createdAt: -1 } },
    { $skip: skip },
    { $limit: aggregationLimit },
    {
      $lookup: {
        from: "companies",
        localField: "companyID",
        foreignField: "_id",
        as: "companyInfo",
      },
    },
    {
      $unwind: {
        path: "$companyInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        jobTitle: 1,
        jobDescription: 1,
        requiredSkills: 1,
        jobType: 1,
        requiredExperience: 1,
        experienceLevel: 1,
        salary: 1,
        vacancies: 1,
        applicationDeadline: 1,
        applicationCount: 1,
        createdAt: 1,
        companyInfo: {
          companyName: "$companyInfo.companyName",
          companyLocation: {
            district: "$companyInfo.companyDistrict",
            city: "$companyInfo.companyCity",
            area: "$companyInfo.companyArea",
          },
          companyLogo: "$companyInfo.companyLogo",
          companyBio: "$companyInfo.companyBio",
        },
      },
    },
  ]);

  if (jobID) {
    if (await Application.findOne({ jobID, userID }))
      getAllJobs[0].isApplied = true;
    if (await Bookmark.findOne({ jobID, userID }))
      getAllJobs[0].isBookmarked = true;
    return res.status(200).json(new ApiResponse(200, getAllJobs[0], ""));
  }

  if (getAllJobs.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No jobs available"));
  }

  const datawithMatchedScore = calculateJobMatchScores(getAllJobs, userInfo);

  let data = [];

  if (type === "recommended") {
    data = datawithMatchedScore
      .sort((a, b) => {
        const maxSort = b.totalMatchedScore * 0.7 + b.applicationCount * 0.3;
        const minSort = a.totalMatchedScore * 0.7 + a.applicationCount * 0.3;
        return maxSort - minSort;
      })
      .slice(0, Number(limit));
  } else {
    data = datawithMatchedScore;
  }
  data.push({ totalCount });

  res.status(200).json(new ApiResponse(200, data, ""));
});

export const searchJobs = asyncHandler(async function (req, res) {
  const { q, limit = "9", page = "1" } = req.query;

  const userID = req.user._id;
  const skip = (Number(page) - 1) * Number(limit);
  const aggregationLimit = 100;
  const queryArray = q
    .split(" ")
    .map((val) => val.trim().toLowerCase())
    .filter((query) => query !== "");

  const categories = ["requiredSkills", "experienceLevel", "jobType"];

  const matchObjects = [];

  for (const categorie of categories) {
    matchObjects.push(
      ...searchDictionary[categorie]
        .filter((dictionaryValue) =>
          queryArray.some((val) => dictionaryValue.startsWith(val))
        )
        .map((filteredValue) => ({
          [categorie]: new RegExp(`^${filteredValue}`, "i"),
        }))
    );
  }

  if (!(matchObjects.length > 0)) {
    throw new ApiError(
      404,
      "No Jobs Found",
      "There Are No Jobs Related To The Search"
    );
  }

  if (!mongoose.isValidObjectId(userID)) {
    throw new ApiError(
      400,
      "Invalid User ID",
      "The Id You Provided Is Invalid"
    );
  }

  const userInfo = await User.findById(userID)
    .select("-refreshToken -password")
    .lean();

  const totalCount = await Job.countDocuments({
    $and: [
      { $or: matchObjects },
      { applicationDeadline: { $gte: new Date() } },
    ],
  });

  const searchedJobs = await Job.aggregate([
    {
      $match: {
        $and: [
          { $or: matchObjects },
          { applicationDeadline: { $gte: new Date() } },
        ],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    { $skip: skip },
    {
      $limit: aggregationLimit,
    },
    {
      $lookup: {
        from: "companies",
        foreignField: "_id",
        localField: "companyID",
        as: "companyInfo",
      },
    },
    {
      $unwind: {
        path: "$companyInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        jobTitle: 1,
        jobDescription: 1,
        requiredSkills: 1,
        jobType: 1,
        requiredExperience: 1,
        experienceLevel: 1,
        salary: 1,
        vacancies: 1,
        applicationDeadline: 1,
        applicationCount: 1,
        createdAt: 1,
        companyInfo: {
          companyName: "$companyInfo.companyName",
          companyLocation: {
            district: "$companyInfo.companyDistrict",
            city: "$companyInfo.companyCity",
            area: "$companyInfo.companyArea",
          },
          companyLogo: "$companyInfo.companyLogo",
          companyBio: "$companyInfo.companyBio",
        },
      },
    },
  ]);

  if (!(searchedJobs.length > 0)) {
    throw new ApiError(
      404,
      "No Jobs Found",
      "There Are No Jobs Related To The Search"
    );
  }

  const jobsWithMatchedScore = calculateJobMatchScores(searchedJobs, userInfo);

  const data = jobsWithMatchedScore
    .sort((a, b) => {
      const maxSort = b.totalMatchedScore * 0.7 + b.applicationCount * 0.3;
      const minSort = a.totalMatchedScore * 0.7 + a.applicationCount * 0.3;
      return maxSort - minSort;
    })
    .slice(0, Number(limit));

  data.push({ totalCount });

  res.status(200).json(new ApiResponse(200, data, ""));
});

export const homePage = asyncHandler(async function (req, res) {
  const isLoggedIn = req?.user;
  if (!isLoggedIn) {
    throw new ApiError(400, "User Not Logged In");
  }
  return res.status(200).json(new ApiResponse(200, null, "User Is Logged In"));
});

// {
//     "Success": false,
//     "Error": {
//         "Status": 500,
//         "Name": "SyntaxError",
//         "Message": "Unexpected token '<', \"<html>\n<he\"... is not valid JSON",
//         "Stack": "SyntaxError: Unexpected token '<', \"<html>\n<he\"... is not valid JSON\n    at JSON.parse (<anonymous>)\n    at parseJSONFromBytes (node:internal/deps/undici/undici:5738:19)\n    at successSteps (node:internal/deps/undici/undici:5719:27)\n    at fullyReadBody (node:internal/deps/undici/undici:4609:9)\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\n    at async consumeBody (node:internal/deps/undici/undici:5728:7)\n    at async file:///opt/render/project/src/Server/src/controllers/users.controller.js:189:26\n    at async file:///opt/render/project/src/Server/src/utils/asyncHandler.util.js:3:5"
//     }
// }
