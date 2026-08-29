"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function seedDemoData() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const warehouse = await db.warehouse.upsert({
    where: { id: `demo-${user.id}` },
    update: {},
    create: {
      id: `demo-${user.id}`,
      name: "North Hub",
      location: "Bengaluru",
      isDefault: true,
      userId: user.id,
    },
  });

  const samples = [
    { sku: "BRG-6205", name: "6205 Deep Groove Bearing", category: "Bearings", unitCost: 185, quantity: 42, min: 15, reorder: 50 },
    { sku: "NUT-M08", name: "M8 Hex Nut", category: "Fasteners", unitCost: 4.5, quantity: 180, min: 80, reorder: 250 },
    { sku: "BOLT-M10", name: "M10 Hex Bolt", category: "Fasteners", unitCost: 8.75, quantity: 32, min: 40, reorder: 120 },
    { sku: "GLV-NIT", name: "Nitrile Safety Gloves", category: "Safety", unitCost: 52, quantity: 95, min: 50, reorder: 150 },
    { sku: "LUBE-1L", name: "Industrial Lubricant 1L", category: "Maintenance", unitCost: 310, quantity: 12, min: 20, reorder: 40 },
  ];

  for (const item of samples) {
    const product = await db.product.upsert({
      where: { userId_sku: { userId: user.id, sku: item.sku } },
      update: {
        stockQuantity: item.quantity,
        unitCost: item.unitCost,
        warehouseId: warehouse.id,
      },
      create: {
        sku: item.sku,
        name: item.name,
        category: item.category,
        unit: "pcs",
        stockQuantity: item.quantity,
        unitCost: item.unitCost,
        warehouseId: warehouse.id,
        userId: user.id,
        supplierName: "Demo Industrial Supply",
        reorderPolicy: {
          create: {
            minimumStock: item.min,
            reorderAmount: item.reorder,
            userId: user.id,
          },
        },
      },
    });

    await db.stockMovement.deleteMany({ where: { productId: product.id, userId: user.id } });

    for (let i = 0; i < 8; i++) {
      const receive = i % 2 === 0;
      await db.stockMovement.create({
        data: {
          type: receive ? "RECEIVE" : "ISSUE",
          quantity: receive ? 25 + i * 2 : 10 + i,
          unitCost: item.unitCost,
          referenceNote: receive ? "PO-DEMO" : "WORKORDER-DEMO",
          supplierName: receive ? "Demo Industrial Supply" : null,
          source: "IMPORT",
          movementDate: subDays(new Date(), 28 - i * 3),
          productId: product.id,
          warehouseId: warehouse.id,
          userId: user.id,
        },
      });
    }
  }

  return { success: true };
}
