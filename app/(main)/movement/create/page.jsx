import { getMovementFormData } from "@/actions/movement";
import MovementForm from "@/components/movement-form";

export default async function CreateMovementPage() {
  const data = await getMovementFormData();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">Inventory operation</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Record stock movement</h1>
        <p className="mt-2 text-slate-600">Receive, issue, or adjust stock. The product quantity is updated atomically with the movement.</p>
      </div>
      <MovementForm warehouses={data.warehouses} products={data.products} />
    </div>
  );
}
