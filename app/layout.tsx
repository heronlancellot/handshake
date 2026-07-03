import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/src/providers/Web3Provider";
import { Navbar } from "@/src/components/layout/Navbar";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/src/lib/i18n/context";
import { BottomNav } from "@/src/components/layout/BottomNav";
import { ErrorBoundary } from "@/src/components/feedback/ErrorBoundary";

export const metadata: Metadata = {
  title: "Handshake — Trustless P2P Marketplace on Monad",
  description:
    "Decentralized peer-to-peer marketplace with on-chain escrow and BNPL financing on Monad blockchain.",
  openGraph: {
    title: "Handshake — Trustless P2P Marketplace on Monad",
    description:
      "Buy and sell with on-chain escrow. No intermediaries, no chargebacks. BNPL powered by DeFi.",
    type: "website",
    siteName: "Handshake",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Handshake — Trustless P2P Marketplace on Monad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Handshake — Trustless P2P Marketplace on Monad",
    description:
      "Buy and sell with on-chain escrow. No intermediaries, no chargebacks. BNPL powered by DeFi.",
    images: ["/og-image.png"],
  },
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
            <main className="flex-1 pb-20 sm:pb-0">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <BottomNav />
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
