"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpRepository = void 0;
const otp_model_1 = require("@infrastructure/database/models/auth/otp.model");
class OtpRepository {
    async create(email, otp) {
        // Delete any existing OTPs for this email first
        await this.deleteByEmail(email);
        const newOtp = new otp_model_1.OtpModel({ email, otp });
        return await newOtp.save();
    }
    async findByEmailAndOtp(email, otp) {
        return await otp_model_1.OtpModel.findOne({ email, otp }).exec();
    }
    async deleteByEmail(email) {
        await otp_model_1.OtpModel.deleteMany({ email }).exec();
    }
}
exports.OtpRepository = OtpRepository;
