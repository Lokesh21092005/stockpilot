"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { request } from "@arcjet/next";

function serializeDecimal(obj) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "object" && value !== null && "d" in value && "s" in value
        ? Number(value)
        : value
    )
  );
}

function serializeProduct(product) {
  return {
    ...product,
    unitCost: Number(product.unitCost),
    reorderPolicy: product.reorderPolicy
      ? {
          ...product.reorderPolicy,
        }
      : null,
  };
}

function serializeMovement(movement) {
  return {
    ...movement,
    unitCost: Number(movement.unitCost),
    product: movement.product
      ? {
          ...movement.product,
          unitCost: Number(movement.product.unitCost),
        }
      : null,
  };
}

export async function getDashboardData() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const [warehouses, products, movements] = await Promise.all([
    db.warehouse.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { products: true, movements: true } } },
    }),
    db.product.findMany({
      where: { userId: user.id },
      include: { warehouse: true, reorderPolicy: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.stockMovement.findMany({
      where: { userId: user.id },
      include: { product: true, warehouse: true },
      orderBy: { movementDate: "desc" },
      take: 20,
    }),
  ]);

  const serializedProducts = products.map(serializeProduct);
  const serializedMovements = movements.map(serializeMovement);

  const lowStock = serializedProducts.filter(
    (p) => p.reorderPolicy && p.stockQuantity <= p.reorderPolicy.minimumStock
  );

  const inventoryValue = serializedProducts.reduce(
    (sum, product) => sum + product.stockQuantity * Number(product.unitCost),
    0
  );

  const incomingLast30Days = serializedMovements
    .filter(
      (m) =>
        m.type === "RECEIVE" &&
        new Date(m.movementDate) >= new Date(Date.now() - 30 * 86400000)
    )
    .reduce((sum, m) => sum + m.quantity, 0);

  const issuedLast30Days = serializedMovements
    .filter(
      (m) =>
        m.type === "ISSUE" &&
        new Date(m.movementDate) >= new Date(Date.now() - 30 * 86400000)
    )
    .reduce((sum, m) => sum + m.quantity, 0);

  return serializeDecimal({
    user,
    warehouses,
    products: serializedProducts,
    movements: serializedMovements,
    lowStock,
    inventoryValue,
    incomingLast30Days,
    issuedLast30Days,
  });
}

export async function createWarehouse(data) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const req = await request();
  const decision = await aj.protect(req, { userId: clerkUserId, requested: 1 });
  if (decision.isDenied()) throw new Error("Too many requests. Please try again later.");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const existing = await db.warehouse.count({ where: { userId: user.id } });
  const shouldBeDefault = existing === 0 ? true : Boolean(data.isDefault);

  if (shouldBeDefault) {
    await db.warehouse.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const warehouse = await db.warehouse.create({
    data: {
      name: data.name,
      location: data.location || null,
      isDefault: shouldBeDefault,
      userId: user.id,
    },
  });

  return { success: true, data: serializeDecimal(warehouse) };
}

export async function updateDefaultWarehouse(warehouseId) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  await db.warehouse.updateMany({
    where: { userId: user.id, isDefault: true },
    data: { isDefault: false },
  });

  const warehouse = await db.warehouse.update({
    where: { id: warehouseId, userId: user.id },
    data: { isDefault: true },
  });

  return { success: true, data: serializeDecimal(warehouse) };
}