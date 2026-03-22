"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import Link from "next/link";
import { toast } from "sonner";
import { useIPFSImage } from "@/src/hooks/useIPFSImage";
import { parseContractError } from "@/src/lib/errors";
import {
  useListing,
  useDeal,
  useListingActiveDeal,
  useOfferCount,
  useOffer,
  useMakeOffer,
  useMakeFinancedOffer,
  useAcceptOffer,
  useConfirmDelivery,
  useCancelDeal,
  useUserHasActiveOffer,
} from "@/src/hooks/useMarketplace";
import { useBorrowingPower } from "@/src/hooks/useLendingPool";
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

function OffersList({
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

function DealPanel({
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
    // Seller: nothing to show — deal cancelled by one of the parties
    if (isSeller) return null;
    // Buyer: inform they were refunded
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

export default function ProductPage() {
  const { t } = useLanguage();
  const params = useParams();
  const id = Number(params.id);
  const { address, isConnected } = useAccount();

  const {
    data: listingData,
    isLoading,
    refetch: refetchListing,
  } = useListing(id);
  const { data: activeDealId, refetch: refetchActiveDeal } =
    useListingActiveDeal(id);
  const { data: offerCount, refetch: refetchOfferCount } = useOfferCount(id);
  const rawImageURI = listingData ? (listingData[6] as string) : "";
  const imgSrc = useIPFSImage(rawImageURI);
  const {
    makeOffer,
    isPending: offerPending,
    isSuccess: offerSuccess,
    error: offerError,
  } = useMakeOffer();
  const {
    makeFinancedOffer,
    isPending: financedPending,
    isSuccess: financedSuccess,
    error: financedError,
  } = useMakeFinancedOffer();
  const {
    acceptOffer,
    isPending: acceptPending,
    isSuccess: acceptSuccess,
  } = useAcceptOffer();
  const { data: borrowingPowerData } = useBorrowingPower(address);
  const hasActiveOffer = useUserHasActiveOffer(
    id,
    offerCount ? Number(offerCount) : 0,
    address,
  );

  const [offerAmount, setOfferAmount] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [showFinanced, setShowFinanced] = useState(false);

  // Track handled txs to avoid double-firing
  const handledOffer = useRef(false);
  const handledFinanced = useRef(false);
  const handledAccept = useRef(false);

  useEffect(() => {
    if (offerSuccess && !handledOffer.current) {
      handledOffer.current = true;
      toast.success(t.product.offerSent);
      refetchOfferCount();
      refetchListing();
    }
  }, [offerSuccess, t, refetchOfferCount, refetchListing]);

  useEffect(() => {
    if (offerError) toast.error(parseContractError(offerError, t));
  }, [offerError, t]);

  useEffect(() => {
    if (financedSuccess && !handledFinanced.current) {
      handledFinanced.current = true;
      toast.success(t.product.financedOfferSent, { duration: 6000 });
      refetchOfferCount();
      refetchListing();
    }
  }, [financedSuccess, t, refetchOfferCount, refetchListing]);

  useEffect(() => {
    if (!financedError) return;
    toast.error(parseContractError(financedError, t), {
      description: financedError.message.includes("borrowing power")
        ? t.errors.insufficientBorrowingPower
        : undefined,
      action: financedError.message.includes("borrowing power")
        ? {
            label: t.pool.depositTitle,
            onClick: () => (window.location.href = "/pool"),
          }
        : undefined,
      duration: 8000,
    });
  }, [financedError, t]);

  useEffect(() => {
    if (acceptSuccess && !handledAccept.current) {
      handledAccept.current = true;
      toast.success(t.product.acceptingOffer);
      refetchListing();
      refetchOfferCount();
      refetchActiveDeal();
    }
  }, [acceptSuccess, t, refetchListing, refetchOfferCount, refetchActiveDeal]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-zinc-500 text-center">
        {t.common.loading}
      </div>
    );
  }

  if (!listingData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-zinc-500 text-center">
        {t.errors.listingNotActive}
      </div>
    );
  }

  const [tokenId, seller, price, title, description, contact, , active] =
    listingData as [
      bigint,
      string,
      bigint,
      string,
      string,
      string,
      string,
      boolean,
    ];

  const isSeller = address?.toLowerCase() === (seller as string).toLowerCase();
  const dealId = activeDealId ? Number(activeDealId) : 0;

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-4 py-4 sm:py-10">
      <div className="grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-2">
        {/* Image — max 60vw on mobile so details show above fold */}
        <div className="aspect-square w-full max-w-[72vw] mx-auto md:max-w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt={title as string}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://placehold.co/600x600/1a1a2e/7C3AED?text=${encodeURIComponent(title as string)}`;
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-600 text-6xl">
              &#9670;
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <span className="text-xs font-medium text-violet-400 uppercase tracking-wide">
              {t.product.token}
              {tokenId?.toString()}
            </span>
            <h1 className="mt-1 text-xl sm:text-2xl font-bold text-white">
              {title as string}
            </h1>
          </div>

          <p className="text-2xl sm:text-3xl font-bold text-violet-400">
            {formatEther(price as bigint)} MON
          </p>

          {description && (
            <p className="text-zinc-400 text-sm leading-relaxed">
              {description as string}
            </p>
          )}

          {contact && (
            <p className="text-sm text-zinc-500">
              {t.product.contact}:{" "}
              <span className="text-zinc-300">{contact as string}</span>
            </p>
          )}

          <p className="text-xs text-zinc-600 font-mono">
            {t.product.seller}: {(seller as string).slice(0, 10)}…
            {(seller as string).slice(-8)}
          </p>

          {/* Active deal panel */}
          {dealId > 0 && address && (
            <DealPanel
              dealId={dealId}
              address={address}
              onMutate={() => {
                refetchListing();
                refetchActiveDeal();
              }}
            />
          )}

          {/* Offers section — only if listing is active */}
          {active && !isSeller && (
            <div className="space-y-3 pt-2">
              {!isConnected ? (
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              ) : hasActiveOffer ? (
                <div className="rounded-xl border border-emerald-800 bg-emerald-900/10 p-4 space-y-1">
                  <p className="text-sm font-semibold text-emerald-400">
                    {t.product.offerAlreadySent}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {t.product.offerAlreadySentDesc}
                  </p>
                </div>
              ) : (
                <>
                  {/* Tab toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFinanced(false)}
                      className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors ${!showFinanced ? "bg-violet-600 text-white" : "border border-zinc-700 text-zinc-400 hover:text-white"}`}
                    >
                      {t.product.payInFull}
                    </button>
                    <button
                      onClick={() => setShowFinanced(true)}
                      className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors ${showFinanced ? "bg-violet-600 text-white" : "border border-zinc-700 text-zinc-400 hover:text-white"}`}
                    >
                      {t.product.buyWithCredit}
                    </button>
                  </div>

                  {!showFinanced ? (
                    offerSuccess ? (
                      <p className="text-emerald-400 text-sm font-medium">
                        {t.product.offerSent}
                      </p>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={offerAmount}
                            onChange={(e) => setOfferAmount(e.target.value)}
                            placeholder={`${t.product.offerPlaceholder} ${formatEther(price as bigint)}`}
                            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none text-base"
                          />
                          <button
                            onClick={() => {
                              handledOffer.current = false;
                              makeOffer(id, offerAmount);
                            }}
                            disabled={offerPending || !offerAmount}
                            className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors whitespace-nowrap"
                          >
                            {offerPending
                              ? t.product.sendingOffer
                              : t.product.makeOffer}
                          </button>
                        </div>
                        {offerError && (
                          <p className="text-xs text-red-400">
                            {offerError.message.split("\n")[0]}
                          </p>
                        )}
                      </>
                    )
                  ) : financedSuccess ? (
                    <p className="text-emerald-400 text-sm font-medium">
                      {t.product.financedOfferSent}
                    </p>
                  ) : (
                    <>
                      {(() => {
                        const bp = borrowingPowerData
                          ? (borrowingPowerData as bigint)
                          : 0n;
                        const itemPrice = price as bigint;
                        const downVal = downPayment
                          ? BigInt(Math.floor(Number(downPayment) * 1e18))
                          : 0n;
                        const toLoan =
                          downVal >= itemPrice ? 0n : itemPrice - downVal;
                        const minDown = bp >= itemPrice ? 0n : itemPrice - bp;
                        const canAfford = bp >= toLoan;

                        return (
                          <div className="space-y-2">
                            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-500">
                                  {t.product.itemPrice}
                                </span>
                                <span className="text-white font-bold">
                                  {Number(formatEther(itemPrice)).toFixed(4)}{" "}
                                  MON
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-500">
                                  {t.product.yourBorrowingPower}
                                </span>
                                <span className="text-violet-400 font-bold">
                                  {Number(formatEther(bp)).toFixed(4)} MON
                                </span>
                              </div>
                              <div className="border-t border-zinc-800 pt-2 flex items-center justify-between">
                                <span className="text-zinc-400 font-medium">
                                  {t.product.minDownNeeded}
                                </span>
                                <span
                                  className={`font-bold ${minDown === 0n ? "text-emerald-400" : "text-yellow-400"}`}
                                >
                                  {minDown === 0n
                                    ? t.product.noneFullyCovered
                                    : `${Number(formatEther(minDown)).toFixed(4)} MON`}
                                </span>
                              </div>
                              {downVal > 0n && (
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-500">
                                    {t.product.poolWillLend}
                                  </span>
                                  <span className="text-zinc-300 font-medium">
                                    {Number(formatEther(toLoan)).toFixed(4)} MON
                                  </span>
                                </div>
                              )}
                            </div>

                            {!canAfford && (
                              <p className="text-xs text-red-400">
                                {t.product.insufficientPower}{" "}
                                <Link
                                  href="/pool"
                                  className="underline hover:text-red-300"
                                >
                                  {t.product.depositMore}
                                </Link>
                              </p>
                            )}
                          </div>
                        );
                      })()}
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={downPayment}
                          onChange={(e) => setDownPayment(e.target.value)}
                          placeholder={t.product.downPaymentPlaceholder}
                          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            handledFinanced.current = false;
                            makeFinancedOffer(id, downPayment || "0");
                          }}
                          disabled={
                            financedPending ||
                            (() => {
                              const bp = borrowingPowerData
                                ? (borrowingPowerData as bigint)
                                : 0n;
                              const downVal = downPayment
                                ? BigInt(Math.floor(Number(downPayment) * 1e18))
                                : 0n;
                              const toLoan =
                                downVal >= (price as bigint)
                                  ? 0n
                                  : (price as bigint) - downVal;
                              return bp < toLoan;
                            })()
                          }
                          className="rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                          {financedPending
                            ? t.product.financing
                            : t.product.finance}
                        </button>
                      </div>
                      {financedError && (
                        <p className="text-xs text-red-400">
                          {financedError.message.split("\n")[0]}
                        </p>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Seller: see and accept offers */}
          {active && isSeller && (
            <div className="space-y-3 pt-2">
              <h3 className="font-semibold text-zinc-300">
                {t.product.receivedOffers}
                {Number(offerCount) > 0 && (
                  <span className="ml-2 rounded-full bg-violet-600 px-2 py-0.5 text-xs text-white">
                    {" " + Number(offerCount)}
                  </span>
                )}
              </h3>
              <OffersList
                key={String(offerCount)}
                listingId={id}
                isSeller={true}
                onAccept={(offerId) => {
                  handledAccept.current = false;
                  acceptOffer(id, offerId);
                }}
              />
              {acceptPending && (
                <p className="text-sm text-violet-400">
                  {t.product.acceptingOffer}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
