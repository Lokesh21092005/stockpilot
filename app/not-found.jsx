import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-black">404</h1>
        <p className="mt-2 text-slate-500">This stock room doesn&apos;t exist.</p>
        <Link href="/dashboard">
          <Button className="mt-5">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}