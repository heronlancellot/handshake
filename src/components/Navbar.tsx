"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 relative">
        {/* Logo — left */}
        <Link
          href="/"
          className="flex h-full items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/Handshake.svg"
            alt="Handshake"
            width={80}
            height={80}
            priority
          />
          <span className="text-lg font-extrabold" style={{ color: "#7B6FD4" }}>
            <span className="text-white">Hand</span>shake
          </span>
        </Link>

        {/* Nav links — absolutely centered */}
        <nav className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 text-sm font-bold">
          <Link
            href="/"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/sell"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Sell
          </Link>
          <Link
            href="/my-deals"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            My Deals
          </Link>
          <Link
            href="/my-loans"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            My Loans
          </Link>
          <Link
            href="/pool"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Pool
          </Link>
        </nav>

        {/* Connect button — right */}
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="avatar"
        />
      </div>
    </header>
  );
}
