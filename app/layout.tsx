import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/src/providers/Web3Provider";
import { Navbar } from "@/src/components/Navbar";

export const metadata: Metadata = {
  title: "Handshake — P2P Marketplace",
  description: "Decentralized P2P marketplace on Monad blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        <Web3Provider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}
