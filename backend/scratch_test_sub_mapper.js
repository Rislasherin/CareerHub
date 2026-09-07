const mongoose = require('mongoose');
const { SubscriptionRepository } = require('./src/infrastructure/repositories/subscription.repository');
const { SubscriptionModel } = require('./src/infrastructure/database/models/organizer/subscription.model');
require('dotenv').config();

async function testSub() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub";
  await mongoose.connect(uri);
  
  const repo = new SubscriptionRepository();
  const sub = await repo.findByCollegeId('6a434f3e86e5f411ad64acef');
  
  console.log("Sub planId:", sub.planId);
  console.log("Sub status:", sub.status);

  await mongoose.disconnect();
}
testSub();
