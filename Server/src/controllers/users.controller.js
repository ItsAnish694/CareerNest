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
    user.save({ validateBeforeSave: false });
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

  const emailSent = await sendEmail(email, mailBody, "Email Verification");

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

export const verifyUser = asyncHandler(async function (req, res) {
  const { token } = req.params;

  const {
    skills,
    phoneNumber,
    district,
    city,
    area,
    experiencedYears,
    interestedIndustry,
  } = req.body;

  if (
    [
      phoneNumber,
      district,
      city,
      area,
      experiencedYears,
      interestedIndustry,
    ].some((val) => !val?.trim())
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

  user.resumeLink = uploadedResume.secure_url;
  user.skills = skills;
  user.phoneNumber = phoneNumber;
  user.city = city;
  user.district = district;
  user.area = area;
  user.interestedIndustry = interestedIndustry;
  user.experiencedYears = experiencedYears;
  user.isVerified = true;

  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { redirectLink: `${process.env.CORS_ORIGIN}/user/login` },
        "Verified Successfully"
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
    throw new ApiError(
      400,
      "Wrong Password",
      "The Provided Password is Invalid"
    );

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
    sameSite: "Lax",
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

  const userProfileInfo = await User.findById(req.user?._id).select(
    "-refreshToken -password -isVerified"
  );

  if (!userProfileInfo) throw new ApiError(404, "User Not Found");

  return res
    .status(200)
    .json(new ApiResponse(200, userProfileInfo, "User Profile Info"));
});

export const updateProfileInfo = asyncHandler(async function (req, res) {
  if (!req.body || Object.keys(req.body).length === 0)
    throw new ApiError(400, "No fields provided for update");

  const allowedFields = [
    "fullname",
    "experiencedYears",
    "bio",
    "district",
    "city",
    "area",
    "interestedIndustry",
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

  const user = await User.findByIdAndUpdate(userId, updateFields, {
    runValidators: true,
    new: true,
  });

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
  const { skills } = req.body;

  if (!Array.isArray(skills) || skills.length === 0 || skills[0] === "")
    throw new ApiError(400, "Please Provide Some Skills");
  if (skills.length > 20) throw new ApiError(400, "Too Much Skill");

  const userID = req.user?._id;

  const skillsToAdd = [],
    skillsToRemove = [];
  for (const skill of skills) {
    const trimmedSkill = skill.trim().toLowerCase();

    if (trimmedSkill === "") {
      continue;
    }
    if (trimmedSkill.startsWith("#"))
      skillsToRemove.push(trimmedSkill.slice(1));
    else skillsToAdd.push(trimmedSkill);
  }

  const user = await User.findById(userID);

  if (!user) throw new ApiError(404, "User Not Found");

  user.skills = user.skills.filter((skill) => !skillsToRemove.includes(skill));

  user.skills = Array.from(new Set([...user.skills, ...skillsToAdd]));

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
    !user.profilePicture.includes("yhfkchms5dvz9we2nvga.png")
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
    throw new ApiError(400, "Wrong Password");
  }

  const isSamePassword = await user.checkPassword(updatedPassword);

  if (isSamePassword) throw new ApiError(400, "Same As Old Password");

  user.password = updatedPassword;
  user.refreshToken = undefined;
  user.save({ validateBeforeSave: true });

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
    throw new ApiError(400, "Email Already Taken");
  }

  const token = jwt.sign(
    { _id: user._id, email: trimmedEmail, type: "emailUpdate" },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "5m",
    }
  );

  const mailBody = `<a href="http://127.0.0.1:3000/api/v1/user/verifyemail?token=${token}">Verify Email</a>`;

  await sendEmail(trimmedEmail, mailBody, "Email Update");

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
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Email Successfully Updated"));
});

