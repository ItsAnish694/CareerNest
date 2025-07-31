import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { User } from "../models/users.model.js";
import { Company } from "../models/companies.model.js";
import { Job } from "../models/jobs.model.js";
import { Application } from "../models/applications.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/nodemailer.util.js";
import mongoose from "mongoose";
import validator from "validator";

export const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if ([username, password].some((val) => !val?.trim())) {
    throw new ApiError(404, "Empty Fields", "Empty Required Fields");
  }

  if (
    !(
      username.trim() === process.env.ADMIN_USERNAME &&
      password.trim() === process.env.ADMIN_PASSWORD
    )
  ) {
    throw new ApiError(400, "Wrong Password", "Wrong Username or password");
  }

  const accessToken = jwt.sign(
    { role: "admin" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ADMIN_JWT_EXP }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, {
        redirLink: `/admin/dashboard`,
      })
    );
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const limit = 10;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const [users, totalDocuments] = await Promise.all([
    User.find({ isVerified: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments({ isVerified: true }),
  ]);

  const totalPages = Math.ceil(totalDocuments / limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { users, totalDocuments, totalPages, currentPage: page },
        "All Users"
      )
    );
});

export const getAllCompanies = asyncHandler(async (req, res) => {
  const filter = (req.query?.status || "Verified").toLowerCase().trim();
  const limit = 10;
  const page = Number(req.query.page) > 1 ? Number(req.query.page) : 1;
  const skip = (page - 1) * limit;

  if (!["unverified", "rejected", "pending", "verified"].includes(filter)) {
    throw new ApiError(400, "Unknown Filter", "Please Provide Proper Filter");
  }

  const [companies, totalDocuments] = await Promise.all([
    Company.find({ isVerified: filter })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Company.countDocuments({ isVerified: filter }),
  ]);

  const totalPages = Math.ceil(totalDocuments / limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { companies, totalDocuments, totalPages, currentPage: page },
        "All Companies"
      )
    );
});

export const getSingleUser = asyncHandler(async (req, res) => {
  const userID = req.params.userID;

  if (!mongoose.isValidObjectId(userID)) {
    throw new ApiError(400, "Invalid ID", "Not a Valid ID");
  }

  const user = await User.findById(userID).lean();

  if (!user) {
    throw new ApiError(404, "No User", "User Not Found");
  }

  return res.status(200).json(new ApiResponse(200, user, "User Found"));
});

export const getSingleCompany = asyncHandler(async (req, res) => {
  const companyID = req.params.companyID;

  if (!mongoose.isValidObjectId(companyID)) {
    throw new ApiError(400, "Invalid ID", "Not a Valid ID");
  }

  const company = await Company.findById(companyID).lean();

  if (!company) {
    throw new ApiError(404, "No Company", "Company Not Found");
  }

  return res.status(200).json(new ApiResponse(200, company, "Company Found"));
});

export const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const userID = req.params?.userID;

  if (!mongoose.isValidObjectId(userID)) {
    throw new ApiError(400, "Invalid ID", "Not a Valid ID");
  }

  const user = await User.findByIdAndDelete(userID);

  if (!user) {
    throw new ApiError(404, "No User", "User Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Successfully Deleted"));
});

