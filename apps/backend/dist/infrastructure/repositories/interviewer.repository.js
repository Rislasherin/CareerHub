"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewerRepository = void 0;
const role_enum_1 = require("@domain/enums/role.enum");
const interviewer_model_1 = require("@infrastructure/database/models/interviewer.model");
const account_repository_1 = require("@infrastructure/repositories/account.repository");
class InterviewerRepository extends account_repository_1.MongooseAccountRepository {
    constructor() {
        super(role_enum_1.Role.INTERVIEWER, interviewer_model_1.InterviewerModel);
    }
}
exports.InterviewerRepository = InterviewerRepository;
