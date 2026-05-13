"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const AuthError_1 = require("@application/errors/AuthError");
class AuthMiddleware {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.protect = (req, _res, next) => {
            let token;
            // 1. Check Cookies
            if (req.cookies && req.cookies.accessToken) {
                token = req.cookies.accessToken;
            }
            // 2. Check Authorization Header
            else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
                token = req.headers.authorization.split(" ")[1];
            }
            if (!token) {
                throw new AuthError_1.UnauthorizedError("Access token missing");
            }
            req.user = this.jwtService.verifyAccessToken(token);
            next();
        };
    }
}
exports.AuthMiddleware = AuthMiddleware;
