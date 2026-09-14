import mongoose from 'mongoose';
import 'dotenv/config';
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/career-hub');
const db = mongoose.connection;
db.once('open', async () => {
    const jobsCol = db.collection('jobs');
    const offersCol = db.collection('offers');
    const offers = await offersCol.find({ role: { $in: ['student', 'STUDENT'] } }).toArray();
    for(const offer of offers) {
        const job = await jobsCol.findOne({ _id: offer.jobId });
        if(job) {
            await offersCol.updateOne({ _id: offer._id }, { $set: { role: job.title } });
        }
    }
    console.log('Fixed', offers.length, 'offers');
    process.exit(0);
});
