const mongoose = require('mongoose');
require('dotenv').config();

async function checkBasicPlan() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub";
  await mongoose.connect(uri);

  const basicPlan = await mongoose.connection.db.collection('plans').findOne({ id: 'plan_basic' });
  console.log("Basic Plan found:", basicPlan !== null);
  if (basicPlan) {
      console.log(basicPlan);
  } else {
      const allPlans = await mongoose.connection.db.collection('plans').find({}).toArray();
      console.log("All plans:", allPlans);
  }

  await mongoose.disconnect();
}
checkBasicPlan();
