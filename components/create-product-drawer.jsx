"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { productSchema } from "@/app/lib/schema";
import { createProduct } from "@/actions/product";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CreateProductDrawer({ children, warehouses }) {
  const [open, setOpen] = useState(false);
  const firstWarehouse = warehouses.find((w) => w.isDefault)?.id || warehouses[0]?.id;
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", sku: "", category: "Fasteners", unit: "pcs",
      stockQuantity: 0, unitCost: 0, supplierName: "", warehouseId: firstWarehouse || "",
      minimumStock: 10, reorderAmount: 50,
    },
  });

  const { loading, fn, data, error } = useFetch(createProduct);

  const onSubmit = async (values) => fn(values);

  useEffect(() => {
    if (data?.success) {
      toast.success("Product created");
      reset({ name: "", sku: "", category: "Fasteners", unit: "pcs", stockQuantity: 0, unitCost: 0, supplierName: "", warehouseId: firstWarehouse || "", minimumStock: 10, reorderAmount: 50 });
      setOpen(false);
    }
  }, [data, reset, firstWarehouse]);

  useEffect(() => {
    if (error) toast.error(error.message || "Could not create product");
  }, [error]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader><DrawerTitle>Add product</DrawerTitle></DrawerHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 px-4 pb-8 md:grid-cols-2">
          <div><label className="text-sm font-medium">Product</label><Input placeholder="M10 Hex Bolt" {...register("name")} />{errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}</div>
          <div><label className="text-sm font-medium">SKU</label><Input placeholder="BOLT-M10" {...register("sku")} />{errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}</div>
          <div><label className="text-sm font-medium">Category</label><Input placeholder="Fasteners" {...register("category")} /></div>
          <div><label className="text-sm font-medium">Unit</label><Input placeholder="pcs" {...register("unit")} /></div>
          <div><label className="text-sm font-medium">Opening stock</label><Input type="number" {...register("stockQuantity")} /></div>
          <div><label className="text-sm font-medium">Unit cost</label><Input type="number" step="0.01" {...register("unitCost")} /></div>
          <div><label className="text-sm font-medium">Supplier</label><Input placeholder="Industrial Supply Co." {...register("supplierName")} /></div>
          <div><label className="text-sm font-medium">Warehouse</label>
            <Select value={watch("warehouseId")} onValueChange={(v) => setValue("warehouseId", v)}>
              <SelectTrigger><SelectValue placeholder="Choose warehouse" /></SelectTrigger>
              <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><label className="text-sm font-medium">Minimum stock</label><Input type="number" {...register("minimumStock")} /></div>
          <div><label className="text-sm font-medium">Reorder amount</label><Input type="number" {...register("reorderAmount")} /></div>
          <div className="md:col-span-2 flex gap-3 pt-2">
            <DrawerClose asChild><Button type="button" variant="outline" className="flex-1">Cancel</Button></DrawerClose>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? <><Loader2 className="animate-spin" /> Saving...</> : "Create product"}</Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
