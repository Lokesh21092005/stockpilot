import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";
import { startOfMonth, addMonths, format } from "date-fns";

function parseJson(text) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("AI response was not valid JSON.");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function generateMonthlyInventoryReport({
  userId,
  monthDate,
}) {
  const reportMonth = startOfMonth(monthDate);
  const nextMonth = addMonths(reportMonth, 1);

  const [products, movements] = await Promise.all([
    db.product.findMany({
      where: { userId },
      include: {
        reorderPolicy: true,
      },
    }),

    db.stockMovement.findMany({
      where: {
        userId,
        movementDate: {
          gte: reportMonth,
          lt: nextMonth,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
          },
        },
      },
      orderBy: {
        movementDate: "asc",
      },
    }),
  ]);

  // -----------------------------
  // 1. Calculate exact metrics
  // -----------------------------

  const receivedMovements = movements.filter(
    (movement) => movement.type === "RECEIVE"
  );

  const issuedMovements = movements.filter(
    (movement) => movement.type === "ISSUE"
  );

  const totalReceived = receivedMovements.reduce(
    (sum, movement) => sum + movement.quantity,
    0
  );

  const totalIssued = issuedMovements.reduce(
    (sum, movement) => sum + movement.quantity,
    0
  );

  const endingInventoryValue = products.reduce(
    (sum, product) =>
      sum + product.stockQuantity * Number(product.unitCost),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      product.reorderPolicy &&
      product.stockQuantity <= product.reorderPolicy.minimumStock
  );

  // -----------------------------
  // 2. Find most-used products
  // -----------------------------

  const productUsage = {};

  for (const movement of issuedMovements) {
    const key = movement.productId;

    if (!productUsage[key]) {
      productUsage[key] = {
        productId: key,
        name: movement.product.name,
        sku: movement.product.sku,
        category: movement.product.category,
        issuedQuantity: 0,
      };
    }

    productUsage[key].issuedQuantity += movement.quantity;
  }

  const topMovingProducts = Object.values(productUsage)
    .sort((a, b) => b.issuedQuantity - a.issuedQuantity)
    .slice(0, 5);

  // -----------------------------
  // 3. Products with little movement
  // -----------------------------

  const activeProductIds = new Set(
    movements.map((movement) => movement.productId)
  );

  const slowMovingProducts = products
    .filter((product) => !activeProductIds.has(product.id))
    .slice(0, 5)
    .map((product) => ({
      name: product.name,
      sku: product.sku,
      category: product.category,
      stockQuantity: product.stockQuantity,
    }));

  const metrics = {
    month: format(reportMonth, "MMMM yyyy"),
    totalReceived,
    totalIssued,
    receiptCount: receivedMovements.length,
    issueCount: issuedMovements.length,
    endingInventoryValue,
    lowStockCount: lowStockProducts.length,

    lowStockProducts: lowStockProducts.slice(0, 8).map((product) => ({
      name: product.name,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
      minimumStock: product.reorderPolicy.minimumStock,
      reorderAmount: product.reorderPolicy.reorderAmount,
    })),

    topMovingProducts,
    slowMovingProducts,
  };

  // -----------------------------
  // 4. Ask Gemini for analysis
  // -----------------------------

  const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
  );

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-lite-latest",
  });

  const prompt = `
You are an inventory operations analyst.

Analyze the following monthly inventory metrics.

IMPORTANT:
- Do not invent numbers.
- Use only the supplied data.
- Do not calculate new factual numbers unless they can be derived directly.
- Focus on operational insights.
- Keep the language concise and professional.

Return JSON only in this format:

{
  "summary": "2-4 sentence executive summary",
  "highlights": [
    "important observation",
    "important observation",
    "important observation"
  ],
  "risks": [
    "inventory risk",
    "inventory risk"
  ],
  "recommendations": [
    "specific recommendation",
    "specific recommendation",
    "specific recommendation"
  ]
}

MONTHLY DATA:

${JSON.stringify(metrics, null, 2)}
`;

  let aiData;

  try {
    const result = await model.generateContent(prompt);
    aiData = parseJson(result.response.text());
  } catch (error) {
    console.error("Monthly AI report generation failed:", error);

    aiData = {
      summary:
        "The monthly report was generated from inventory activity, but AI analysis was temporarily unavailable.",
      highlights: [
        `Received ${totalReceived} units during the month.`,
        `Issued ${totalIssued} units during the month.`,
        `${lowStockProducts.length} products are currently at or below their reorder threshold.`,
      ],
      risks: [
        "Review low-stock products before the next replenishment cycle.",
      ],
      recommendations: [
        "Prioritize replenishment for products below minimum stock.",
        "Review the highest-issued SKUs when planning the next purchase cycle.",
      ],
    };
  }

  // -----------------------------
  // 5. Save report
  // -----------------------------

  const report = await db.inventoryReport.upsert({
    where: {
      userId_reportMonth: {
        userId,
        reportMonth,
      },
    },

    update: {
      totalReceived,
      totalIssued,
      receiptCount: receivedMovements.length,
      issueCount: issuedMovements.length,
      endingInventoryValue,
      lowStockCount: lowStockProducts.length,
      aiSummary: aiData.summary,
      aiHighlights: aiData.highlights,
      aiRisks: aiData.risks,
      aiRecommendations: aiData.recommendations,
    },

    create: {
      userId,
      reportMonth,
      totalReceived,
      totalIssued,
      receiptCount: receivedMovements.length,
      issueCount: issuedMovements.length,
      endingInventoryValue,
      lowStockCount: lowStockProducts.length,
      aiSummary: aiData.summary,
      aiHighlights: aiData.highlights,
      aiRisks: aiData.risks,
      aiRecommendations: aiData.recommendations,
    },
  });

  return report;
}