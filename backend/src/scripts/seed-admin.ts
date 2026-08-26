import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { Logger, LogCategory } from '../infrastructure/logger/logger';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerhub';

async function seedAdmin() {
  try {
    Logger.info(LogCategory.SYSTEM_INFO, 'Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    Logger.info(LogCategory.SYSTEM_INFO, 'Connected successfully.');

    const email = 'admin@careerhub.com';
    const password = 'AdminPassword123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const SuperAdminSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      password: { type: String, required: true },
      role: String,
      status: String,
    }, { timestamps: true });

    const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', SuperAdminSchema);

    // Check if exists
    const existing = await SuperAdmin.findOne({ email });
    if (existing) {
      Logger.info(LogCategory.SYSTEM_INFO, 'Super Admin already exists with this email.');
      process.exit(0);
    }

    await SuperAdmin.create({
      firstName: 'System',
      lastName: 'Admin',
      email,
      password: hashedPassword,
      role: 'super_admin',
      status: 'ACTIVE',
    });

    Logger.info(LogCategory.SYSTEM_INFO, '-----------------------------------');
    Logger.info(LogCategory.SYSTEM_INFO, 'Super Admin Created Successfully!');
    Logger.info(LogCategory.SYSTEM_INFO, `Email: ${email}`);
    Logger.info(LogCategory.SYSTEM_INFO, `Password: ${password}`);
    Logger.info(LogCategory.SYSTEM_INFO, '-----------------------------------');

    process.exit(0);
  } catch (error) {
    Logger.error(LogCategory.SYSTEM_ERROR, 'Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
