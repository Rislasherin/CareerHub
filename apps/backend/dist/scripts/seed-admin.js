"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load env vars
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerhub';
async function seedAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected successfully.');
        const email = 'admin@careerhub.com';
        const password = 'AdminPassword123';
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const SuperAdminSchema = new mongoose_1.default.Schema({
            firstName: String,
            lastName: String,
            email: String,
            password: { type: String, required: true },
            role: String,
            status: String,
        }, { timestamps: true });
        const SuperAdmin = mongoose_1.default.models.SuperAdmin || mongoose_1.default.model('SuperAdmin', SuperAdminSchema);
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
    }
    catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}
seedAdmin();
