"use client";

import { formatEther } from "viem";
import { useOffer, useOfferCount } from "@/src/hooks/useMarketplace";
import { useLanguage } from "@/src/lib/i18n/context";

function OfferRow({
  listingId,
  offerId,
  isSeller,
  onAccept,
}: {
  listingId: number;
  offerId: number;
  isSeller: boolean;
  onAccept: (offerId: number) => void;
}) {
  const { t } = useLanguage();
  const { data } = useOffer(listingId, offerId);
  if (!data) return null;
  const [, buyer, amount, active] = data as [
    bigint,
    string,
    bigint,
    boolean,
    boolean,
  ];
  if (!active) return null;

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
      <div>
        <p className="text-sm text-zinc-300 font-mono">
          {(buyer as string).slice(0, 8)}…{(buyer as string).slice(-6)}
        </p>
        <p className="text-violet-400 font-bold">
          {formatEther(amount as bigint)} MON
        </p>
      </div>
      {isSeller && (
        <button
          onClick={() => onAccept(offerId)}
          className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
        >
          {t.product.accept}
        </button>
      )}
    </div>
  );
}

export function OffersList({
  listingId,
  isSeller,
  onAccept,
}: {
  listingId: number;
  isSeller: boolean;
  onAccept: (offerId: number) => void;
}) {
  const { t } = useLanguage();
  const { data: count } = useOfferCount(listingId);
  const total = count ? Number(count) : 0;
  if (total === 0)
    return <p className="text-zinc-500 text-sm">{t.product.noOffers}</p>;

  return (
    <div className="space-y-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((id) => (
        <OfferRow
          key={id}
          listingId={listingId}
          offerId={id}
          isSeller={isSeller}
          onAccept={onAccept}
        />
      ))}
    </div>
  );
}
