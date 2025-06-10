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
      default: "",
      required: true,
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
      required: true,
      unique: true,
    },
    resume: {
      trim: true,
      type: String,
    },
    role: {
      trim: true,
      type: String,
      enum: ["user"],
      required: true,
      default: "user",
    },
    skills: [
      {
        trim: true,
        type: String,
      },
    ],
    applications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
    experienceYears: {
      type: String,
      trim: true,
      default: "No Experience",
      required: true,
    },
    prevExperiences: [
      {
        companyName: {
          type: String,
          trim: true,
          required: true,
        },
        position: {
          type: String,
          trim: true,
          required: true,
        },
        duration: {
          trim: true,
          type: String,
          required: true,
        },
      },
    ],
    bio: {
      trim: true,
      type: String,
    },
    location: {
      trim: true,
      type: String,
      required: true,
    },
    bookmarked: [
      {
        type: Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    refreshToken: {
      trim: true,
      type: String,
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
      email: this.email,
      phoneNumber: this.phoneNumber,
      role: this.role,
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
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPDATE }
  );
};

export const User = model("User", userSchema);
