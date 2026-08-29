import { seedDemoData } from "@/actions/seed";

export async function POST() {
  const result = await seedDemoData();
  return Response.json(result);
}
