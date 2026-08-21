import mongoose from "mongoose";
import { JobModel } from "../src/infrastructure/database/models/company/job.model";
import { config } from "dotenv";
import path from "path";
config({ path: path.join(__dirname, "../.env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub");
  
  const job = await JobModel.findOne().sort({ createdAt: -1 });
  if (job) {
    console.log("Latest Job ID:", job._id.toString());
    console.log("Company ID:", job.companyId.toString());
  } else {
    console.log("No jobs found");
  }
  process.exit(0);
}
run();
