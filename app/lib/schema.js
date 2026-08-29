import { z } from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(1, "Warehouse name is required"),
  location: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  stockQuantity: z.coerce.number().int().min(0),
  unitCost: z.coerce.number().min(0),
  supplierName: z.string().optional(),
  warehouseId: z.string().min(1, "Warehouse is required"),
  minimumStock: z.coerce.number().int().min(0),
  reorderAmount: z.coerce.number().int().min(1),
});

export const movementSchema = z.object({
  type: z.enum(["RECEIVE", "ISSUE", "ADJUSTMENT"]),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
  unitCost: z.coerce.number().min(0),
  referenceNote: z.string().optional(),
  supplierName: z.string().optional(),
  movementDate: z.date(),
  productId: z.string().min(1, "Product is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  source: z.enum(["MANUAL", "AI_SCAN", "IMPORT", "SYSTEM"]).default("MANUAL"),
});
