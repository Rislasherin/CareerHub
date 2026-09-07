import { container } from "./src/infrastructure/di/container";
import { FeatureKey } from "./src/domain/enums/FeatureKey.enum";
import { StudentModel } from "./src/infrastructure/database/models/student/student.model";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub";
  await mongoose.connect(uri);

  const entitlementGuard = container.resolve('entitlementGuardService');
  const studentRepo = container.resolve('studentRepository');
  const subRepo = container.resolve('subscriptionRepository');
  const planRepo = container.resolve('planRepository');

  const students = await StudentModel.find({}).limit(1);
  if (students.length === 0) {
    console.log("No students found");
    return;
  }

  const student = students[0];
  console.log("Student ID:", student._id);
  console.log("Student CollegeID:", student.collegeId);

  const sub = await subRepo.findByCollegeId(student.collegeId);
  if (!sub) {
    console.log("No sub found for college");
    return;
  }
  
  console.log("Sub ID:", sub.id);
  console.log("Sub status:", sub.status);
  console.log("Sub planId:", sub.planId);

  const plan = await planRepo.findById(sub.planId);
  console.log("Plan found?", plan !== null);
  if (plan) {
    console.log("Plan ID:", plan.id);
    console.log("Plan features:", plan.features);
  } else {
    console.log("PLAN IS NULL!");
  }

  try {
    await entitlementGuard.assertFeatureEntitlement(student.collegeId, FeatureKey.MOCK_INTERVIEW);
    console.log("Assert success!");
  } catch (err) {
    console.error("Assert failed:", err.message);
  }

  await mongoose.disconnect();
}

run();
