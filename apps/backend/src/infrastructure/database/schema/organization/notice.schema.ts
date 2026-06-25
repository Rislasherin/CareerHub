import { NoticePriority } from "@domain/enums/NoticePriority";
import { Schema } from "mongoose";

export const NoticeSchema = new Schema(
  {
    title: String,
    content: String,
    priority: {
      type: String,
      enum: Object.values(NoticePriority),
    },
    collegeId: Schema.Types.ObjectId,
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);