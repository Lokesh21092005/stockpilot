import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
import { Toaster } from "sonner";

export const metadata = {
  title: "StockPilot",
  description: "AI inventory and procurement operations platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          <footer className="border-t bg-slate-50 py-8">
            <div className="container mx-auto px-4 text-center text-sm text-slate-500">
              StockPilot • Inventory operations made easier
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
