import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { JobModel } from '../infrastructure/database/models/company/job.model';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const jobs = await JobModel.find({}, 'collegeId status requiredSkills');
    console.log("Total jobs:", jobs.length);
    console.log("Jobs:", jobs);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
run();
