"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const AuthError_1 = require("@application/errors/AuthError");
class AuthMiddleware {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.protect = (req, _res, next) => {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new AuthError_1.UnauthorizedError("Access token missing");
            }
            const token = authHeader.split(" ")[1];
            req.user = this.jwtService.verifyAccessToken(token);
            next();
        };
    }
}
exports.AuthMiddleware = AuthMiddleware;
