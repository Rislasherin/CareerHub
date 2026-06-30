import mongoose from "mongoose";
import { JobRepository } from "./src/infrastructure/repositories/JobRepository";
import { StudentRepository } from "./src/infrastructure/repositories/student.repository";
import { GetHRCandidatesUseCase } from "./src/application/usecases/hr/job-engine/implementations/GetHRCandidates.usecase";
import { JobModel } from "./src/infrastructure/database/models/company/job.model";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://shihabmhd07:careerhub123@career-hub.g5m6x.mongodb.net/careerhub";
  await mongoose.connect(uri);
  console.log("Connected");
  
  const jobRepo = new JobRepository();
  const studentRepo = new StudentRepository();
  const useCase = new GetHRCandidatesUseCase(jobRepo, studentRepo);
  
  const jobs = await JobModel.find({});
  console.log("Total jobs:", jobs.length);
  
  const companyId = jobs.length > 0 ? jobs[0].companyId : "";
  if (!companyId) return console.log("No jobs found");
  
  console.log("Testing with companyId:", companyId);
  try {
    const res = await useCase.execute(String(companyId));
    console.log("Success:", res.length);
  } catch(e) {
    console.error("Error:", e);
  }
  
  process.exit(0);
}

run();
