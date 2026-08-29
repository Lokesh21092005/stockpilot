import { inngest } from "./client";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/template";
import { sendEmail } from "@/actions/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { subMonths, startOfMonth } from "date-fns";
import { generateMonthlyInventoryReport } from "@/lib/monthly-report";

export const checkLowStock = inngest.createFunction(
  { id: "check-low-stock", name: "Check Low Stock" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const policies = await step.run("fetch-reorder-policies", async () =>
      db.reorderPolicy.findMany({
        include: { product: true, user: true },
      })
    );

    let alerted = 0;

    for (const policy of policies) {
      const isLow = policy.product.stockQuantity <= policy.minimumStock;
      const alreadyAlertedToday =
        policy.lastAlertSent &&
        new Date(policy.lastAlertSent).toDateString() === new Date().toDateString();

      if (!isLow || alreadyAlertedToday) continue;

      await step.run(`alert-${policy.id}`, async () => {
        await sendEmail({
          to: policy.user.email,
          subject: `Low stock: ${policy.product.name}`,
          react: EmailTemplate({
            type: "low-stock",
            userName: policy.user.name,
            data: {
              productName: policy.product.name,
              sku: policy.product.sku,
              stockQuantity: policy.product.stockQuantity,
              minimumStock: policy.minimumStock,
              reorderAmount: policy.reorderAmount,
            },
          }),
        });

        await db.reorderPolicy.update({
          where: { id: policy.id },
          data: { lastAlertSent: new Date() },
        });
      });

      alerted++;
    }

    return { alerted };
  }
);

async function generateInventoryInsights(stats) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this inventory snapshot and give 3 concise operational insights.
    Focus on low-stock risk, movement patterns, and practical next actions.
    Inventory value: ${stats.inventoryValue}
    Low-stock SKUs: ${stats.lowStockCount}
    Receipts in 30 days: ${stats.receipts}
    Issues in 30 days: ${stats.issues}
    Return JSON array only: ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const cleaned = result.response.text().replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return [
      "Review low-stock SKUs before the next replenishment cycle.",
      "Compare incoming versus issued quantities to identify demand changes.",
      "Prioritize high-value items when setting reorder amounts.",
    ];
  }
}

export const generateWeeklyDigest = inngest.createFunction(
  { id: "generate-weekly-digest", name: "Generate Weekly Digest" },
  { cron: "0 8 * * 1" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () =>
      db.user.findMany({ include: { products: true } })
    );

    for (const user of users) {
      await step.run(`digest-${user.id}`, async () => {
        const inventoryValue = user.products.reduce(
          (sum, p) => sum + p.stockQuantity * Number(p.unitCost),
          0
        );
        const lowStockCount = user.products.filter((p) => p.stockQuantity <= 0).length;

        const since = new Date(Date.now() - 30 * 86400000);
        const movements = await db.stockMovement.findMany({
          where: { userId: user.id, movementDate: { gte: since } },
        });

        const stats = {
          inventoryValue,
          lowStockCount,
          receipts: movements.filter((m) => m.type === "RECEIVE").length,
          issues: movements.filter((m) => m.type === "ISSUE").length,
        };

        const insights = await generateInventoryInsights(stats);

        await sendEmail({
          to: user.email,
          subject: "Your StockPilot weekly digest",
          react: EmailTemplate({
            userName: user.name,
            type: "weekly-digest",
            data: { ...stats, insights },
          }),
        });
      });
    }

    return { processed: users.length };
  }
);

export const generateMonthlyReport = inngest.createFunction(
  {
    id: "generate-monthly-report",
    name: "Generate Monthly Inventory Report",
  },
  {
    cron: "0 8 1 * *",
  },
  async ({ step }) => {
    const users = await step.run(
      "fetch-report-users",
      async () =>
        db.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
          },
        })
    );

    const previousMonth = startOfMonth(
      subMonths(new Date(), 1)
    );

    for (const user of users) {
      await step.run(
        `monthly-report-${user.id}`,
        async () => {
          const report =
            await generateMonthlyInventoryReport({
              userId: user.id,
              monthDate: previousMonth,
            });

          await sendEmail({
            to: user.email,
            subject: `Your StockPilot monthly inventory report`,
            react: EmailTemplate({
              type: "monthly-report",
              userName: user.name,
              data: report,
            }),
          });
        }
      );
    }

    return {
      processed: users.length,
    };
  }
);