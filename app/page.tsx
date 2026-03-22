"use client";

import { useTotalListings, useListing } from "@/src/hooks/useMarketplace";
import { ProductCard } from "@/src/components/ProductCard";

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
    return (
      <div className="aspect-square rounded-xl border border-zinc-800 bg-zinc-900 animate-pulse" />
    );
  }

  if (!data || !data[7]) return null; // not active

  const [tokenId, seller, price, title, , , imageURI, active] = data as [
    bigint, string, bigint, string, string, string, string, boolean
  ];

  if (!active) return null;

  return (
    <ProductCard
      id={id}
      title={title}
      price={price}
      imageURI={imageURI}
      seller={seller}
    />
  );
}

export default function HomePage() {
  const { data: total, isLoading } = useTotalListings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Explore Listings
        </h1>
        <p className="mt-2 text-zinc-400">
          Buy and sell physical goods on Monad — payments in escrow, released on confirmation.
        </p>
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
          <p className="text-lg">No listings yet.</p>
          <a href="/sell" className="mt-4 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
            Be the first to sell
          </a>
        </div>
      )}

      {!isLoading && total && total > 0n && (
        <ListingGrid total={Number(total)} />
      )}
    </div>
  );
}
