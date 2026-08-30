import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { VehicleProvider } from "@/lib/vehicle";
import { Header } from "@/components/Header";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PartsRoute — Auto Parts Marketplace",
  description:
    "Search millions of aftermarket and OE auto parts from local suppliers, compare live pricing and availability, and order in one cart.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <VehicleProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
          </CartProvider>
        </VehicleProvider>
      </body>
    </html>
  );
}
