import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Logger, LogCategory } from '../infrastructure/logger/logger';
import { SubscriptionModel } from '../infrastructure/database/models/organizer/subscription.model';
import { PlanModel } from '../infrastructure/database/models/organizer/plan.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI environment variable is missing");

async function migrateSubscriptions() {
  try {
    Logger.info(LogCategory.SYSTEM_INFO, 'Connecting to MongoDB for Subscription Migration...');
    await mongoose.connect(MONGODB_URI as string);
    Logger.info(LogCategory.SYSTEM_INFO, 'Connected successfully.');

    const basicPlan = await PlanModel.findOne({ code: 'BASIC' });
    const proPlan = await PlanModel.findOne({ code: 'PRO' });

    if (!basicPlan || !proPlan) {
        throw new Error("Plans not found. Please run seed-plans.ts first.");
    }

    const subscriptions = await SubscriptionModel.find();
    
    for (const sub of subscriptions) {
      const anySub = sub as any;
      if (anySub.planType && !anySub.planId) {
        // Map planType to planId
        const planId = anySub.planType === 'PRO' ? proPlan.id : basicPlan.id;
        
        await SubscriptionModel.updateOne(
          { id: sub.id },
          { 
            $set: { 
                planId: planId,
                aiCreditsAllocated: anySub.aiTokensAllocated || 0,
                aiCreditsConsumed: 0
            },
            $unset: { planType: "", aiTokensAllocated: "" }
          }
        );
      }
    }
    
    Logger.info(LogCategory.SYSTEM_INFO, 'Subscriptions migrated successfully.');
  } catch (error) {
    Logger.error(LogCategory.SYSTEM_ERROR, 'Error migrating subscriptions', { error });
  } finally {
    await mongoose.disconnect();
    Logger.info(LogCategory.SYSTEM_INFO, 'Disconnected from MongoDB.');
  }
}

migrateSubscriptions();
