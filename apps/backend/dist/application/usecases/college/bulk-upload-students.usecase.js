"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkUploadStudentsUseCase = void 0;
const csv_util_1 = require("@shared/utils/csv.util");
class BulkUploadStudentsUseCase {
    constructor(createStudentUseCase) {
        this.createStudentUseCase = createStudentUseCase;
    }
    async execute(organizationId, dto) {
        const rows = (0, csv_util_1.parseCsvContent)(dto.csvContent);
        const failedRows = [];
        let insertedCount = 0;
        for (let index = 0; index < rows.length; index += 1) {
            const row = rows[index];
            try {
                const studentDto = {
                    fullName: row.fullName,
                    email: row.email,
                    rollNumber: row.rollNumber,
                    branch: row.branch,
                    cgpa: Number(row.cgpa),
                };
                await this.createStudentUseCase.execute(organizationId, studentDto);
                insertedCount += 1;
            }
            catch (error) {
                failedRows.push({
                    rowNumber: index + 2,
                    reason: error instanceof Error ? error.message : "Unknown upload error.",
                });
            }
        }
        return {
            insertedCount,
            failedCount: failedRows.length,
            failedRows,
        };
    }
}
exports.BulkUploadStudentsUseCase = BulkUploadStudentsUseCase;