export const applyJobApplication = asyncHandler(async function (req, res) {
  const jobID = req.params.id;
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

  await User.updateOne({ _id: user._id }, { $inc: { applicationCount: 1 } });

  await Job.updateOne({ _id: job._id }, { $inc: { applicationCount: 1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, newApplication, "Successfully Applied"));
});

export const deleteJobApplication = asyncHandler(async function (req, res) {
  const jobID = req.params.id;
  const userID = req.user._id;

  if (!mongoose.isValidObjectId(jobID) || !mongoose.isValidObjectId(userID))
    throw new ApiError(400, "Not Valid Id");

  const appliedJob = await Application.findOne({
    $and: [{ userID }, { jobID }],
  });

  if (!appliedJob) throw new ApiError(404, "Application Not Found");

  await Application.deleteOne({ _id: appliedJob._id });

  await User.updateOne({ _id: userID }, { $inc: { applicationCount: -1 } });

  await Job.updateOne({ _id: jobID }, { $inc: { applicationCount: -1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Removed Application"));
});

export const viewJobInfo = asyncHandler(async function (req, res) {
  const jobID = req.params.id;
  const userID = req.user?._id;

  if (!jobID) throw new ApiError(404, "No Job Id", "Please Provide Job Id");

  if (!mongoose.isValidObjectId(jobID)) {
    throw new ApiError(400, "Invalid Job ID", "Job ID format is not valid");
  }

  if (!mongoose.isValidObjectId(userID)) {
    throw new ApiError(400, "Invalid User ID", "User ID format is not valid");
  }

  const user = await User.findById(userID)
    .select("skills experiencedYears interestedIndustry district city area")
    .lean();

  if (!user) throw new ApiError(404, "User Not Found");

  const jobInfo = await Job.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(jobID) },
    },
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
        relatedIndustry: 1,
        companyInfo: {
          companyName: "$companyInfo.companyName",
          companyLocation: {
            district: "$companyInfo.companyDistrict",
            city: "$companyInfo.companyCity",
            area: "$companyInfo.companyArea",
          },
          companyBio: "$companyInfo.companyBio",
        },
      },
    },
  ]);

  const matchedJobs = calculateJobMatchScores(jobInfo, user);

  return res
    .status(200)
    .json(new ApiResponse(200, matchedJobs[0], "Job Details"));
});

export const addBookmarkJob = asyncHandler(async function (req, res) {
  const jobID = req.params.id;
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
  const jobID = req.params.id;
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

  res
    .status(200)
    .json(new ApiResponse(200, deleteBookmark, "Successfully Deleted"));
});

export const getAllJobs = asyncHandler(async function (req, res) {
  const industry = req.user.interestedIndustry.toLowerCase();
  const userID = req.user._id;
  const { type = "recommended", limit = "10" } = req.query;

  if (!mongoose.isValidObjectId(userID)) {
    throw new ApiError(
      400,
      "Not A Valid Id",
      "The ID You Provided Is Not Valid"
    );
  }

  const user = await User.findById(userID)
    .select("skills experiencedYears interestedIndustry district city area")
    .lean();

  if (!user) {
    throw new ApiError(
      404,
      "User Not Found",
      "The User You Trying To Find Doesn't Exists"
    );
  }

  const getAllJobs = await Job.aggregate([
    {
      $match: {
        relatedIndustry: industry,
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: 100 },
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
        relatedIndustry: 1,
        companyInfo: {
          companyName: "$companyInfo.companyName",
          companyLocation: {
            district: "$companyInfo.companyDistrict",
            city: "$companyInfo.companyCity",
            area: "$companyInfo.companyArea",
          },
          companyBio: "$companyInfo.companyBio",
        },
      },
    },
  ]);

  if (getAllJobs.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No jobs available"));
  }

  const matchedScore = calculateJobMatchScores(getAllJobs, user).sort(
    (a, b) => {
      if (type.toLowerCase() === "recommended") {
        return b.totalMatchedScore - a.totalMatchedScore;
      }
      if (type.toLowerCase() === "top") {
        return b.applicationCount - a.applicationCount;
      }
      if (type.toLowerCase() === "latest") {
        return 0;
      }
      return 0;
    }
  );

  const parsedLimit = Math.max(1, Math.min(100, Number(limit) || 10));

  res
    .status(200)
    .json(new ApiResponse(200, matchedScore.slice(0, parsedLimit), "All Jobs"));
});
