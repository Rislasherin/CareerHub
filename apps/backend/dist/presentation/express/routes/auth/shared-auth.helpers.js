"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRole = void 0;
const assignRole = (role) => (request, _response, next) => {
    request.body = {
        ...request.body,
        role,
    };
    next();
};
exports.assignRole = assignRole;
