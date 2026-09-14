import mongoose from 'mongoose';
import 'dotenv/config';
import { OfferModel } from '../infrastructure/database/models/company/offer.model';
import { JobModel } from '../infrastructure/database/models/company/job.model';

async function runMigration() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/career-hub');
        console.log('Connected.');

        console.log('Finding offers with role "student"...');
        const legacyOffers = await OfferModel.find({ 
            role: { $in: ['student', 'STUDENT'] } 
        });

        console.log(`Found ${legacyOffers.length} offers to migrate.`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const offer of legacyOffers) {
            const job = await JobModel.findById(offer.jobId);
            
            if (job && job.title && job.title.toLowerCase() !== 'student') {
                console.log(`Migrating offer ${offer._id} from "student" to "${job.title}"`);
                
                // Directly update the document bypassing validators in case of other issues, 
                // but keeping it simple using updateOne to preserve all existing fields like signatures.
                await OfferModel.updateOne(
                    { _id: offer._id },
                    { $set: { role: job.title } }
                );
                
                migratedCount++;
            } else {
                console.log(`Skipped offer ${offer._id}: Could not resolve a valid job title (Job ID: ${offer.jobId})`);
                skippedCount++;
            }
        }

        console.log(`\nMigration completed!`);
        console.log(`Successfully migrated: ${migratedCount}`);
        console.log(`Skipped: ${skippedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
