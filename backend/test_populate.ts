import 'dotenv/config';
import mongoose from 'mongoose';
import { OfferModel } from './src/infrastructure/database/models/company/offer.model';
import './src/infrastructure/database/models/student/student.model';
import './src/infrastructure/database/models/company/job.model';
import './src/infrastructure/database/models/company/company.model';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/career-hub');

async function run() {
    try {
        const studentId = '66d0c75ce459ed8ce03001ad'; // arbitrary ObjectId
        const offers = await OfferModel.find({ studentId, isDeleted: { $ne: true } })
          .populate({
            path: 'jobId',
            select: 'title companyId',
            populate: {
              path: 'companyId',
              select: 'companyName logo'
            }
          })
          .populate({
            path: 'companyId',
            select: 'companyName logo'
          })
          .populate({
            path: 'studentId',
            select: 'user firstName lastName',
            populate: {
              path: 'user',
              select: 'firstName lastName email'
            }
          })
          .sort({ createdAt: -1 })
          .exec();
          
        console.log("Success");
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
