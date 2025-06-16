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
      },
    ],
    jobType: {
      type: String,
      enum: [
        "Full-time",
        "Part-time",
        "Internship",
        "Contract",
        "Freelance",
        "Remote",
      ],
      required: true,
    },
    requiredExperience: {
      type: String,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Entry-level", "Mid-level", "Senior-level"],
    },
    salary: {
      type: String,
      required: true,
      default: "Negotiable",
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
