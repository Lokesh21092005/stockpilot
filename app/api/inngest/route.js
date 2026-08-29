import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  checkLowStock,
  generateWeeklyDigest,
  generateMonthlyReport,
} from "@/lib/inngest/function";
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
  checkLowStock,
  generateWeeklyDigest,
  generateMonthlyReport,],
});
