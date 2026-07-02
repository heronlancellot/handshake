"use client";

import { useEffect, useRef } from "react";
import { formatEther } from "viem";
import { useDeal, useConfirmDelivery, useCancelDeal } from "@/src/hooks/useMarketplace";
import { useLanguage } from "@/src/lib/i18n/context";

export function DealPanel({
  dealId,
  address,
  onMutate,
}: {
  dealId: number;
  address: string;
  onMutate: () => void;
}) {
  const { t } = useLanguage();
  const { data, refetch } = useDeal(dealId);
  const {
    confirmDelivery,
    isPending: confirmPending,
    isSuccess: confirmSuccess,
  } = useConfirmDelivery();
  const {
    cancelDeal,
    isPending: cancelPending,
    isSuccess: cancelSuccess,
  } = useCancelDeal();

  const handledConfirm = useRef(false);
  const handledCancel = useRef(false);

  useEffect(() => {
    if (confirmSuccess && !handledConfirm.current) {
      handledConfirm.current = true;
      refetch();
      onMutate();
    }
  }, [confirmSuccess, refetch, onMutate]);

  useEffect(() => {
    if (cancelSuccess && !handledCancel.current) {
      handledCancel.current = true;
      refetch();
      onMutate();
    }
  }, [cancelSuccess, refetch, onMutate]);

  if (!data) return null;
  const [
    ,
    seller,
    buyer,
    amount,
    sellerConfirmed,
    buyerConfirmed,
    ,
    completed,
    cancelled,
  ] = data as [
    bigint,
    string,
    string,
    bigint,
    boolean,
    boolean,
    bigint,
    boolean,
    boolean,
  ];

  const isSeller = (seller as string).toLowerCase() === address.toLowerCase();
  const isBuyer = (buyer as string).toLowerCase() === address.toLowerCase();

  if (completed) {
    return (
      <div className="rounded-xl border border-emerald-700 bg-emerald-900/20 p-5">
        <p className="font-semibold text-emerald-400">{t.deal.completed}</p>
        <p className="text-sm text-zinc-400 mt-1">{t.deal.completedDesc}</p>
      </div>
    );
  }

  if (cancelled) {
    if (isSeller) return null;
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
        <p className="font-semibold text-zinc-400">{t.deal.cancelled}</p>
      </div>
    );
  }

  const myConfirmed = isSeller ? sellerConfirmed : buyerConfirmed;

  return (
    <div className="rounded-xl border border-violet-700 bg-violet-900/10 p-5 space-y-3">
      <p className="font-semibold text-violet-300">
        {t.deal.activeDeal}
        {dealId}
      </p>
      <div className="text-sm text-zinc-400 space-y-1">
        <p>
          {t.deal.escrow}:{" "}
          <span className="text-white font-bold">
            {formatEther(amount as bigint)} MON
          </span>
        </p>
        <p>
          {t.deal.sellerConfirmed}:{" "}
          <span
            className={sellerConfirmed ? "text-emerald-400" : "text-zinc-500"}
          >
            {sellerConfirmed ? t.deal.yes : t.deal.no}
          </span>
        </p>
        <p>
          {t.deal.buyerConfirmed}:{" "}
          <span
            className={buyerConfirmed ? "text-emerald-400" : "text-zinc-500"}
          >
            {buyerConfirmed ? t.deal.yes : t.deal.no}
          </span>
        </p>
      </div>
      {(isSeller || isBuyer) && !myConfirmed && (
        <button
          onClick={() => {
            handledConfirm.current = false;
            confirmDelivery(dealId);
          }}
          disabled={confirmPending}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
        >
          {confirmPending ? t.deal.confirming : t.deal.confirmDelivery}
        </button>
      )}
      {(isSeller || isBuyer) && (
        <button
          onClick={() => {
            handledCancel.current = false;
            cancelDeal(dealId);
          }}
          disabled={cancelPending}
          className="w-full rounded-lg border border-red-700 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-900/30 disabled:opacity-50 transition-colors"
        >
          {cancelPending ? t.deal.cancelling : t.deal.cancelDeal}
        </button>
      )}
    </div>
  );
}
