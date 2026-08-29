import { getWarehouse } from "@/actions/warehouse";
import Link from "next/link";
import { ArrowLeft, ArrowDownRight, ArrowUpRight, CircleAlert, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DeleteWarehouseButton } from "@/components/delete-warehouse-button";
import { EditMovementDialog } from "@/components/edit-movement-dialog";
import { EditProductDialog } from "@/components/edit-product-dialog";

export default async function WarehousePage({ params }) {
  const { id } = await params;
  const warehouse = await getWarehouse(id);

  const lowStock = warehouse.products.filter(
    (p) => p.reorderPolicy && p.stockQuantity <= p.reorderPolicy.minimumStock
  );
  const inventoryValue = warehouse.products.reduce(
    (sum, p) => sum + p.stockQuantity * p.unitCost,
    0
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <h1 className="text-3xl font-black tracking-tight">{warehouse.name}</h1>
          <p className="mt-1 text-slate-500">{warehouse.location || "Location not set"}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <DeleteWarehouseButton
            warehouseId={warehouse.id}
            warehouseName={warehouse.name}
          />
          <Link href="/movement/create">
            <Button>
              <Plus size={16} /> Record movement
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">SKUs</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {warehouse.products.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Inventory value</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ₹{inventoryValue.toFixed(0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Low-stock</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {lowStock.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Movement log</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {warehouse.movements.length}
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleAlert size={18} /> Reorder attention
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {lowStock.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border bg-white p-3"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Minimum {p.reorderPolicy.minimumStock} · Suggested{" "}
                    {p.reorderPolicy.reorderAmount}
                  </p>
                </div>
                <Badge variant="destructive">{p.stockQuantity} left</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {warehouse.products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products registered in this warehouse.</p>
            ) : (
              warehouse.products.map((p) => {
                const formattedUnit = !p.unit || !isNaN(Number(p.unit)) ? "units" : p.unit;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.sku} · {p.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {p.stockQuantity}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            {formattedUnit}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₹{p.unitCost.toFixed(2)} / unit
                        </p>
                      </div>
                      {/* Edit Product Dialog */}
                      <EditProductDialog product={p} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movement history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {warehouse.movements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stock movements recorded yet.</p>
            ) : (
              warehouse.movements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2">
                      {m.type === "RECEIVE" ? (
                        <ArrowDownRight size={16} />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(m.movementDate), "PP")} ·{" "}
                        {m.referenceNote || "No reference"}
                      </p>
                    </div>
                  </div>

                  {/* Movement Status Badge & Edit Action */}
                  <div className="flex items-center gap-2">
                    <Badge variant={m.type === "RECEIVE" ? "default" : "secondary"}>
                      {m.type} {m.quantity}
                    </Badge>
                    <EditMovementDialog movement={m} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}