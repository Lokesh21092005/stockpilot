"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { warehouseSchema } from "@/app/lib/schema";
import { createWarehouse } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function CreateWarehouseDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: zodResolver(warehouseSchema),
    defaultValues: { name: "", location: "", isDefault: false },
  });

  const { loading, fn, data, error } = useFetch(createWarehouse);

  const onSubmit = async (values) => fn(values);

  useEffect(() => {
    if (data?.success) {
      toast.success("Warehouse created");
      reset();
      setOpen(false);
    }
  }, [data, reset]);

  useEffect(() => {
    if (error) toast.error(error.message || "Could not create warehouse");
  }, [error]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader><DrawerTitle>New warehouse</DrawerTitle></DrawerHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 pb-8">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input placeholder="North Hub" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input placeholder="Bengaluru" {...register("location")} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div><p className="font-medium">Default warehouse</p><p className="text-xs text-muted-foreground">Use it as the first-choice location.</p></div>
            <Switch checked={watch("isDefault")} onCheckedChange={(v) => setValue("isDefault", v)} />
          </div>
          <div className="flex gap-3">
            <DrawerClose asChild><Button type="button" variant="outline" className="flex-1">Cancel</Button></DrawerClose>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <><Loader2 className="animate-spin" /> Creating...</> : "Create warehouse"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
