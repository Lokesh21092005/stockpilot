"use client";

import { useState } from "react";
import { updateProduct } from "@/actions/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function EditProductDialog({ product }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(product.name || "");
  const [category, setCategory] = useState(product.category || "");
  const [unit, setUnit] = useState(product.unit || "pcs");
  const [unitCost, setUnitCost] = useState(product.unitCost || 0);
  const [supplierName, setSupplierName] = useState(product.supplierName || "");
  const [minimumStock, setMinimumStock] = useState(product.reorderPolicy?.minimumStock ?? 10);
  const [reorderAmount, setReorderAmount] = useState(product.reorderPolicy?.reorderAmount ?? 20);

  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await updateProduct(product.id, {
        name,
        category,
        unit,
        unitCost: Number(unitCost),
        supplierName,
        minimumStock: Number(minimumStock),
        reorderAmount: Number(reorderAmount),
      });

      if (res.success) {
        toast.success("Product updated successfully");
        setOpen(false);
        router.refresh();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-900">
          <Pencil size={13} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Product ({product.sku})</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Unit (e.g. pcs, kg)</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Unit Cost (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reorder Alerts
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Min Stock Alert</Label>
                <Input
                  type="number"
                  value={minimumStock}
                  onChange={(e) => setMinimumStock(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Reorder Amount</Label>
                <Input
                  type="number"
                  value={reorderAmount}
                  onChange={(e) => setReorderAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}