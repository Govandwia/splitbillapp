import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Pizza, Coffee, Coins, Receipt, Utensils, Wallet, Banknote, ShoppingBag } from "lucide-react";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Split Bill Collaborative",
  description: "Real-time collaborative bill splitting app",
};

function BackgroundDecoration() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-[0.05]">
      <Pizza className="absolute top-[10%] left-[5%] w-32 h-32 rotate-12 text-retro-red" />
      <Coffee className="absolute top-[30%] right-[10%] w-40 h-40 -rotate-12 text-retro-blue" />
      <Coins className="absolute bottom-[20%] left-[15%] w-48 h-48 rotate-45 text-retro-yellow" />
      <Receipt className="absolute bottom-[10%] right-[5%] w-36 h-36 -rotate-6 text-retro-fg" />
      <Utensils className="absolute top-[50%] left-[8%] w-24 h-24 rotate-90 text-retro-green" />
      <Wallet className="absolute top-[15%] right-[25%] w-28 h-28 -rotate-45 text-retro-red" />
      <Banknote className="absolute bottom-[40%] right-[20%] w-32 h-32 rotate-[30deg] text-retro-green" />
      <ShoppingBag className="absolute bottom-[5%] left-[40%] w-24 h-24 -rotate-[15deg] text-retro-blue" />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-retro-fg selection:bg-retro-red selection:text-white">
        <BackgroundDecoration />
        {children}
      </body>
    </html>
  );
}
