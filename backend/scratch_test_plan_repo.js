const mongoose = require('mongoose');
const { PlanRepository } = require('./src/infrastructure/repositories/plan.repository');
const { PlanModel } = require('./src/infrastructure/database/models/organizer/plan.model');
require('dotenv').config();

async function testQuery() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub";
  await mongoose.connect(uri);
  
  const repo = new PlanRepository(PlanModel);
  const plan = await repo.findById('plan_pro');
  
  console.log("PlanRepository.findById('plan_pro') returned:", plan !== null);
  if (plan) {
      console.log("Plan ID:", plan.id);
  }

  await mongoose.disconnect();
}
testQuery();
