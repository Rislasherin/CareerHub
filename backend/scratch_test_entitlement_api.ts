import mongoose from "mongoose";
import dotenv from "dotenv";
import { makeGetStudentEntitlementsUseCase } from "./src/infrastructure/di/student.factory";
import { StudentModel } from "./src/infrastructure/database/models/student/student.model";

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub";
  await mongoose.connect(uri);

  const getEntitlements = makeGetStudentEntitlementsUseCase();
  
  const students = await StudentModel.find({}).limit(1);
  if (students.length > 0) {
    const student = students[0];
    console.log("Testing for student:", student._id);
    const result = await getEntitlements.execute(student._id.toString());
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("No students found.");
  }

  await mongoose.disconnect();
}

run();
