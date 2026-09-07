import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Logger, LogCategory } from '../infrastructure/logger/logger';
import { PlanModel } from '../infrastructure/database/models/organizer/plan.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI environment variable is missing");

const plans = [
  {
    id: 'plan_basic',
    name: 'Basic Plan',
    code: 'BASIC',
    price: 99000,
    currency: 'INR',
    billingInterval: 'yearly',
    maxStudents: 150,
    aiCredits: 2000,
    storageLimit: 10,
    features: ['Notice Board', 'Basic Resume Builder'],
    isActive: true,
  },
  {
    id: 'plan_pro',
    name: 'Pro Plan',
    code: 'PRO',
    price: 240000,
    currency: 'INR',
    billingInterval: 'yearly',
    maxStudents: -1, // unlimited
    aiCredits: 10000,
    storageLimit: 50,
    features: ['Notice Board', 'Broadcast Emails', 'Full AI Resume Builder', 'Mock Interview Bot', 'Advanced Analytics', 'Interview Calendar View'],
    isActive: true,
  }
];

async function seedPlans() {
  try {
    Logger.info(LogCategory.SYSTEM_INFO, 'Connecting to MongoDB for Plan Seeding...');
    await mongoose.connect(MONGODB_URI as string);
    Logger.info(LogCategory.SYSTEM_INFO, 'Connected successfully.');

    for (const plan of plans) {
      await PlanModel.findOneAndUpdate(
        { code: plan.code },
        { $set: plan },
        { upsert: true, new: true }
      );
    }
    
    Logger.info(LogCategory.SYSTEM_INFO, 'Plans seeded successfully.');
  } catch (error) {
    Logger.error(LogCategory.SYSTEM_ERROR, 'Error seeding plans', { error });
  } finally {
    await mongoose.disconnect();
    Logger.info(LogCategory.SYSTEM_INFO, 'Disconnected from MongoDB.');
  }
}

seedPlans();
