"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_validator_1 = require("@infrastructure/config/env.validator");
const connectDB = async () => {
    await mongoose_1.default.connect(env_validator_1.env.MONGODB_URI);
    try {
        const db = mongoose_1.default.connection.db;
        if (db) {
            const collections = await db.listCollections({ name: "students" }).toArray();
            if (collections.length > 0) {
                const studentCollection = db.collection("students");
                const indexes = await studentCollection.indexes();
                const hasOldIndex = indexes.some(idx => idx.name === "rollNumber_1_orgId_1");
                if (hasOldIndex) {
                    await studentCollection.dropIndex("rollNumber_1_orgId_1");
                    console.log("Successfully dropped legacy index rollNumber_1_orgId_1 from students collection");
                }
            }
        }
    }
    catch (error) {
        console.error("Error checking/dropping legacy students index:", error);
    }
};
exports.connectDB = connectDB;
