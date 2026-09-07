import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { studentSchema } from '../infrastructure/database/schema/student/student.schema';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const StudentModel = mongoose.model('Student', studentSchema);
    const allStudents = await StudentModel.find({}, 'collegeId status isDeleted firstName lastName');
    console.log("Total students in DB:", allStudents.length);
    console.log("Statuses:", [...new Set(allStudents.map(s => s.status))]);
    console.log("College IDs:", [...new Set(allStudents.map(s => s.collegeId))]);
    console.log("First 5 students:", allStudents.slice(0, 5));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
run();
