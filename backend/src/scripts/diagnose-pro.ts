import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { PlanModel } from '../infrastructure/database/models/organizer/plan.model';
import { SubscriptionModel } from '../infrastructure/database/models/organizer/subscription.model';
import { FeatureKey } from '../domain/enums/FeatureKey.enum';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI environment variable is missing");

async function diagnose() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected successfully.\n');

    // Find the PRO plan directly from MongoDB
    const proPlan: any = await PlanModel.findOne({ code: 'PRO' }).lean();
    console.log('--- DB PLAN DATA ---');
    if (!proPlan) {
      console.log('PRO Plan not found in DB!');
    } else {
      console.log(`Plan ID: ${proPlan._id}`);
      console.log(`Plan Code: ${proPlan.code}`);
      console.log(`Features Array directly from MongoDB:`, proPlan.features);
      console.log(`Contains 'MOCK_INTERVIEW'?:`, proPlan.features?.includes('MOCK_INTERVIEW'));
      console.log(`Contains 'Mock Interview Bot'?:`, proPlan.features?.includes('Mock Interview Bot'));
    }
    console.log('\n--- SYSTEM CONSTANTS ---');
    console.log(`FeatureKey.MOCK_INTERVIEW enum value:`, FeatureKey.MOCK_INTERVIEW);

    // Find any active subscription on PRO
    if (proPlan) {
      const activeSub: any = await SubscriptionModel.findOne({ planId: proPlan._id, status: 'ACTIVE' }).lean();
      console.log('\n--- ACTIVE SUBSCRIPTION ---');
      if (activeSub) {
        console.log(`Subscription ID: ${activeSub._id}`);
        console.log(`College/Org ID: ${activeSub.collegeId}`);
        console.log(`Status: ${activeSub.status}`);
        console.log(`Plan ID mapped: ${activeSub.planId}`);
      } else {
        console.log('No ACTIVE PRO subscriptions found.');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

diagnose();
