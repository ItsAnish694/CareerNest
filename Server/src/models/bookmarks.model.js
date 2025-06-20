import { Schema, model } from "mongoose";

const bookmarkSchema = new Schema(
  {
    jobID: {
      type: Schema.Types.ObjectId,
      ref: "Job",
    },
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userID: 1, jobID: 1 }, { unique: true });

export const Bookmark = model("Bookmark", bookmarkSchema);
