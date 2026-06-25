import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerhub';

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

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
      console.log('Super Admin already exists with this email.');
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

    console.log('-----------------------------------');
    console.log('Super Admin Created Successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
