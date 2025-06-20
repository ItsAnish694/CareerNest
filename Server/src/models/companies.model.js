import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const companySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyLogo: {
      type: String,
      trim: true,
      default:
        "https://res.cloudinary.com/dcsgpah7o/image/upload/v1749728727/y2vmdzxonqvfcxobngfc.png",
      required: true,
    },
    companyEmail: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: true,
    },
    companyPassword: {
      trim: true,
      type: String,
      required: true,
    },
    companyPhoneNumber: {
      trim: true,
      type: String,
      unique: true,
    },
    industry: {
      type: String,
      enum: [
        "Information Technology",
        "Finance",
        "Healthcare",
        "Education",
        "Manufacturing",
        "Retail",
        "Hospitality",
        "Construction",
        "Telecommunications",
        "Media & Entertainment",
        "Transportation",
        "Energy",
        "Government",
        "Agriculture",
        "Legal",
        "Non-Profit",
        "Automotive",
        "Science & Research",
        "Arts & Design",
        "Security",
        "Others",
      ],
      required: true,
      default: "Others",
    },
    role: {
      trim: true,
      type: String,
      enum: ["company"],
      required: true,
      default: "company",
    },
    document: {
      trim: true,
      type: String,
    },
    companyBio: {
      trim: true,
      type: String,
    },
    companyDistrict: {
      trim: true,
      type: String,
      lowercase: true,
    },
    companyCity: {
      trim: true,
      type: String,
      lowercase: true,
    },
    companyArea: {
      trim: true,
      type: String,
      lowercase: true,
    },
    refreshToken: {
      trim: true,
      type: String,
    },
    isVerified: {
      type: String,
      enum: ["Not Verified", "Pending", "Verified"],
      default: "Not Verified",
    },
  },
  { timestamps: true }
);

companySchema.pre("save", async function (next) {
  if (this.isModified("companyPassword")) {
    this.companyPassword = await bcrypt.hash(this.companyPassword, 10);
  }
  next();
});

companySchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.companyPassword);
};

companySchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      companyName: this.companyName,
      companyEmail: this.companyEmail,
      companyPhoneNumber: this.companyPhoneNumber,
      role: this.role,
      industry: this.industry,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPDATE,
    }
  );
};

companySchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPDATE }
  );
};

export const Company = model("Company", companySchema);
