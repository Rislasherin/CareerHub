"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAuthResponse = exports.hashValue = void 0;
const crypto_1 = __importDefault(require("crypto"));
const hashValue = (value) => crypto_1.default.createHash("sha256").update(value).digest("hex");
exports.hashValue = hashValue;
const buildAuthResponse = (account, jwtService) => {
    const props = account.getProps();
    const payload = {
        id: props.id ?? "",
        role: props.role,
        orgId: props.organizationId,
    };
    return {
        accessToken: jwtService.signAccessToken(payload),
        refreshToken: jwtService.signRefreshToken(payload),
        user: {
            id: props.id,
            email: props.email,
            role: props.role,
            firstName: props.firstName,
            lastName: props.lastName,
            organizationId: props.organizationId,
            comptypeId: props.comptypeId,
            mustChangePassword: props.mustChangePassword,
        },
    };
};
exports.buildAuthResponse = buildAuthResponse;
