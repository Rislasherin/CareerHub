import { Schema, model, Document, models } from 'mongoose';

export interface ICanonicalSkill extends Document {
  canonicalName: string;
  normalizedName: string;
  category?: string;
  isVerified: boolean;
  aliases: string[]; // List of normalized aliases mapping to this canonical skill
  createdAt: Date;
  updatedAt: Date;
}

const CanonicalSkillSchema = new Schema<ICanonicalSkill>(
  {
    canonicalName: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    aliases: [{
      type: String,
      index: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for text search and alias searching
CanonicalSkillSchema.index({ canonicalName: 'text' });

export const CanonicalSkillModel = models.CanonicalSkill || model<ICanonicalSkill>('CanonicalSkill', CanonicalSkillSchema);
