"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLanguage } from "@/src/lib/i18n/context";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { t, lang, toggle } = useLanguage();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: t.navbar.explore },
    { href: "/my-deals", label: t.navbar.myDeals },
    { href: "/my-loans", label: t.navbar.myLoans },
    { href: "/profile", label: "Profile" },
    { href: "/pool", label: t.navbar.pool },
  ];

  const linkClass = (href: string) => {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `text-sm font-bold transition-colors ${isActive ? "text-white" : "text-zinc-400 hover:text-white"}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/Handshake.svg" alt="Handshake" width={32} height={32} priority />
          <span className="text-base font-extrabold" style={{ color: "#7B6FD4" }}>
            <span className="text-white">Hand</span>shake
          </span>
        </Link>

        {/* Desktop nav — hidden on mobile (BottomNav handles mobile) */}
        <nav className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
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
