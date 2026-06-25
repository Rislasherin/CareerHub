"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const jwt_constants_1 = require("@infrastructure/config/jwt.constants");
const AuthError_1 = require("@application/errors/AuthError");
class JwtService {
    constructor() {
        this._accessOptions = { expiresIn: jwt_constants_1.JWT_ACCESS_EXPIRES_IN };
        this._refreshOptions = { expiresIn: jwt_constants_1.JWT_REFRESH_EXPIRES_IN };
    }
    signAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, jwt_constants_1.JWT_ACCESS_SECRET, this._accessOptions);
    }
    signRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, jwt_constants_1.JWT_REFRESH_SECRET, this._refreshOptions);
    }
    verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, jwt_constants_1.JWT_ACCESS_SECRET);
        }
        catch (error) {
            return this.handleJwtError(error);
        }
    }
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, jwt_constants_1.JWT_REFRESH_SECRET);
        }
        catch (error) {
            return this.handleJwtError(error);
        }
    }
    generateResetToken(payload) {
        return jsonwebtoken_1.default.sign(payload, jwt_constants_1.JWT_ACCESS_SECRET, { expiresIn: "1h" });
    }
    verifyResetToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, jwt_constants_1.JWT_ACCESS_SECRET);
        }
        catch (error) {
            return this.handleJwtError(error);
        }
    }
    handleJwtError(error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            throw new AuthError_1.TokenExpiredCustomError();
        }
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            throw new AuthError_1.TokenInvalidError();
        }
        throw new AuthError_1.TokenInvalidError();
    }
}
exports.JwtService = JwtService;
