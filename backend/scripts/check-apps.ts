import mongoose from "mongoose";
import { StudentModel } from "../src/infrastructure/database/models/student/student.model";
import { JobApplicationModel } from "../src/infrastructure/database/models/jobApplication.model";
import { config } from "dotenv";
import path from "path";
config({ path: path.join(__dirname, "../.env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub");
  
  const student = await StudentModel.findOne({ email: "rifagiw134@duvips.com" });
  if (student) {
    const apps = await JobApplicationModel.find({ studentId: student._id });
    console.log(`Found ${apps.length} applications for ${student.email}`);
  }
  
  process.exit(0);
}
run();
