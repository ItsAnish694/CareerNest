import { Schema, model } from "mongoose";

const tempSchema = new Schema(
  {
    data: Object,
    token: String,
  },
  {
    timestamps: true,
  }
);

// TTL index: delete at 'expiresAt'
tempSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });

export const tempStore = model("Temp", tempSchema);
