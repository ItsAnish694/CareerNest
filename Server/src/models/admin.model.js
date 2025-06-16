import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const adminSchema = new Schema(
  {
    adminEmail: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: true,
    },
    adminPassword: {
      trim: true,
      type: String,
      required: true,
    },
    role: {
      trim: true,
      type: String,
      enum: ["admin"],
      required: true,
      default: "admin",
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (this.isModified("adminPassword")) {
    this.adminPassword = await bcrypt.hash(this.adminPassword, 10);
  }
  next();
});

adminSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.adminPassword);
};

adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1h",
    }
  );
};

adminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "24h",
    }
  );
};

export const Admin = model("Admin", adminSchema);
