"use strict";
// src/jobs/checkLateBorrows.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLateCheckJob = exports.checkLateBorrows = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const Borrow_1 = require("../models/schema/Borrow");
const checkLateBorrows = async () => {
    const now = new Date();
    const result = await Borrow_1.Borrow.updateMany({
        status: "on_borrow",
        mustReturnDate: { $lt: now },
    }, {
        $set: { status: "late" },
    });
    console.log(`[CRON] ${new Date().toISOString()} - Updated ${result.modifiedCount} borrows to late`);
};
exports.checkLateBorrows = checkLateBorrows;
const startLateCheckJob = () => {
    node_cron_1.default.schedule("0 0 * * *", async () => {
        console.log("[CRON] Running late borrows check...");
        await (0, exports.checkLateBorrows)();
    });
    console.log("[CRON] Late check job scheduled for midnight daily");
};
exports.startLateCheckJob = startLateCheckJob;
