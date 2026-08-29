import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const existing = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (existing) return existing;

    const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "StockPilot User";

    return await db.user.create({
      data: {
        clerkUserId: user.id,
        name: displayName,
        imageUrl: user.imageUrl,
        email: user.emailAddresses?.[0]?.emailAddress || `${user.id}@stockpilot.local`,
      },
    });
  } catch (error) {
    console.error("checkUser:", error);
    throw error;
  }
};
