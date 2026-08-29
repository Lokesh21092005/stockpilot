"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getWarehouse(warehouseId) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const warehouse = await db.warehouse.findFirst({
    where: { id: warehouseId, userId: user.id },
    include: {
      products: {
        include: { reorderPolicy: true },
        orderBy: { updatedAt: "desc" },
      },
      movements: {
        include: { product: true },
        orderBy: { movementDate: "desc" },
        take: 50,
      },
    },
  });

  if (!warehouse) throw new Error("Warehouse not found");

  return {
    ...warehouse,
    products: warehouse.products.map((p) => ({
      ...p,
      unitCost: Number(p.unitCost),
    })),
    movements: warehouse.movements.map((m) => ({
      ...m,
      unitCost: Number(m.unitCost),
    })),
  };
}

export async function deleteWarehouse(warehouseId) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const warehouse = await db.warehouse.findFirst({
    where: { id: warehouseId, userId: user.id },
    include: {
      _count: {
        select: {
          products: true,
          movements: true,
        },
      },
    },
  });

  if (!warehouse) throw new Error("Warehouse not found");

  // Prevent deleting warehouses that currently hold inventory products
  if (warehouse._count.products > 0) {
    throw new Error(
      `Cannot delete "${warehouse.name}". It still contains ${warehouse._count.products} product(s). Remove or reassign them first.`
    );
  }

  // Atomically delete any historical movements tied to the warehouse and remove it
  await db.$transaction(async (tx) => {
    await tx.stockMovement.deleteMany({
      where: { warehouseId, userId: user.id },
    });

    await tx.warehouse.delete({
      where: { id: warehouseId },
    });
  });

  revalidatePath("/dashboard");
  return { success: true };
}