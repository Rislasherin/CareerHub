import { Schema } from "mongoose";

export const CollegeAdminSchema = new Schema(
    {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      password: {
        type: String,
        required: true,
      },

      orgId: {
        type: String,
        required: true,
      },

      role: {
        type: String,
        required: true,
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
    }
  );