import mongoose from "mongoose";
import { CompanyModel } from "../src/infrastructure/database/models/company/company.model"
import { config } from "dotenv";
import path from "path";
config({ path: path.join(__dirname, "../.env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub");
  
  const hr = await CompanyModel.findOne().sort({ createdAt: -1 });
  console.log("Latest HR:", hr?.email, "CompanyId:", hr?.companyId.toString());
  
  process.exit(0);
}
run();
