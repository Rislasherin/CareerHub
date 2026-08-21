import mongoose from "mongoose";
import { StudentModel } from "../src/infrastructure/database/models/student/student.model";
import { config } from "dotenv";
import path from "path";
config({ path: path.join(__dirname, "../.env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub");
  const student = await StudentModel.findById("6a43861aef495db21e3ec8e8");
  console.log(student ? `Student email: ${student.email}` : "Student not found");
  process.exit(0);
}
run();
