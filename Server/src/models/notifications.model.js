import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    companyID: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isViewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userID: 1, isViewed: 1 });

notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 7 }
);

export const Notification = model("Notification", notificationSchema);
