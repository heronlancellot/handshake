"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import {
  useListing,
  useDeal,
  useListingActiveDeal,
  useOfferCount,
  useOffer,
  useMakeOffer,
  useAcceptOffer,
  useConfirmDelivery,
  useCancelDeal,
} from "@/src/hooks/useMarketplace";

function OfferRow({ listingId, offerId, isSeller, onAccept }: {
  listingId: number;
  offerId: number;
  isSeller: boolean;
  onAccept: (offerId: number) => void;
}) {
  const { data } = useOffer(listingId, offerId);
  if (!data) return null;
  const [, buyer, amount, active] = data as [bigint, string, bigint, boolean, boolean];
  if (!active) return null;

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
      <div>
        <p className="text-sm text-zinc-300 font-mono">{(buyer as string).slice(0, 8)}…{(buyer as string).slice(-6)}</p>
        <p className="text-violet-400 font-bold">{formatEther(amount as bigint)} MON</p>
      </div>
      {isSeller && (
        <button
          onClick={() => onAccept(offerId)}
          className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
        >
          Accept
        </button>
      )}
    </div>
  );
}

function OffersList({ listingId, isSeller, onAccept }: {
  listingId: number;
  isSeller: boolean;
  onAccept: (offerId: number) => void;
}) {
  const { data: count } = useOfferCount(listingId);
  const total = count ? Number(count) : 0;
  if (total === 0) return <p className="text-zinc-500 text-sm">No offers yet.</p>;

  return (
    <div className="space-y-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((id) => (
        <OfferRow key={id} listingId={listingId} offerId={id} isSeller={isSeller} onAccept={onAccept} />
      ))}
    </div>
  );
}

function DealPanel({ dealId, address }: { dealId: number; address: string }) {
  const { data, refetch } = useDeal(dealId);
  const { confirmDelivery, isPending: confirmPending, isSuccess: confirmSuccess } = useConfirmDelivery();
  const { cancelDeal, isPending: cancelPending } = useCancelDeal();

  if (!data) return null;
  const [listingId, seller, buyer, amount, sellerConfirmed, buyerConfirmed, , completed, cancelled] = data as [
    bigint, string, string, bigint, boolean, boolean, bigint, boolean, boolean
  ];

  if (completed) {
    return (
      <div className="rounded-xl border border-emerald-700 bg-emerald-900/20 p-5">
        <p className="font-semibold text-emerald-400">Deal completed!</p>
        <p className="text-sm text-zinc-400 mt-1">The item was handed over and payment released.</p>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
        <p className="font-semibold text-zinc-400">Deal cancelled — buyer was refunded.</p>
      </div>
    );
  }

  const isSeller = (seller as string).toLowerCase() === address.toLowerCase();
  const isBuyer = (buyer as string).toLowerCase() === address.toLowerCase();
  const myConfirmed = isSeller ? sellerConfirmed : buyerConfirmed;

  return (
    <div className="rounded-xl border border-violet-700 bg-violet-900/10 p-5 space-y-3">
      <p className="font-semibold text-violet-300">Active Deal #{dealId}</p>
      <div className="text-sm text-zinc-400 space-y-1">
        <p>Escrow: <span className="text-white font-bold">{formatEther(amount as bigint)} MON</span></p>
        <p>Seller confirmed: <span className={sellerConfirmed ? "text-emerald-400" : "text-zinc-500"}>{sellerConfirmed ? "Yes" : "No"}</span></p>
        <p>Buyer confirmed: <span className={buyerConfirmed ? "text-emerald-400" : "text-zinc-500"}>{buyerConfirmed ? "Yes" : "No"}</span></p>
      </div>
      {(isSeller || isBuyer) && !myConfirmed && (
        <button
          onClick={() => confirmDelivery(dealId)}
          disabled={confirmPending}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
        >
          {confirmPending ? "Confirming..." : "Confirm Delivery"}
        </button>
      )}
      {(isSeller || isBuyer) && (
        <button
          onClick={() => cancelDeal(dealId)}
          disabled={cancelPending}
          className="w-full rounded-lg border border-red-700 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-900/30 disabled:opacity-50 transition-colors"
        >
          {cancelPending ? "Cancelling..." : "Cancel Deal"}
        </button>
      )}
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const id = Number(params.id);
  const { address, isConnected } = useAccount();

  const { data: listingData, isLoading } = useListing(id);
  const { data: activeDealId } = useListingActiveDeal(id);
  const { makeOffer, isPending: offerPending, isSuccess: offerSuccess, error: offerError } = useMakeOffer();
  const { acceptOffer, isPending: acceptPending } = useAcceptOffer();

  const [offerAmount, setOfferAmount] = useState("");

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-zinc-500 text-center">Loading…</div>;
  }

  if (!listingData) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-zinc-500 text-center">Listing not found.</div>;
  }

  const [tokenId, seller, price, title, description, contact, imageURI, active] = listingData as [
    bigint, string, bigint, string, string, string, string, boolean
  ];

  const isSeller = address?.toLowerCase() === (seller as string).toLowerCase();
  const dealId = activeDealId ? Number(activeDealId) : 0;
  const imgSrc = (imageURI as string).startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${(imageURI as string).slice(7)}`
    : (imageURI as string) || "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt={title as string}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/600x600/1a1a2e/7C3AED?text=${encodeURIComponent(title as string)}`;
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-600 text-6xl">&#9670;</div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-medium text-violet-400 uppercase tracking-wide">Token #{tokenId?.toString()}</span>
            <h1 className="mt-1 text-2xl font-bold text-white">{title as string}</h1>
          </div>

          <p className="text-3xl font-bold text-violet-400">{formatEther(price as bigint)} MON</p>

          {description && (
            <p className="text-zinc-400 text-sm leading-relaxed">{description as string}</p>
          )}

          {contact && (
            <p className="text-sm text-zinc-500">Contact: <span className="text-zinc-300">{contact as string}</span></p>
          )}

          <p className="text-xs text-zinc-600 font-mono">
            Seller: {(seller as string).slice(0, 10)}…{(seller as string).slice(-8)}
          </p>

          {/* Active deal panel */}
          {dealId > 0 && address && (
            <DealPanel dealId={dealId} address={address} />
          )}

          {/* Offers section — only if listing is active */}
          {active && !isSeller && (
            <div className="space-y-3 pt-2">
              {!isConnected ? (
                <ConnectButton />
              ) : offerSuccess ? (
                <p className="text-emerald-400 text-sm font-medium">Offer submitted! Waiting for seller to accept.</p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder={`e.g. ${formatEther(price as bigint)}`}
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                    />
                    <button
                      onClick={() => makeOffer(id, offerAmount)}
                      disabled={offerPending || !offerAmount}
                      className="rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                      {offerPending ? "Sending…" : "Make Offer"}
                    </button>
                  </div>
                  {offerError && (
                    <p className="text-xs text-red-400">{offerError.message.split("\n")[0]}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Seller: see and accept offers */}
          {active && isSeller && (
            <div className="space-y-3 pt-2">
              <h3 className="font-semibold text-zinc-300">Received Offers</h3>
              <OffersList
                listingId={id}
                isSeller={true}
                onAccept={(offerId) => acceptOffer(id, offerId)}
              />
              {acceptPending && <p className="text-sm text-violet-400">Accepting offer…</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
