import { getDashboardData } from "@/actions/dashboard";
import { CreateProductDrawer } from "@/components/create-product-drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Box, Plus, Search } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-slate-500">Catalog</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Products & SKUs</h1>
          <p className="mt-2 text-slate-600">See stock health, supplier context and reorder rules in one place.</p>
        </div>
        <CreateProductDrawer warehouses={data.warehouses}>
          <Button><Plus size={16} /> Add product</Button>
        </CreateProductDrawer>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search size={18} /> Active catalog · {data.products.length} SKUs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {data.products.map((p) => {
            const low = p.reorderPolicy && p.stockQuantity <= p.reorderPolicy.minimumStock;
            return (
              <Link key={p.id} href={`/warehouse/${p.warehouseId}`} className="rounded-xl border p-4 hover:bg-slate-50">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-slate-100 p-2"><Box size={18} /></div>
                    <div><p className="font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.sku} · {p.category} · {p.warehouse.name}</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-8 text-sm">
                    <div><p className="text-xs text-muted-foreground">Stock</p><p className="font-semibold">{p.stockQuantity} {p.unit}</p></div>
                    <div><p className="text-xs text-muted-foreground">Unit cost</p><p className="font-semibold">₹{p.unitCost.toFixed(2)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Status</p><Badge variant={low ? "destructive" : "secondary"}>{low ? "Reorder" : "Healthy"}</Badge></div>
                  </div>
                </div>
              </Link>
            );
          })}
          {!data.products.length && <p className="py-12 text-center text-sm text-muted-foreground">No products yet. Add your first SKU.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
