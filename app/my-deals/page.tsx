"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import Link from "next/link";
import { useDealCount, useDeal, useConfirmDelivery, useCancelDeal } from "@/src/hooks/useMarketplace";
import { useLanguage } from "@/src/lib/i18n/context";

function DealCard({ dealId, address }: { dealId: number; address: string }) {
  const { t } = useLanguage();
  const { data, refetch } = useDeal(dealId);
  const { confirmDelivery, isPending: confirmPending, isSuccess: confirmSuccess } = useConfirmDelivery();
  const { cancelDeal, isPending: cancelPending, isSuccess: cancelSuccess } = useCancelDeal();

  const handledConfirm = useRef(false);
  const handledCancel = useRef(false);

  useEffect(() => {
    if (confirmSuccess && !handledConfirm.current) {
      handledConfirm.current = true;
      refetch();
    }
  }, [confirmSuccess, refetch]);

  useEffect(() => {
    if (cancelSuccess && !handledCancel.current) {
      handledCancel.current = true;
      refetch();
    }
  }, [cancelSuccess, refetch]);

  if (!data) return null;

  const [listingId, seller, buyer, amount, sellerConfirmed, buyerConfirmed, , completed, cancelled] = data as [
    bigint, string, string, bigint, boolean, boolean, bigint, boolean, boolean
  ];

  const isSeller = (seller as string).toLowerCase() === address.toLowerCase();
  const isBuyer = (buyer as string).toLowerCase() === address.toLowerCase();

  if (!isSeller && !isBuyer) return null;

  // Seller: cancelled deals disappear from their list entirely
  if (cancelled && isSeller) return null;

  const role = isSeller ? t.myDeals.asSeller : t.myDeals.asBuyer;
  const myConfirmed = isSeller ? sellerConfirmed : buyerConfirmed;

  const statusLabel = completed
    ? t.myDeals.status.completed
    : cancelled
    ? t.myDeals.status.cancelled
    : t.myDeals.status.active;

  const statusColor = completed
    ? "text-emerald-400 bg-emerald-900/30 border-emerald-800"
    : cancelled
    ? "text-zinc-500 bg-zinc-800 border-zinc-700"
    : "text-violet-400 bg-violet-900/30 border-violet-800";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/product/${listingId?.toString()}`} className="text-sm font-semibold text-white hover:text-violet-400 transition-colors">
            {t.myDeals.listing}{listingId?.toString()} — {t.myDeals.deal}{dealId}
          </Link>
          <p className="text-xs text-zinc-500 mt-0.5">{role}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <p className="text-violet-400 font-bold text-base">{formatEther(amount as bigint)} {t.common.mon}</p>

      {cancelled && isBuyer && (
        <p className="text-sm text-zinc-400">{t.deal.cancelled}</p>
      )}

      {!cancelled && (
        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
          <span>{t.deal.sellerConfirmed}: <span className={sellerConfirmed ? "text-emerald-400" : "text-zinc-600"}>{sellerConfirmed ? t.deal.yes : t.deal.no}</span></span>
          <span>{t.deal.buyerConfirmed}: <span className={buyerConfirmed ? "text-emerald-400" : "text-zinc-600"}>{buyerConfirmed ? t.deal.yes : t.deal.no}</span></span>
        </div>
      )}

      {!completed && !cancelled && (
        <div className="flex flex-col gap-2 pt-1">
          {!myConfirmed && (
            <button
              onClick={() => { handledConfirm.current = false; confirmDelivery(dealId); }}
              disabled={confirmPending}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {confirmPending ? t.deal.confirming : t.deal.confirmDelivery}
            </button>
          )}
          <button
            onClick={() => { handledCancel.current = false; cancelDeal(dealId); }}
            disabled={cancelPending}
            className="w-full rounded-xl border border-red-800 py-3 text-sm font-semibold text-red-400 hover:bg-red-900/30 disabled:opacity-50 transition-colors"
          >
            {cancelPending ? t.deal.cancelling : t.deal.cancelDeal}
          </button>
        </div>
      )}
    </div>
  );
}

function DealsList({ total, address }: { total: number; address: string }) {
  const ids = Array.from({ length: total }, (_, i) => total - i);
  return (
    <div className="space-y-4">
      {ids.map((id) => (
        <DealCard key={id} dealId={id} address={address} />
      ))}
    </div>
  );
}

export default function MyDealsPage() {
  const { t } = useLanguage();
  const { address, isConnected } = useAccount();
  const { data: dealCount, isLoading } = useDealCount();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <h2 className="text-xl font-semibold text-zinc-300 mb-6">{t.myDeals.connectPrompt}</h2>
        <ConnectButton />
      </div>
    );
  }

  const total = dealCount ? Number(dealCount) : 0;

  return (
    <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-10">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-white">{t.myDeals.title}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t.myDeals.subtitle}</p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-zinc-800 bg-zinc-900 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && total === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p>{t.myDeals.noDeals}</p>
          <Link href="/" className="mt-4 inline-block text-violet-400 hover:text-violet-300 text-sm">
            {t.common.browseListings}
          </Link>
        </div>
      )}

      {!isLoading && total > 0 && address && (
        <DealsList total={total} address={address} />
      )}
    </div>
  );
}
