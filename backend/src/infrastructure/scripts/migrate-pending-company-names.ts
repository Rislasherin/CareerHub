import mongoose from "mongoose";
import { CompanyModel } from "../database/models/company/company.model";
import { OrganizationModel } from "../database/models/organizer/organization.model";

/**
 * Migration & Inspection Utility for Legacy Records
 *
 * 1. Counts and inspects companies having "Pending Company" in their name.
 * 2. Counts and inspects institutions having "Pending Institution" in their name.
 * 3. Does NOT overwrite valid registered names or make destructive changes.
 * 4. Logs a detailed breakdown of records requiring actual registered names.
 */
export async function inspectAndReportLegacyRecords() {
  const pendingCompanies = await CompanyModel.find({
    name: { $regex: /^Pending Company/i },
    isDeleted: false
  }).lean();

  const pendingColleges = await OrganizationModel.find({
    name: { $regex: /^Pending Institution/i },
    isDeleted: false
  }).lean();

  console.log("=================================================");
  console.log("   LEGACY PLACEHOLDER RECORD INSPECTION REPORT   ");
  console.log("=================================================");
  console.log(`[INFO] Companies with placeholder name: ${pendingCompanies.length}`);
  for (const comp of pendingCompanies) {
    console.log(`  - ID: ${comp._id}, Name: "${comp.name}", Status: ${comp.status}, Step: ${comp.onboardingStep}`);
  }

  console.log(`\n[INFO] Institutions with placeholder name: ${pendingColleges.length}`);
  for (const org of pendingColleges) {
    console.log(`  - ID: ${org._id}, Name: "${org.name}", Status: ${org.status}, Step: ${org.onboardingStep}`);
  }

  console.log("\n[RECOMMENDATION]:");
  console.log("  Affected companies and colleges will be prompted during onboarding Stage 1");
  console.log("  to enter their actual legal/registered name before final submission.");
  console.log("  No destructive overwrite has been performed on legitimate registered names.");
  console.log("=================================================");

  return {
    pendingCompanyCount: pendingCompanies.length,
    pendingCollegeCount: pendingColleges.length,
    pendingCompanies: pendingCompanies.map((c: any) => ({ id: String(c._id), name: c.name, status: c.status })),
    pendingColleges: pendingColleges.map((o: any) => ({ id: String(o._id), name: o.name, status: o.status }))
  };
}

// Allow direct CLI execution if executed directly
if (require.main === module) {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/careerhub";
  mongoose.connect(mongoUri).then(async () => {
    await inspectAndReportLegacyRecords();
    await mongoose.disconnect();
  }).catch(err => {
    console.error("Migration inspection error:", err);
    process.exit(1);
  });
}
