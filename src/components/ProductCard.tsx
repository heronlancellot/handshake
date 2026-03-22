"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { useIPFSImage } from "@/src/hooks/useIPFSImage";
import { useLanguage } from "@/src/lib/i18n/context";

type Props = {
  id: number;
  title: string;
  price: bigint;
  imageURI: string;
  seller: string;
  active: boolean;
};

export function ProductCard({ id, title, price, imageURI, seller, active }: Props) {
  const { t } = useLanguage();
  const shortSeller = `${seller.slice(0, 6)}…${seller.slice(-4)}`;
  const imgSrc = useIPFSImage(imageURI);

  return (
    <Link
      href={`/product/${id}`}
      className="group block rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden active:scale-95 transition-transform duration-100"
      style={{ WebkitTapHighlightColor: "transparent" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#7B6FD4")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://placehold.co/400x400/1a1a2e/7B6FD4?text=${encodeURIComponent(title)}`;
          }}
        />
        {!active && (
          <div
            className="absolute top-2 right-2 rounded-full px-2.5 py-1 text-xs font-extrabold shadow"
            style={{ background: "#F5E033", color: "#09090b" }}
          >
            {t.explore.inEscrow}
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-extrabold text-white truncate text-sm sm:text-base">{title}</h3>
        <p className="mt-0.5 text-xs text-zinc-500 truncate">by {shortSeller}</p>
        <p className="mt-2 font-extrabold text-sm sm:text-base" style={{ color: "#7B6FD4" }}>
          {formatEther(price)} {t.common.mon}
        </p>
      </div>
    </Link>
  );
}
