"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/src/lib/contract";

export type Listing = {
  id: number;
  tokenId: bigint;
  seller: string;
  price: bigint;
  title: string;
  description: string;
  contact: string;
  imageURI: string;
  active: boolean;
};

export type Deal = {
  id: number;
  listingId: bigint;
  seller: string;
  buyer: string;
  amount: bigint;
  sellerConfirmed: boolean;
  buyerConfirmed: boolean;
  acceptedAt: bigint;
  completed: boolean;
  cancelled: boolean;
};

export type Offer = {
  id: number;
  listingId: bigint;
  buyer: string;
  amount: bigint;
  active: boolean;
  financed: boolean;
};

// -----------------------------------------------------------------------
// Reads
// -----------------------------------------------------------------------

export function useTotalListings() {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "totalListings",
  });
}

export function useListing(listingId: number) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "listings",
    args: [BigInt(listingId)],
    query: { enabled: listingId > 0 },
  });
}

export function useDeal(dealId: number) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "deals",
    args: [BigInt(dealId)],
    query: { enabled: dealId > 0 },
  });
}

export function useDealCount() {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "dealCount",
  });
}

export function useOfferCount(listingId: number) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "offerCounts",
    args: [BigInt(listingId)],
    query: { enabled: listingId > 0 },
  });
}

export function useOffer(listingId: number, offerId: number) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "offers",
    args: [BigInt(listingId), BigInt(offerId)],
    query: { enabled: listingId > 0 && offerId > 0 },
  });
}

export function useListingActiveDeal(listingId: number) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "listingActiveDeal",
    args: [BigInt(listingId)],
    query: { enabled: listingId > 0 },
  });
}

// -----------------------------------------------------------------------
// Writes
// -----------------------------------------------------------------------

export function useListItem() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const listItem = (price: string, title: string, description: string, contact: string, imageURI: string) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "listItem",
      args: [parseEther(price), title, description, contact, imageURI],
    });
  };

  return { listItem, isPending: isPending || isConfirming, isSuccess, error, hash };
}

export function useMakeOffer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const makeOffer = (listingId: number, amountEth: string) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "makeOffer",
      args: [BigInt(listingId)],
      value: parseEther(amountEth),
    });
  };

  return { makeOffer, isPending: isPending || isConfirming, isSuccess, error, hash };
}

export function useMakeFinancedOffer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const makeFinancedOffer = (listingId: number, downPaymentEth: string) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "makeFinancedOffer",
      args: [BigInt(listingId)],
      value: parseEther(downPaymentEth),
    });
  };

  return { makeFinancedOffer, isPending: isPending || isConfirming, isSuccess, error, hash };
}

export function useAcceptOffer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const acceptOffer = (listingId: number, offerId: number) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "acceptOffer",
      args: [BigInt(listingId), BigInt(offerId)],
    });
  };

  return { acceptOffer, isPending: isPending || isConfirming, isSuccess, error, hash };
}

export function useConfirmDelivery() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const confirmDelivery = (dealId: number) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "confirmDelivery",
      args: [BigInt(dealId)],
    });
  };

  return { confirmDelivery, isPending: isPending || isConfirming, isSuccess, error, hash };
}

export function useCancelDeal() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const cancelDeal = (dealId: number) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "cancelDeal",
      args: [BigInt(dealId)],
    });
  };

  return { cancelDeal, isPending: isPending || isConfirming, isSuccess, error, hash };
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

export { formatEther, parseEther };
