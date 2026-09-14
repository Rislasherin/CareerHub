import mongoose from 'mongoose';
import 'dotenv/config';
import { OfferModel } from '../infrastructure/database/models/company/offer.model';
import { JobModel } from '../infrastructure/database/models/company/job.model';

async function runMigration() {
    const isDryRun = !process.argv.includes('--execute');
    
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/career-hub');
        console.log('Connected.');

        console.log('Finding offers with role "student"...');
        const legacyOffers = await OfferModel.find({ 
            role: { $in: ['student', 'STUDENT'] } 
        });

        if (isDryRun) {
            console.log('\n==================================================');
            console.log('DRY RUN MODE ENABLED - NO CHANGES WILL BE MADE');
            console.log('Run with --execute to apply changes.');
            console.log('==================================================\n');
        }

        console.log(`Found ${legacyOffers.length} offers to migrate.`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const offer of legacyOffers) {
            const job = await JobModel.findById(offer.jobId);
            
            if (job && job.title && job.title.toLowerCase() !== 'student') {
                const action = isDryRun ? 'Would update' : 'Updating';
                console.log(`\nOffer ID: ${offer._id}`);
                console.log(`Current role: ${offer.role}`);
                console.log(`Resolved Job ID: ${job._id}`);
                console.log(`Resolved Job title: ${job.title}`);
                console.log(`Would update? YES`);
                
                if (!isDryRun) {
                    await OfferModel.updateOne(
                        { _id: offer._id },
                        { $set: { role: job.title } }
                    );
                }
                
                migratedCount++;
            } else {
                console.log(`\nOffer ID: ${offer._id}`);
                console.log(`Current role: ${offer.role}`);
                console.log(`Resolved Job ID: ${offer.jobId}`);
                console.log(`Resolved Job title: ${job?.title || 'NOT FOUND'}`);
                console.log(`Would update? NO (Cannot reliably resolve title)`);
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
