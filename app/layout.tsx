import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/src/providers/Web3Provider";
import { Navbar } from "@/src/components/Navbar";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/src/lib/i18n/context";

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
          <LanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: { background: "#18181b", border: "1px solid #3f3f46", color: "#fafafa" },
            }}
          />
          </LanguageProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