export const deleteCompanyByAdmin = asyncHandler(async (req, res) => {
  const companyID = req.params?.companyID;

  if (!mongoose.isValidObjectId(companyID)) {
    throw new ApiError(400, "Invalid ID", "Not a Valid ID");
  }

  const company = await Company.findByIdAndDelete(companyID);

  if (!company) {
    throw new ApiError(404, "No Company", "Company Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, company, "Successfully Deleted"));
});

export const updateCompanyStatus = asyncHandler(async (req, res) => {
  const companyID = req.params?.companyID.trim().toLowerCase();
  const status = req.query?.status.trim().toLowerCase();

  if (!status) {
    throw new ApiError(400, "Unknown Status", "No Status To Update");
  }

  if (!["verified", "rejected"].includes(status)) {
    throw new ApiError(400, "Invalid Status", "Provide Valid Status");
  }

  if (!mongoose.isValidObjectId(companyID)) {
    throw new ApiError(400, "Invalid ID", "Not A Valid ID");
  }

  const company = await Company.findByIdAndUpdate(
    companyID,
    {
      $set: { isVerified: status },
    },
    { new: true }
  )
    .select("-companyPassword -refreshToken")
    .lean();

  if (!company) {
    throw new ApiError(404, "Company Not Found", "Company Dooesn't Exists");
  }

  const emailSubject = {
    verified: "Company Accepted - CareerNest Registration",
    rejected: "Company Rejected - CareerNest Registration",
  };

  const emailBody = {
    verified:
      `Dear ${company.companyName},\n\n` +
      `We are pleased to inform you that your company registration on **CareerNest** has been **ACCEPTED** by the admin team.\n\n` +
      `You now have full access to the company dashboard, where you can:\n` +
      `- Post job opportunities\n` +
      `- Manage applicants\n` +
      `- Customize your company profile\n\n` +
      `👉 Visit your dashboard: ${process.env.CORS_ORIGIN}/company/dashboard\n\n` +
      `Welcome aboard!\n\n` +
      `Best regards,\n` +
      `The CareerNest Team`,
    rejected:
      `Dear ${company.companyName},\n\n` +
      `We regret to inform you that your company registration on **CareerNest** has been **REJECTED** after review by the admin team.\n\n` +
      `This may be due to incomplete information or failure to meet our platform's verification criteria.\n\n` +
      `If you believe this was a mistake or you would like to appeal the decision, please contact us at:\n` +
      `${process.env.BUSSINESS_EMAIL}\n\n` +
      `Thank you for your interest in CareerNest.\n\n` +
      `Best regards,\n` +
      `The CareerNest Team`,
  };

  await sendEmail(
    company.companyEmail,
    emailSubject[status],
    emailBody[status]
  );

  return res
    .status(200)
    .json(new ApiResponse(200, company, `Company ${status} successfully`));
});

export const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query?.q?.trim()?.toLowerCase();

  if (!query) {
    throw new ApiError(400, "No Query", "Please Provide Search Query");
  }

  const matchObjects = validator.isEmail(query)
    ? { email: query }
    : { fullname: { $regex: new RegExp(query, "i") } };

  const searchResults = await User.find(matchObjects)
    .select("-password -refreshToken")
    .lean();

  if (searchResults.length < 1) {
    throw new ApiError(404, "No User", "User Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, searchResults, "All the Users"));
});

export const searchCompanies = asyncHandler(async (req, res) => {
  const query = req.query?.q?.trim()?.toLowerCase();

  if (!query) {
    throw new ApiError(400, "No Query", "Please Provide Search Query");
  }

  const matchObjects = validator.isEmail(query)
    ? { companyEmail: query }
    : { companyName: { $regex: new RegExp(query, "i") } };

  const searchResults = await Company.find(matchObjects)
    .select("-companyPassword -refreshToken")
    .lean();

  if (searchResults.length < 1) {
    throw new ApiError(404, "No Companies", "Companies Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, searchResults, "All the Companies"));
});

export const updateUserByAdmin = asyncHandler(async (req, res) => {
  const userID = req.params.userID;
  const { fullname, email, phoneNumber, bio, district, city, area } = req.body;

  if (!mongoose.isValidObjectId(userID)) {
    throw new ApiError(
      400,
      "Invalid ID",
      "The ID You Have Provided Is Invalid"
    );
  }

  if (
    [fullname, email, phoneNumber, bio, district, city, area].some(
      (val) => !val?.trim()
    )
  ) {
    throw new ApiError(
      400,
      "Empty Fields",
      "Please Fill All the Required Fields"
    );
  }

  if (!validator.isEmail(email.trim())) {
    throw new ApiError(400, "Invalid Email", "Please Provide Valid Email");
  }

  if (!validator.isMobilePhone(phoneNumber.trim())) {
    throw new ApiError(
      400,
      "Invalid Phone Number",
      "Please Provide Valid Phone Number"
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
  ).then((data) => data.json());

  if (properLocation.length === 0) {
    throw new ApiError(
      400,
      "Invalid Location",
      "Please Provide Proper Location"
    );
  }

  const isInNepal = properLocation[0].address.country.toLowerCase();

  if (isInNepal !== "nepal") {
    throw new ApiError(400, "Wrong Area", "Provide Locations Inside Nepal");
  }

  const normalArea = properLocation[0].display_name.split(",")[0];
  const normalCity = properLocation[0].address.city_district;
  const normalDistrict = properLocation[0].address.county;

  const user = await User.findByIdAndUpdate(
    userID,
    {
      $set: {
        fullname,
        email,
        phoneNumber,
        bio,
        area: normalArea,
        city: normalCity,
        district: normalDistrict,
      },
    },
    { new: true }
  )
    .select("-password -refreshToken")
    .lean();

  if (!user) {
    throw new ApiError(404, "Unknown User", "User Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Info Successfully Updated"));
});

export const updateCompanyByAdmin = asyncHandler(async (req, res) => {
  const companyID = req.params.companyID;
  const {
    companyName,
    companyEmail,
    companyPhoneNumber,
    companyBio,
    companyDistrict,
    companyCity,
    companyArea,
  } = req.body;

  if (!mongoose.isValidObjectId(companyID)) {
    throw new ApiError(
      400,
      "Invalid ID",
      "The ID You Have Provided Is Invalid"
    );
  }

  if (
    [
      companyName,
      companyEmail,
      companyPhoneNumber,
      companyBio,
      companyDistrict,
      companyCity,
      companyArea,
    ].some((val) => !val?.trim())
  ) {
    throw new ApiError(
      400,
      "Empty Fields",
      "Please Fill All the Required Fields"
    );
  }

  if (!validator.isEmail(companyEmail.trim())) {
    throw new ApiError(400, "Invalid Email", "Please Provide Valid Email");
  }

  if (!validator.isMobilePhone(companyPhoneNumber.trim())) {
    throw new ApiError(
      400,
      "Invalid Phone Number",
      "Please Provide Valid Phone Number"
    );
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

  const isInNepal = properLocation[0].address.country.toLowerCase();

  if (isInNepal !== "nepal") {
    throw new ApiError(400, "Wrong Area", "Provide Locations Inside Nepal");
  }

  const normalArea = properLocation[0].display_name.split(",")[0];
  const normalCity = properLocation[0].address.city_district;
  const normalDistrict = properLocation[0].address.county;

  const company = await Company.findByIdAndUpdate(
    companyID,
    {
      $set: {
        companyName,
        companyEmail,
        companyPhoneNumber,
        companyBio,
        companyArea: normalArea,
        companyCity: normalCity,
        companyDistrict: normalDistrict,
      },
    },
    { new: true }
  )
    .select("-companyPassword -refreshToken")
    .lean();

  if (!company) {
    throw new ApiError(404, "Unknown Company", "Company Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, company, "Info Successfully Updated"));
});

export const adminDashboard = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const startOfTheMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  const endOfTheMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  );

  const [
    totalUsers,
    totalCompanies,
    verifiedCompanies,
    pendingCompanies,
    totalJobPostings,
    totalApplications,
    applicationsThisMonth,
    jobsThisMonth,
  ] = await Promise.all([
    User.countDocuments(),
    Company.countDocuments(),
    Company.countDocuments({ isVerified: "verified" }),
    Company.countDocuments({ isVerified: "pending" }),
    Job.countDocuments(),
    Application.countDocuments(),
    Application.countDocuments({
      createdAt: { $gte: startOfTheMonth, $lt: endOfTheMonth },
    }),
    Job.countDocuments({
      createdAt: { $gte: startOfTheMonth, $lt: endOfTheMonth },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalCompanies,
        verifiedCompanies,
        pendingCompanies,
        totalJobPostings,
        totalApplications,
        applicationsThisMonth,
        jobsThisMonth,
      },
      "Admin Dashboard Info"
    )
  );
});

export const logoutAdmin = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(
      403,
      "Access Denied",
      "Only admin can logout via this route"
    );
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, null, "Successfully Logged Out"));
});
