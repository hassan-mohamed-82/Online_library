// src/jobs/checkLateBorrows.ts

import cron from "node-cron";
import { Borrow } from "../models/schema/Borrow";

export const checkLateBorrows = async () => {
  const now = new Date();

  const result = await Borrow.updateMany(
    {
      status: "on_borrow",
      mustReturnDate: { $lt: now },
    },
    {
      $set: { status: "late" },
    }
  );

  console.log(`[CRON] ${new Date().toISOString()} - Updated ${result.modifiedCount} borrows to late`);
};

export const startLateCheckJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running late borrows check...");
    await checkLateBorrows();
  });

  console.log("[CRON] Late check job scheduled for midnight daily");
};
