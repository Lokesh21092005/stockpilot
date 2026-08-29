"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

function nextQuantity(current, type, quantity) {
  if (type === "RECEIVE") return current + quantity;
  if (type === "ISSUE") return current - quantity;
  return quantity;
}

export async function createStockMovement(data) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const req = await request();
  const decision = await aj.protect(req, { userId: clerkUserId, requested: 1 });
  if (decision.isDenied()) throw new Error("Rate limit exceeded. Try again later.");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const product = await db.product.findFirst({
    where: {
      id: data.productId,
      userId: user.id,
      warehouseId: data.warehouseId,
    },
  });
  if (!product) throw new Error("Product not found");

  const quantity = Number(data.quantity);
  const newQuantity = nextQuantity(product.stockQuantity, data.type, quantity);

  if (newQuantity < 0) {
    throw new Error("Not enough stock for this issue operation.");
  }

  const result = await db.$transaction(async (tx) => {
    const movement = await tx.stockMovement.create({
      data: {
        type: data.type,
        quantity,
        unitCost: Number(data.unitCost),
        referenceNote: data.referenceNote || null,
        supplierName: data.supplierName || null,
        source: data.source || "MANUAL",
        movementDate: data.movementDate ? new Date(data.movementDate) : new Date(),
        productId: product.id,
        warehouseId: product.warehouseId,
        userId: user.id,
      },
    });

    await tx.product.update({
      where: { id: product.id },
      data: {
        stockQuantity: newQuantity,
        ...(data.type === "RECEIVE" ? { unitCost: Number(data.unitCost) } : {}),
      },
    });

    return movement;
  });

  revalidatePath("/dashboard");
  revalidatePath(`/warehouse/${product.warehouseId}`);

  return { success: true, data: { ...result, unitCost: Number(result.unitCost) } };
}

export async function updateMovement(movementId, data) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const req = await request();
  const decision = await aj.protect(req, { userId: clerkUserId, requested: 1 });
  if (decision.isDenied()) throw new Error("Rate limit exceeded. Try again later.");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const newQuantity = Number(data.quantity);
  if (isNaN(newQuantity) || newQuantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const result = await db.$transaction(async (tx) => {
    const existingMovement = await tx.stockMovement.findFirst({
      where: { id: movementId, userId: user.id },
      include: { product: true },
    });

    if (!existingMovement) throw new Error("Movement record not found");

    const product = existingMovement.product;

    // 1. Revert previous movement's effect on stock quantity
    let baselineStock = product.stockQuantity;
    if (existingMovement.type === "RECEIVE") {
      baselineStock -= existingMovement.quantity;
    } else if (existingMovement.type === "ISSUE") {
      baselineStock += existingMovement.quantity;
    }

    // 2. Apply updated movement
    const targetType = data.type || existingMovement.type;
    let finalStock = baselineStock;
    if (targetType === "RECEIVE") {
      finalStock += newQuantity;
    } else if (targetType === "ISSUE") {
      finalStock -= newQuantity;
    }

    if (finalStock < 0) {
      throw new Error(`Insufficient stock. Resulting stock would be ${finalStock}`);
    }

    const updatedMovement = await tx.stockMovement.update({
      where: { id: movementId },
      data: {
        type: targetType,
        quantity: newQuantity,
        ...(data.unitCost ? { unitCost: Number(data.unitCost) } : {}),
        ...(data.referenceNote !== undefined ? { referenceNote: data.referenceNote } : {}),
        ...(data.supplierName !== undefined ? { supplierName: data.supplierName } : {}),
        ...(data.movementDate ? { movementDate: new Date(data.movementDate) } : {}),
      },
    });

    await tx.product.update({
      where: { id: product.id },
      data: {
        stockQuantity: finalStock,
        ...(targetType === "RECEIVE" && data.unitCost
          ? { unitCost: Number(data.unitCost) }
          : {}),
      },
    });

    return updatedMovement;
  });

  revalidatePath("/dashboard");
  revalidatePath(`/warehouse/${result.warehouseId}`);

  return { success: true, data: { ...result, unitCost: Number(result.unitCost) } };
}

export async function getMovementFormData() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const [warehouses, products] = await Promise.all([
    db.warehouse.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
    db.product.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        warehouseId: true,
        stockQuantity: true,
        unitCost: true,
      },
    }),
  ]);

  return {
    warehouses,
    products: products.map((p) => ({ ...p, unitCost: Number(p.unitCost) })),
  };
}