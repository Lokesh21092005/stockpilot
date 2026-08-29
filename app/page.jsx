import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, Bot, Boxes, Gauge, ScanLine, ShieldCheck, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { icon: Boxes, title: "Inventory control", text: "Track stock across warehouses and keep a clean movement history." },
  { icon: ScanLine, title: "AI intake", text: "Turn invoices and delivery notes into structured inventory movements." },
  { icon: Gauge, title: "Reorder intelligence", text: "Set minimum-stock rules and surface products that need attention." },
  { icon: Workflow, title: "Background automation", text: "Run scheduled checks and send operational alerts without blocking users." },
  { icon: ShieldCheck, title: "Protected writes", text: "Use Clerk authorization and Arcjet rate limits on important mutations." },
  { icon: Bot, title: "AI operations digest", text: "Generate practical inventory insights from recent activity." },
];

export default function Home() {
  return (
    <div className="pt-20">
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            <Bot size={15} /> AI-assisted inventory operations
          </div>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            Know what you have.
            <span className="block text-slate-500">Know what to reorder.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            StockPilot is a full-stack inventory workspace for products, warehouses, stock movements, reorder policies, and AI-assisted intake.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg">Open dashboard <ArrowRight size={16} /></Button>
              </Link>
            </SignedIn>
            <SignedOut>
              <Link href="/sign-up">
                <Button size="lg">Create workspace <ArrowRight size={16} /></Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">See features</Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </section>

      <section id="features" className="border-y bg-slate-50">
        <div className="container mx-auto grid gap-4 px-4 py-16 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="border-slate-200 shadow-none">
              <CardHeader><Icon size={22} /><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
              <CardContent className="text-sm leading-6 text-slate-600">{text}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
