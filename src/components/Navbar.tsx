"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-violet-400 hover:text-violet-300 transition-colors">
          <span className="text-2xl">&#9670;</span>
          MonadMarket
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
            Explore
          </Link>
          <Link href="/sell" className="text-zinc-400 hover:text-white transition-colors">
            Sell
          </Link>
          <Link href="/my-deals" className="text-zinc-400 hover:text-white transition-colors">
            My Deals
          </Link>
          <Link href="/my-loans" className="text-zinc-400 hover:text-white transition-colors">
            My Loans
          </Link>
          <Link href="/pool" className="text-zinc-400 hover:text-white transition-colors">
            Pool
          </Link>
        </nav>

        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="avatar"
        />
      </div>
    </header>
  );
}
