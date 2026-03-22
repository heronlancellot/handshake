"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import Link from "next/link";
import { useDealCount, useDeal, useConfirmDelivery, useCancelDeal } from "@/src/hooks/useMarketplace";

function DealCard({ dealId, address }: { dealId: number; address: string }) {
  const { data } = useDeal(dealId);
  const { confirmDelivery, isPending: confirmPending } = useConfirmDelivery();
  const { cancelDeal, isPending: cancelPending } = useCancelDeal();

  if (!data) return null;

  const [listingId, seller, buyer, amount, sellerConfirmed, buyerConfirmed, , completed, cancelled] = data as [
    bigint, string, string, bigint, boolean, boolean, bigint, boolean, boolean
  ];

  const isSeller = (seller as string).toLowerCase() === address.toLowerCase();
  const isBuyer = (buyer as string).toLowerCase() === address.toLowerCase();

  if (!isSeller && !isBuyer) return null;

  const role = isSeller ? "Seller" : "Buyer";
  const myConfirmed = isSeller ? sellerConfirmed : buyerConfirmed;

  const statusLabel = completed
    ? "Completed"
    : cancelled
    ? "Cancelled"
    : "In Progress";

  const statusColor = completed
    ? "text-emerald-400 bg-emerald-900/30 border-emerald-800"
    : cancelled
    ? "text-zinc-500 bg-zinc-800 border-zinc-700"
    : "text-violet-400 bg-violet-900/30 border-violet-800";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/product/${listingId?.toString()}`} className="text-sm font-semibold text-white hover:text-violet-400 transition-colors">
            Listing #{listingId?.toString()} — Deal #{dealId}
          </Link>
          <p className="text-xs text-zinc-500 mt-0.5">Your role: <span className="text-zinc-300">{role}</span></p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <p className="text-violet-400 font-bold">{formatEther(amount as bigint)} MON in escrow</p>

      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
        <span>Seller confirmed: <span className={sellerConfirmed ? "text-emerald-400" : "text-zinc-600"}>{sellerConfirmed ? "Yes" : "No"}</span></span>
        <span>Buyer confirmed: <span className={buyerConfirmed ? "text-emerald-400" : "text-zinc-600"}>{buyerConfirmed ? "Yes" : "No"}</span></span>
      </div>

      {!completed && !cancelled && (
        <div className="flex gap-2 pt-1">
          {!myConfirmed && (
            <button
              onClick={() => confirmDelivery(dealId)}
              disabled={confirmPending}
              className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {confirmPending ? "Confirming…" : "Confirm Delivery"}
            </button>
          )}
          <button
            onClick={() => cancelDeal(dealId)}
            disabled={cancelPending}
            className="flex-1 rounded-lg border border-red-800 py-2 text-sm font-semibold text-red-400 hover:bg-red-900/30 disabled:opacity-50 transition-colors"
          >
            {cancelPending ? "Cancelling…" : "Cancel"}
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
  const { address, isConnected } = useAccount();
  const { data: dealCount, isLoading } = useDealCount();

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h2 className="text-xl font-semibold text-zinc-300 mb-6">Connect your wallet to see your deals</h2>
        <ConnectButton />
      </div>
    );
  }

  const total = dealCount ? Number(dealCount) : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">My Deals</h1>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-zinc-800 bg-zinc-900 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && total === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p>No deals yet.</p>
          <Link href="/" className="mt-4 inline-block text-violet-400 hover:text-violet-300 text-sm">
            Browse listings
          </Link>
        </div>
      )}

      {!isLoading && total > 0 && address && (
        <DealsList total={total} address={address} />
      )}
    </div>
  );
}
