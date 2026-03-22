"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLanguage } from "@/src/lib/i18n/context";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const { t, lang, toggle } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t.navbar.explore },
    { href: "/my-deals", label: t.navbar.myDeals },
    { href: "/my-loans", label: t.navbar.myLoans },
    { href: "/profile", label: "Profile" },
    { href: "/pool", label: t.navbar.pool },
  ];

  const linkClass = (href: string) => {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `text-sm font-bold transition-colors ${
      isActive ? "text-white" : "text-zinc-400 hover:text-white"
    }`;
  };

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

        {/* Nav links — absolutely centered (desktop) */}
        <nav className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: lang toggle + connect + hamburger */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="rounded-md border border-zinc-700 px-2 py-1 text-xs font-bold text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
          >
            {lang === "en" ? "PT" : "EN"}
          </button>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
          {/* Hamburger — mobile only */}
          <button
            className="sm:hidden flex flex-col justify-center gap-1.5 p-1 ml-1"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            <span
              className="block h-0.5 w-5 bg-zinc-400 transition-all duration-200"
              style={{ transform: menuOpen ? "rotate(45deg) translateY(7px)" : undefined }}
            />
            <span
              className="block h-0.5 w-5 bg-zinc-400 transition-all duration-200"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block h-0.5 w-5 bg-zinc-400 transition-all duration-200"
              style={{ transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : undefined }}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/sell"
            className="mt-1 rounded-lg py-2.5 text-center text-sm font-extrabold text-zinc-950"
            style={{ background: "#F5E033" }}
            onClick={() => setMenuOpen(false)}
          >
            + {t.navbar.sell}
          </Link>
        </nav>
      )}
    </header>
  );
}
