import { Schema, model } from "mongoose";

const applicationSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    jobID: {
      type: Schema.Types.ObjectId,
      ref: "Job",
    },
    resume: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Accepted", "Rejected", "Pending"],
      default: "Pending",
      required: true,
    },
  },
  { timestamps: true }
);

applicationSchema.index({ userID: 1, jobID: 1 }, { unique: true });

export const Application = model("Application", applicationSchema);
