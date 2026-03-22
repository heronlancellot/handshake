"use client";

import Link from "next/link";
import { formatEther } from "viem";

type Props = {
  id: number;
  title: string;
  price: bigint;
  imageURI: string;
  seller: string;
};

export function ProductCard({ id, title, price, imageURI, seller }: Props) {
  const shortSeller = `${seller.slice(0, 6)}…${seller.slice(-4)}`;
  const imgSrc = imageURI.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${imageURI.slice(7)}`
    : imageURI || "/placeholder.png";

  return (
    <Link href={`/product/${id}`} className="group block rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-violet-600 transition-colors">
      <div className="aspect-square w-full overflow-hidden bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/400x400/1a1a2e/7C3AED?text=${encodeURIComponent(title)}`;
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{title}</h3>
        <p className="mt-1 text-xs text-zinc-500">by {shortSeller}</p>
        <p className="mt-2 text-violet-400 font-bold">
          {formatEther(price)} MON
        </p>
      </div>
    </Link>
  );
}
