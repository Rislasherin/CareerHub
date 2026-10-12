import mongoose from "mongoose";
import { JobModel } from "../src/infrastructure/database/models/company/job.model";
import { config } from "dotenv";
import path from "path";

config({ path: path.join(__dirname, "../.env") });

async function main() {
  const isApply = process.argv.includes("--apply");
  console.log(`=== Duplicate Job Detection & Cleanup Script ===`);
  console.log(`Mode: ${isApply ? "APPLY (will soft-delete duplicate records)" : "DRY-RUN (read-only audit)"}\n`);

  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub");

  const jobs = await JobModel.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();
  console.log(`Total non-deleted jobs in DB: ${jobs.length}\n`);

  // Group jobs by companyId + title + category + collegeId
  const clusters = new Map<string, any[]>();
  for (const job of jobs) {
    const key = `${job.companyId}_${job.title?.toLowerCase().trim()}_${job.collegeId}_${job.category?.toLowerCase().trim()}`;
    if (!clusters.has(key)) {
      clusters.set(key, []);
    }
    clusters.get(key)!.push(job);
  }

  let totalDuplicateClusters = 0;
  let totalDuplicatesFound = 0;
  const toSoftDelete: string[] = [];

  for (const [key, group] of clusters.entries()) {
    if (group.length <= 1) continue;

    // Filter to jobs created within 10 minutes of each other
    const duplicateSets: any[][] = [];
    let currentSet: any[] = [group[0]];

    for (let i = 1; i < group.length; i++) {
      const prev = currentSet[currentSet.length - 1];
      const curr = group[i];
      const timeDiffMs = Math.abs(new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime());

      // If created within 10 minutes (600,000 ms), consider part of the duplicate burst
      if (timeDiffMs <= 600000) {
        currentSet.push(curr);
      } else {
        if (currentSet.length > 1) duplicateSets.push(currentSet);
        currentSet = [curr];
      }
    }
    if (currentSet.length > 1) duplicateSets.push(currentSet);

    for (const dupSet of duplicateSets) {
      totalDuplicateClusters++;
      console.log(`--- Duplicate Cluster #${totalDuplicateClusters} ---`);
      console.log(`Title: "${dupSet[0].title}" | College: ${dupSet[0].collegeId} | Category: ${dupSet[0].category}`);
      console.log(`Total copies in burst: ${dupSet.length}`);

      // Selection rule for canonical job:
      // 1. Job with the most approvals (approvedColleges.length)
      // 2. Job with status !== 'pending_review'
      // 3. Earliest created job
      dupSet.sort((a, b) => {
        const aApprovals = (a.approvedColleges || []).length;
        const bApprovals = (b.approvedColleges || []).length;
        if (bApprovals !== aApprovals) return bApprovals - aApprovals;
        if (a.status !== "pending_review" && b.status === "pending_review") return -1;
        if (b.status !== "pending_review" && a.status === "pending_review") return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      const canonical = dupSet[0];
      const redundant = dupSet.slice(1);

      console.log(`-> Canonical (KEEP): _id: ${canonical._id} | created: ${new Date(canonical.createdAt).toISOString()} | status: ${canonical.status} | approvals: ${(canonical.approvedColleges || []).length}`);
      for (const r of redundant) {
        console.log(`   Duplicate (ARCHIVE): _id: ${r._id} | created: ${new Date(r.createdAt).toISOString()} | status: ${r.status} | approvals: ${(r.approvedColleges || []).length}`);
        toSoftDelete.push(r._id.toString());
        totalDuplicatesFound++;
      }
      console.log();
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Duplicate clusters found: ${totalDuplicateClusters}`);
  console.log(`Redundant records identified: ${totalDuplicatesFound}`);

  if (isApply && toSoftDelete.length > 0) {
    console.log(`Soft-deleting ${toSoftDelete.length} redundant job records (isDeleted = true)...`);
    const updateResult = await JobModel.updateMany(
      { _id: { $in: toSoftDelete } },
      { $set: { isDeleted: true } }
    );
    console.log(`Successfully updated ${updateResult.modifiedCount} records to isDeleted = true.`);
  } else if (!isApply && toSoftDelete.length > 0) {
    console.log(`Dry run complete. No records were modified. Run with --apply to soft-delete these duplicates.`);
  } else {
    console.log(`No duplicates to clean up.`);
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});
