import { Schema, model } from "mongoose";

const jobSchema = new Schema(
  {
    companyID: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: "text",
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },
    requiredSkills: [
      {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    ],
    jobType: {
      type: String,
      enum: [
        "full time",
        "part time",
        "internship",
        "contract",
        "freelance",
        "remote",
      ],
      trim: true,
      lowercase: true,
      required: true,
      index: 1,
    },
    requiredExperience: {
      type: String,
      required: true,
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ["entry-level", "mid-level", "senior-level"],
      lowercase: true,
      index: 1,
    },
    salary: {
      type: String,
      default: "Negotiable",
      trim: true,
    },
    vacancies: {
      type: Number,
      required: true,
      default: 1,
    },
    applicationDeadline: {
      type: Date,
      required: true,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Job = model("Job", jobSchema);
