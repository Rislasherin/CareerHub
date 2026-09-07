const mongoose = require('mongoose');
const { StudentModel } = require('./src/infrastructure/database/models/student/student.model');
const { SubscriptionModel } = require('./src/infrastructure/database/models/organizer/subscription.model');
require('dotenv').config();

async function trace() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub";
  await mongoose.connect(uri);

  const students = await StudentModel.find({}).limit(5);
  for (const student of students) {
    console.log(`Student: ${student.email}, collegeId: ${student.collegeId}`);
    const sub = await SubscriptionModel.findOne({ collegeId: student.collegeId, status: 'ACTIVE' }).sort({ createdAt: -1 });
    if (sub) {
        console.log(`  Active Sub: ${sub.planId}, type: ${sub.planType}`);
    } else {
        console.log(`  No Active Sub found.`);
    }
  }

  await mongoose.disconnect();
}
trace();
