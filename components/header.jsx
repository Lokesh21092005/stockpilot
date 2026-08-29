import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Boxes,
  ClipboardPlus,
  LayoutDashboard,
  FileText,
} from "lucide-react";import { Button } from "@/components/ui/button";
import { checkUser } from "@/lib/checkUser";

export default async function Header() {
  await checkUser();

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white/90 backdrop-blur">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Boxes size={18} />
          </div>
          <span>StockPilot</span>
        </Link>

        <div className="flex items-center gap-3">
          <SignedOut>
            <Link href="#features" className="hidden text-sm text-slate-600 hover:text-slate-900 md:block">
              Features
            </Link>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline">Sign in</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard">
              <Button variant="outline">
                <LayoutDashboard size={16} />
                Dashboard
              </Button>
            </Link>
            <Link href="/movement/create">
              <Button>
                <ClipboardPlus size={16} />
                Record Movement
              </Button>
            </Link>

            <Link href="/reports">
              <Button variant="outline">
              <FileText size={16} />
              Reports
              </Button>
            </Link>
            <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
