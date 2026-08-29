"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteWarehouse } from "@/actions/warehouse";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteWarehouseButton({ warehouseId, warehouseName }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${warehouseName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await deleteWarehouse(warehouseId);
      if (res?.success) {
        toast.success("Warehouse deleted successfully");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete warehouse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      <span>{loading ? "Deleting..." : "Delete Warehouse"}</span>
    </Button>
  );
}