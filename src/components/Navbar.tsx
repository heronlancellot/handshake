"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/LogoHandShake.svg" alt="Handshake" width={36} height={36} priority />
          <span className="text-lg font-extrabold" style={{ color: "#7B6FD4" }}>
            Handshake
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-bold sm:flex">
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
