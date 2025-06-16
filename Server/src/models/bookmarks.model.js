import { Schema, model } from "mongoose";

const bookmarkSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Bookmark = model("Bookmark", bookmarkSchema);
