"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkUploadStudentsUseCase = void 0;
const validation_error_1 = require("@application/errors/validation.error");
const account_entity_1 = require("@domain/entities/account.entity");
const account_status_enum_1 = require("@domain/enums/account.status.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
const auth_helpers_1 = require("@application/usecases/shared/auth.helpers");
const parseCsvRows = (csvContent) => {
    const lines = csvContent.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length < 2) {
        return [];
    }
    const headers = lines[0].split(",").map((item) => item.trim().toLowerCase());
    return lines.slice(1).map((line) => {
        const values = line.split(",").map((item) => item.trim());
        return headers.reduce((accumulator, header, index) => {
            accumulator[header] = values[index] ?? "";
            return accumulator;
        }, {});
    });
};
class BulkUploadStudentsUseCase {
    constructor(accountRepository, hashService, randomService, emailService) {
        this.accountRepository = accountRepository;
        this.hashService = hashService;
        this.randomService = randomService;
        this.emailService = emailService;
    }
    async execute(organizationId, dto) {
        const rows = parseCsvRows(dto.csvContent);
        if (!rows.length) {
            throw new validation_error_1.ValidationError("CSV must include at least one student row");
        }
        const createdStudents = [];
        for (const row of rows) {
            if (!row.email || !row.firstname || !row.lastname || !row.rollnumber) {
                throw new validation_error_1.ValidationError("CSV headers must include firstName,lastName,email,rollNumber");
            }
            const existingAccount = await this.accountRepository.findByEmail(row.email);
            if (existingAccount) {
                throw new validation_error_1.ConflictError(`Student email ${row.email}`);
            }
            const temporaryPassword = this.randomService.generatePassword(12);
            const inviteToken = this.randomService.generateToken(32);
            const student = await this.accountRepository.create(account_entity_1.AccountEntity.create({
                email: row.email.toLowerCase(),
                passwordHash: await this.hashService.hash(temporaryPassword),
                role: Roles_enum_1.Role.STUDENT,
                status: account_status_enum_1.AccountStatus.INVITED,
                firstName: row.firstname,
                lastName: row.lastname,
                phone: row.phone || undefined,
                organizationId,
                department: row.department || undefined,
                rollNumber: row.rollnumber,
                mustChangePassword: true,
                inviteTokenHash: (0, auth_helpers_1.hashValue)(inviteToken),
                inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }));
            await this.emailService.sendEmail({
                to: row.email.toLowerCase(),
                subject: "CareerHub student invite",
                text: `You have been invited to CareerHub. Temporary password: ${temporaryPassword}. ` +
                    `Set password link: /auth/set-password?token=${inviteToken}`,
            });
            createdStudents.push({
                id: student.getProps().id,
                email: student.getEmail(),
                rollNumber: student.getProps().rollNumber,
            });
        }
        return {
            total: createdStudents.length,
            students: createdStudents,
        };
    }
}
exports.BulkUploadStudentsUseCase = BulkUploadStudentsUseCase;
