import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../../src/infrastructure/database/mongoose/connect";
import { SuperAdminModel } from "../../src/infrastructure/database/models/superadmin/super-admin.model";
import { UpdateSuperAdminProfileUseCase } from "../../src/application/usecases/super-admin/implementations/UpdateSuperAdminProfileUseCase";
import { SuperAdminRepository } from "../../src/infrastructure/repositories/SuperAdminRepository";

async function run() {
  try {
    await connectDB();
    console.log("Connected to MongoDB successfully");

    const firstAdmin = await SuperAdminModel.findOne({});
    if (!firstAdmin) {
      console.log("No Super Admin found in the database!");
      process.exit(0);
    }
    console.log("Found Super Admin:", firstAdmin._id, firstAdmin.firstName, firstAdmin.lastName, firstAdmin.email);

    const repo = new SuperAdminRepository();
    const usecase = new UpdateSuperAdminProfileUseCase(repo);

    console.log("Attempting live profile update...");
    const updated = await usecase.execute(firstAdmin._id.toString(), {
      firstName: firstAdmin.firstName,
      lastName: firstAdmin.lastName
    });
    console.log("Successfully updated Super Admin profile:", updated);
  } catch (error: any) {
    console.error("Profile update failed with error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
