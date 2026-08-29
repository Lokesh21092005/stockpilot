"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import {
  generateMonthlyInventoryReport,
} from "@/lib/monthly-report";
import {
  startOfMonth,
  subMonths,
} from "date-fns";
import { revalidatePath } from "next/cache";

async function getCurrentUser() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function getMonthlyReports() {
  const user = await getCurrentUser();

  return db.inventoryReport.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      reportMonth: "desc",
    },
  });
}

export async function generateMonthlyReport(formData) {
  const user = await getCurrentUser();

  const month = formData.get("month");

  if (!month) {
    throw new Error("Please select a month.");
  }

  const parsedMonth = new Date(`${month}-01T00:00:00`);

  if (Number.isNaN(parsedMonth.getTime())) {
    throw new Error("Invalid month.");
  }

  await generateMonthlyInventoryReport({
    userId: user.id,
    monthDate: startOfMonth(parsedMonth),
  });

  revalidatePath("/reports");

  return { success: true };
}

export async function generatePreviousMonthReport() {
  const user = await getCurrentUser();

  await generateMonthlyInventoryReport({
    userId: user.id,
    monthDate: startOfMonth(subMonths(new Date(), 1)),
  });

  revalidatePath("/reports");

  return { success: true };
}