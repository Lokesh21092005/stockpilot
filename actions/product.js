"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const serializeProduct = (product) => ({
  ...product,
  unitCost: Number(product.unitCost),
  reorderPolicy: product.reorderPolicy ? { ...product.reorderPolicy } : null,
});

export async function createProduct(data) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const req = await request();
  const decision = await aj.protect(req, { userId: clerkUserId, requested: 1 });
  if (decision.isDenied()) throw new Error("Rate limit exceeded. Try again later.");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const warehouse = await db.warehouse.findFirst({
    where: { id: data.warehouseId, userId: user.id },
  });
  if (!warehouse) throw new Error("Warehouse not found");

  const product = await db.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      unit: data.unit,
      stockQuantity: Number(data.stockQuantity),
      unitCost: Number(data.unitCost),
      supplierName: data.supplierName || null,
      warehouseId: warehouse.id,
      userId: user.id,
      reorderPolicy: {
        create: {
          minimumStock: Number(data.minimumStock),
          reorderAmount: Number(data.reorderAmount),
          userId: user.id,
        },
      },
    },
    include: { reorderPolicy: true, warehouse: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/product");
  return { success: true, data: serializeProduct(product) };
}

export async function updateProduct(productId, data) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const req = await request();
  const decision = await aj.protect(req, { userId: clerkUserId, requested: 1 });
  if (decision.isDenied()) throw new Error("Rate limit exceeded. Try again later.");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const existing = await db.product.findFirst({
    where: { id: productId, userId: user.id },
  });
  if (!existing) throw new Error("Product not found");

  const updatedProduct = await db.product.update({
    where: { id: productId },
    data: {
      name: data.name,
      category: data.category,
      unit: data.unit,
      unitCost: Number(data.unitCost),
      supplierName: data.supplierName || null,
      reorderPolicy: data.minimumStock !== undefined
        ? {
            upsert: {
              create: {
                minimumStock: Number(data.minimumStock),
                reorderAmount: Number(data.reorderAmount || data.minimumStock * 2),
                userId: user.id,
              },
              update: {
                minimumStock: Number(data.minimumStock),
                reorderAmount: Number(data.reorderAmount || data.minimumStock * 2),
              },
            },
          }
        : undefined,
    },
    include: { reorderPolicy: true, warehouse: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/product");
  revalidatePath(`/warehouse/${existing.warehouseId}`);

  return { success: true, data: serializeProduct(updatedProduct) };
}

export async function updateReorderPolicy(productId, minimumStock, reorderAmount) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const product = await db.product.findFirst({
    where: { id: productId, userId: user.id },
  });
  if (!product) throw new Error("Product not found");

  const policy = await db.reorderPolicy.upsert({
    where: { productId },
    update: { minimumStock: Number(minimumStock), reorderAmount: Number(reorderAmount) },
    create: {
      productId,
      userId: user.id,
      minimumStock: Number(minimumStock),
      reorderAmount: Number(reorderAmount),
    },
  });

  revalidatePath("/dashboard");
  return { success: true, data: policy };
}