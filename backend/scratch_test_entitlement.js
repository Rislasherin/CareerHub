const mongoose = require('mongoose');
const { EntitlementGuardService } = require('./src/infrastructure/services/entitlements/EntitlementGuardService');
const { SubscriptionRepository } = require('./src/infrastructure/repositories/subscription.repository');
const { PlanRepository } = require('./src/infrastructure/repositories/plan.repository');
const { StudentRepository } = require('./src/infrastructure/repositories/student.repository');
const { SubscriptionModel } = require('./src/infrastructure/database/models/organizer/subscription.model');
const { PlanModel } = require('./src/infrastructure/database/models/organizer/plan.model');
const { StudentModel } = require('./src/infrastructure/database/models/student/student.model');
const { FeatureKey } = require('./src/domain/enums/FeatureKey.enum');

require('dotenv').config();

async function testEntitlement() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  // Create repo instances
  const subRepo = new SubscriptionRepository();
  const planRepo = new PlanRepository(PlanModel);
  const studentRepo = new StudentRepository();

  const guard = new EntitlementGuardService(subRepo, planRepo, studentRepo);

  // The collegeId for the recently upgraded Pro college
  const collegeId = '6a434f3e86e5f411ad64acef';

  try {
    await guard.assertFeatureEntitlement(collegeId, FeatureKey.MOCK_INTERVIEW);
    console.log("SUCCESS! Entitlement check passed for MOCK_INTERVIEW on college:", collegeId);
  } catch (err) {
    console.error("FAIL! Entitlement check failed:", err.message);
  }

  await mongoose.disconnect();
}

testEntitlement();
