"use client";

import Link from "next/link";
import { MapPin, PackageOpen, Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/use-fetch";
import { updateDefaultWarehouse } from "@/actions/dashboard";
import { toast } from "sonner";
import { useEffect } from "react";

export function WarehouseCard({ warehouse }) {
  const { loading, fn, data, error } = useFetch(updateDefaultWarehouse);

  useEffect(() => {
    if (data?.success) toast.success("Default warehouse updated");
    if (error) toast.error(error.message || "Could not update warehouse");
  }, [data, error]);

  const toggle = async (event) => {
    event.preventDefault();
    if (warehouse.isDefault) {
      toast.warning("Keep at least one default warehouse.");
      return;
    }
    await fn(warehouse.id);
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <Link href={`/warehouse/${warehouse.id}`}>
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div><CardTitle className="text-base">{warehouse.name}</CardTitle><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} /> {warehouse.location || "Location not set"}</p></div>
          <Switch checked={warehouse.isDefault} onClick={toggle} disabled={loading} />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 p-3"><PackageOpen size={16} /><p className="mt-2 text-xl font-semibold">{warehouse._count.products}</p><p className="text-xs text-muted-foreground">SKUs</p></div>
          <div className="rounded-lg bg-slate-50 p-3"><Star size={16} /><p className="mt-2 text-xl font-semibold">{warehouse._count.movements}</p><p className="text-xs text-muted-foreground">Movements</p></div>
        </CardContent>
        <CardFooter><Badge variant={warehouse.isDefault ? "default" : "secondary"}>{warehouse.isDefault ? "Default hub" : "Warehouse"}</Badge></CardFooter>
      </Link>
    </Card>
  );
}
