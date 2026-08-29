"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { movementSchema } from "@/app/lib/schema";
import { createStockMovement } from "@/actions/movement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DocumentScanner } from "@/components/document-scanner";
import { cn } from "@/lib/utils";

export default function MovementForm({ warehouses, products }) {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: "RECEIVE",
      quantity: 1,
      unitCost: 0,
      referenceNote: "",
      supplierName: "",
      movementDate: new Date(),
      productId: products[0]?.id || "",
      warehouseId: warehouses.find((w) => w.isDefault)?.id || warehouses[0]?.id || "",
      source: "MANUAL",
    },
  });

  const { loading, fn, data, error } = useFetch(createStockMovement);
  const type = watch("type");
  const selectedWarehouseId = watch("warehouseId");
  const movementDate = watch("movementDate");
  const selectedProductId = watch("productId");

  const warehouseProducts = useMemo(
    () => products.filter((p) => p.warehouseId === selectedWarehouseId),
    [products, selectedWarehouseId]
  );

  useEffect(() => {
    if (!warehouseProducts.some((p) => p.id === selectedProductId)) {
      if (warehouseProducts[0]) setValue("productId", warehouseProducts[0].id);
    }
  }, [warehouseProducts, selectedProductId, setValue]);

  useEffect(() => {
    if (data?.success) {
      toast.success("Movement recorded");
      reset();
      router.push(`/warehouse/${data.data.warehouseId}`);
    }
  }, [data, reset, router]);

  useEffect(() => {
    if (error) toast.error(error.message || "Could not record movement");
  }, [error]);

  const scanResult = (scanned) => {
    if (scanned.quantity) setValue("quantity", scanned.quantity);
    if (scanned.unitCost) setValue("unitCost", scanned.unitCost);
    if (scanned.supplierName) setValue("supplierName", scanned.supplierName);
    if (scanned.movementDate) setValue("movementDate", new Date(scanned.movementDate));
    setValue("source", "AI_SCAN");

    const match = products.find(
      (p) => (scanned.sku && p.sku.toLowerCase() === scanned.sku.toLowerCase()) ||
             (scanned.productName && p.name.toLowerCase() === scanned.productName.toLowerCase())
    );

    if (match) {
      setValue("productId", match.id);
      setValue("warehouseId", match.warehouseId);
      toast.success(`Matched ${match.name}`);
    } else {
      toast.info("AI extracted the document, but no existing SKU matched.");
    }
  };

  return (
    <form onSubmit={handleSubmit((values) => fn(values))} className="space-y-6">
      <DocumentScanner onScanComplete={scanResult} />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Warehouse</label>
          <Select value={selectedWarehouseId} onValueChange={(v) => setValue("warehouseId", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
          </Select>
          {errors.warehouseId && <p className="text-sm text-red-500">{errors.warehouseId.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Product</label>
          <Select value={selectedProductId} onValueChange={(v) => setValue("productId", v)}>
            <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
            <SelectContent>{warehouseProducts.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} · {p.sku}</SelectItem>)}</SelectContent>
          </Select>
          {errors.productId && <p className="text-sm text-red-500">{errors.productId.message}</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div><label className="text-sm font-medium">Movement type</label>
          <Select value={type} onValueChange={(v) => setValue("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="RECEIVE">Receive</SelectItem><SelectItem value="ISSUE">Issue</SelectItem><SelectItem value="ADJUSTMENT">Set stock</SelectItem></SelectContent>
          </Select>
        </div>
        <div><label className="text-sm font-medium">Quantity</label><Input type="number" min="1" {...register("quantity")} />{errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}</div>
        <div><label className="text-sm font-medium">Unit cost</label><Input type="number" min="0" step="0.01" {...register("unitCost")} /></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div><label className="text-sm font-medium">Supplier</label><Input placeholder="Acme Industrial" {...register("supplierName")} /></div>
        <div><label className="text-sm font-medium">Reference</label><Input placeholder="PO-1042 or WO-209" {...register("referenceNote")} /></div>
      </div>

      <div>
        <label className="text-sm font-medium">Movement date</label>
        <Popover>
          <PopoverTrigger asChild><Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !movementDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{movementDate ? format(new Date(movementDate), "PPP") : "Pick a date"}</Button></PopoverTrigger>
          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={new Date(movementDate)} onSelect={(d) => d && setValue("movementDate", d)} /></PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? <><Loader2 className="animate-spin" /> Saving...</> : "Record movement"}</Button>
      </div>
    </form>
  );
}
