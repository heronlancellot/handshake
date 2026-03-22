"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLanguage } from "@/src/lib/i18n/context";

export function Navbar() {
  const { t, lang, toggle } = useLanguage();

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
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
            {t.navbar.explore}
          </Link>
          <Link href="/sell" className="text-zinc-400 hover:text-white transition-colors">
            {t.navbar.sell}
          </Link>
          <Link href="/my-deals" className="text-zinc-400 hover:text-white transition-colors">
            {t.navbar.myDeals}
          </Link>
          <Link href="/my-loans" className="text-zinc-400 hover:text-white transition-colors">
            {t.navbar.myLoans}
          </Link>
          <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors">
            Profile
          </Link>
          <Link href="/pool" className="text-zinc-400 hover:text-white transition-colors">
            {t.navbar.pool}
          </Link>
        </nav>

        {/* Right: lang toggle + connect */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="rounded-md border border-zinc-700 px-2 py-1 text-xs font-bold text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
          >
            {lang === "en" ? "PT" : "EN"}
          </button>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
        </div>
      </div>
    </header>
  );
}
