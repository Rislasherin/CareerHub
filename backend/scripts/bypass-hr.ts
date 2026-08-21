import mongoose from "mongoose";
import { StudentModel } from "../src/infrastructure/database/models/student/student.model";
import { JobApplicationModel } from "../src/infrastructure/database/models/jobApplication.model";
import { InterviewModel } from "../src/infrastructure/database/models/company/interview.model";
import { config } from "dotenv";
import path from "path";
config({ path: path.join(__dirname, "../.env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub");
  
  const student = await StudentModel.findOne({ email: "rifagiw134@duvips.com" });
  if (!student) {
    console.log("Student not found");
    process.exit(1);
  }

  const app = await JobApplicationModel.findOne({ studentId: student._id }).sort({ createdAt: -1 });
  if (!app) {
    console.log("No application found for this student");
    process.exit(1);
  }

  app.status = "SHORTLISTED";
  await app.save();

  const interview = new InterviewModel({
    companyId: app.companyId,
    jobId: app.jobId,
    applicationId: app._id,
    studentId: app.studentId,
    title: "AI Technical Round (Kokoro TTS Test)",
    type: "TECHNICAL",
    roundNumber: 1,
    scheduledAt: new Date(Date.now() - 5000),
    durationMinutes: 60,
    status: "SCHEDULED"
  });

  await interview.save();
  app.status = "INTERVIEWING";
  await app.save();

  console.log(`Interview ${interview._id} created for ${student.email}!`);
  process.exit(0);
}
run();
