import { getDashboardData } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WarehouseCard } from "@/components/warehouse-card";
import { CreateWarehouseDrawer } from "@/components/create-warehouse-drawer";
import { CreateProductDrawer } from "@/components/create-product-drawer";
import { ArrowDownRight, ArrowUpRight, Box, Boxes, CircleAlert, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { DashboardCharts } from "@/components/dashboard-charts";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-slate-500">Inventory command center</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Welcome back, {data.user.name?.split(" ")[0] || "there"}.</h1>
          <p className="mt-2 text-slate-600">A live view of stock, movement and reorder risk.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/movement/create"><Button><Plus size={16} /> Record movement</Button></Link>
          <CreateProductDrawer warehouses={data.warehouses}><Button variant="outline"><Box size={16} /> Add product</Button></CreateProductDrawer>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Inventory value</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">₹{data.inventoryValue.toFixed(0)}</div><p className="text-xs text-muted-foreground">{data.products.length} active SKUs</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Low-stock SKUs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.lowStock.length}</div><p className="text-xs text-muted-foreground">Need reorder attention</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Received · 30d</CardTitle></CardHeader><CardContent><div className="flex items-center gap-1 text-2xl font-bold"><ArrowDownRight size={18} />{data.incomingLast30Days}</div><p className="text-xs text-muted-foreground">Units received</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Issued · 30d</CardTitle></CardHeader><CardContent><div className="flex items-center gap-1 text-2xl font-bold"><ArrowUpRight size={18} />{data.issuedLast30Days}</div><p className="text-xs text-muted-foreground">Units issued</p></CardContent></Card>
      </div>

      <DashboardCharts products={data.products} movements={data.movements} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent movements</CardTitle><Link href="/movement/create"><Button variant="outline" size="sm">New movement</Button></Link></CardHeader>
          <CardContent className="space-y-4">
            {data.movements.slice(0, 8).map((m) => (
              <div key={m.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-slate-100 p-2"><Boxes size={16} /></div>
                  <div><p className="text-sm font-semibold">{m.product.name}</p><p className="text-xs text-muted-foreground">{m.referenceNote || m.type} · {format(new Date(m.movementDate), "PP")}</p></div>
                </div>
                <Badge variant={m.type === "RECEIVE" ? "default" : "secondary"}>{m.type} {m.quantity}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CircleAlert size={18} /> Reorder queue</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.lowStock.length === 0 ? <p className="text-sm text-muted-foreground">Everything is above its reorder threshold.</p> : data.lowStock.slice(0, 6).map((p) => (
              <Link href={`/warehouse/${p.warehouseId}`} key={p.id} className="block rounded-lg border p-3 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.sku}</p></div><Badge variant="destructive">{p.stockQuantity} left</Badge></div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-bold">Warehouses</h2><p className="text-sm text-slate-500">Operational locations connected to your inventory.</p></div><CreateWarehouseDrawer><Button variant="outline"><Plus size={16} /> New warehouse</Button></CreateWarehouseDrawer></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.warehouses.map((warehouse) => <WarehouseCard key={warehouse.id} warehouse={warehouse} />)}
        </div>
      </section>
    </div>
  );
}
