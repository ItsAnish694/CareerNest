import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      trim: true,
      default:
        "https://res.cloudinary.com/dcsgpah7o/image/upload/v1751301683/ChatGPT_Image_Jun_16_2025_01_15_18_AM_jap5gt.png",
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: true,
    },
    password: {
      trim: true,
      type: String,
      required: true,
    },
    phoneNumber: {
      trim: true,
      type: String,
    },
    resumeLink: {
      trim: true,
      type: String,
    },
    role: {
      type: String,
      enum: ["user"],
      required: true,
      default: "user",
    },
    skills: [
      {
        trim: true,
        lowercase: true,
        type: String,
      },
    ],
    experiencedYears: {
      type: String,
      trim: true,
      default: "No Experience",
      required: true,
    },
    bio: {
      trim: true,
      type: String,
    },
    district: {
      trim: true,
      type: String,
      lowercase: true,
    },
    city: {
      trim: true,
      type: String,
      lowercase: true,
    },
    area: {
      trim: true,
      type: String,
      lowercase: true,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    bookmarkCount: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      trim: true,
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullname: this.fullname,
      experiencedYears: this.experiencedYears,
      skills: this.skills,
      district: this.district,
      city: this.city,
      area: this.area,
      role: this.role,
      isVerified: this.isVerified,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPDATE }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      isVerified: this.isVerified,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPDATE }
  );
};

export const User = model("User", userSchema);
