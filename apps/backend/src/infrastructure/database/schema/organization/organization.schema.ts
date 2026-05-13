import { Schema } from "mongoose";

export const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: false,
      trim: true,
    },
    studentCountRange: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      required: true,
    },
    blockedBy: { type: String, required: false },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  },
);
