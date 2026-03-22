"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTotalListings, useListing } from "@/src/hooks/useMarketplace";
import { ProductCard } from "@/src/components/ProductCard";
import { useLanguage } from "@/src/lib/i18n/context";

function ListingGrid({ total }: { total: number }) {
  const ids = Array.from({ length: total }, (_, i) => total - i);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {ids.map((id) => (
        <ListingItem key={id} id={id} />
      ))}
    </div>
  );
}

function ListingItem({ id }: { id: number }) {
  const { data, isLoading } = useListing(id);

  if (isLoading) {
    return <div className="aspect-square rounded-xl border border-zinc-800 bg-zinc-900 animate-pulse" />;
  }

  if (!data) return null;

  const [, seller, price, title, , , imageURI, active] = data as [
    bigint, string, bigint, string, string, string, string, boolean
  ];

  return (
    <ProductCard
      id={id}
      title={title}
      price={price}
      imageURI={imageURI}
      seller={seller}
      active={active}
    />
  );
}

export default function HomePage() {
  const { t } = useLanguage();
  const { isConnected } = useAccount();
  const { data: total, isLoading } = useTotalListings();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <h1 className="text-3xl font-extrabold text-white mb-2">{t.explore.title}</h1>
        <p className="text-zinc-400 font-bold mb-8 max-w-sm">{t.sell.subtitle}</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            {t.explore.title}
          </h1>
          <p className="mt-2 text-zinc-400 font-bold">
            {t.sell.subtitle}
          </p>
        </div>
        <Link
          href="/sell"
          className="flex-shrink-0 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold text-zinc-950 transition-opacity hover:opacity-80"
          style={{ background: "#F5E033" }}
        >
          <span className="text-lg leading-none">+</span>
          <span className="hidden sm:inline">{t.navbar.sell}</span>
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl border border-zinc-800 bg-zinc-900 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && (!total || total === 0n) && (
        <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
          <p className="text-lg font-extrabold">{t.explore.noListings}</p>
          <Link
            href="/sell"
            className="mt-4 rounded-lg px-5 py-2 text-sm font-extrabold text-zinc-950 transition-colors"
            style={{ background: "#F5E033" }}
          >
            {t.sell.submit}
          </Link>
        </div>
      )}

      {!isLoading && total && total > 0n && (
        <ListingGrid total={Number(total)} />
      )}
    </div>
  );
}
