-- CreateTable
CREATE TABLE "inventory_reports" (
    "id" TEXT NOT NULL,
    "reportMonth" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "totalReceived" INTEGER NOT NULL,
    "totalIssued" INTEGER NOT NULL,
    "receiptCount" INTEGER NOT NULL,
    "issueCount" INTEGER NOT NULL,
    "endingInventoryValue" DECIMAL(65,30) NOT NULL,
    "lowStockCount" INTEGER NOT NULL,
    "aiSummary" TEXT NOT NULL,
    "aiHighlights" JSONB NOT NULL,
    "aiRisks" JSONB NOT NULL,
    "aiRecommendations" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_reports_userId_idx" ON "inventory_reports"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_reports_userId_reportMonth_key" ON "inventory_reports"("userId", "reportMonth");

-- AddForeignKey
ALTER TABLE "inventory_reports" ADD CONSTRAINT "inventory_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;