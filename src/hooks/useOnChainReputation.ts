"use client";

import { useBalance, useReadContracts, usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/src/lib/contract";
import { useTotalListings, useDealCount } from "./useMarketplace";
import { useMyCollateral } from "./useLendingPool";

export type ReputationTier = "Bronze" | "Silver" | "Gold" | "Diamond";
export type AgeBadge = "Newcomer" | "Regular" | "Veteran" | "OG" | null;

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

export type OwnedNFT = {
  listingId: number;
  tokenId: bigint;
  title: string;
  imageURI: string;
  price: bigint;
  originalSeller: string;
  acquired: boolean; // true = received via deal, false = minted by self
};

export type ReputationStats = {
  txCount: number;
  balanceMON: string;
  accountAgeDays: number | null;
  totalListings: number;
  completedDeals: number;
  totalDeals: number;
  dealsAsSeller: number;
  dealsAsBuyer: number;
  usedBNPL: boolean;
  isLP: boolean;
};

function computeTier(stats: ReputationStats): ReputationTier {
  if (stats.txCount >= 200 && stats.completedDeals >= 10) return "Diamond";
  if (stats.txCount >= 50 && stats.completedDeals >= 3) return "Gold";
  if (stats.txCount >= 10 || stats.completedDeals >= 1) return "Silver";
  return "Bronze";
}

export function computeAgeBadge(days: number | null): AgeBadge {
  if (days === null) return null;
  if (days >= 180) return "OG";
  if (days >= 30) return "Veteran";
  if (days >= 7) return "Regular";
  return "Newcomer";
}

function computeBadges(stats: ReputationStats): Badge[] {
  return [
    {
      id: "first_listing",
      name: "First Listing",
      description: "Listed your first item for sale",
      icon: "🏷️",
      unlocked: stats.totalListings >= 1,
    },
    {
      id: "market_maker",
      name: "Market Maker",
      description: "Listed 5 or more items",
      icon: "🛒",
      unlocked: stats.totalListings >= 5,
    },
    {
      id: "buyer",
      name: "Buyer",
      description: "Completed a deal as buyer",
      icon: "🤝",
      unlocked: stats.dealsAsBuyer >= 1,
    },
    {
      id: "dealmaker",
      name: "Dealmaker",
      description: "Closed 5 or more deals total",
      icon: "⚡",
      unlocked: stats.completedDeals >= 5,
    },
    {
      id: "active_trader",
      name: "Active Trader",
      description: "Sent 10+ transactions on Monad",
      icon: "📈",
      unlocked: stats.txCount >= 10,
    },
    {
      id: "power_user",
      name: "Power User",
      description: "Sent 100+ transactions on Monad",
      icon: "🔥",
      unlocked: stats.txCount >= 100,
    },
    {
      id: "bnpl_pioneer",
      name: "BNPL Pioneer",
      description: "Used Buy Now Pay Later financing",
      icon: "💳",
      unlocked: stats.usedBNPL,
    },
    {
      id: "lp_contributor",
      name: "LP Contributor",
      description: "Provided liquidity to the lending pool",
      icon: "💧",
      unlocked: stats.isLP,
    },
  ];
}

export function useOnChainReputation(address?: string) {
  const publicClient = usePublicClient();

  // MON balance
  const { data: balanceData } = useBalance({
    address: address as `0x${string}`,
    query: { enabled: !!address },
  });

  // Outgoing tx count (nonce)
  const { data: txCount } = useQuery({
    queryKey: ["txCount", address],
    queryFn: () =>
      publicClient!.getTransactionCount({ address: address as `0x${string}` }),
    enabled: !!address && !!publicClient,
  });

  // Account age — disabled (requires archive node or explorer API)
  // const { data: accountAgeData, isLoading: accountAgeLoading } = useQuery({
  //   queryKey: ["accountAge", address],
  //   queryFn: async () => {
  //     const res = await fetch(`/api/account-age?address=${address}`);
  //     const json = await res.json();
  //     return json.days !== null && json.days !== undefined ? (json.days as number) : -1;
  //   },
  //   enabled: !!address,
  //   staleTime: 5 * 60 * 1000,
  //   retry: false,
  // });

  // Total counts from marketplace
  const { data: totalListingsData } = useTotalListings();
  const { data: dealCountData } = useDealCount();

  const totalListingsCount = Number(totalListingsData ?? 0);
  const totalDealsCount = Number(dealCountData ?? 0);

  // Batch read all listings (multicall)
  const { data: allListingsData } = useReadContracts({
    contracts: Array.from({ length: totalListingsCount }, (_, i) => ({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "listings" as const,
      args: [BigInt(i + 1)] as const,
    })),
    query: { enabled: totalListingsCount > 0 && !!address },
  });

  // Batch read all deals (multicall)
  const { data: allDealsData } = useReadContracts({
    contracts: Array.from({ length: totalDealsCount }, (_, i) => ({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "deals" as const,
      args: [BigInt(i + 1)] as const,
    })),
    query: { enabled: totalDealsCount > 0 && !!address },
  });

  // Batch read ownerOf for all tokenIds (to find NFTs owned by user)
  // listings[0] = tokenId
  const tokenIds = (allListingsData ?? [])
    .map((r, i) => {
      if (!r || r.status !== "success") return null;
      return { listingId: i + 1, tokenId: (r.result as unknown as unknown[])[0] as bigint };
    })
    .filter(Boolean) as { listingId: number; tokenId: bigint }[];

  const { data: ownerOfData } = useReadContracts({
    contracts: tokenIds.map(({ tokenId }) => ({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "ownerOf" as const,
      args: [tokenId] as const,
    })),
    query: { enabled: tokenIds.length > 0 && !!address },
  });

  // LP collateral (isLP check)
  const { data: collateralData } = useMyCollateral(address);

  // --- Compute stats ---

  // listings[1] = seller address
  const myListingsCount = (allListingsData ?? []).filter((r) => {
    if (!r || r.status !== "success") return false;
    const d = r.result as unknown as unknown[];
    return (d[1] as string)?.toLowerCase() === address?.toLowerCase();
  }).length;

  let completedDeals = 0;
  let dealsAsSeller = 0;
  let dealsAsBuyer = 0;

  // deals: [listingId, seller, buyer, amount, sellerConfirmed, buyerConfirmed, acceptedAt, completed, cancelled]
  (allDealsData ?? []).forEach((r) => {
    if (!r || r.status !== "success") return;
    const d = r.result as unknown as unknown[];
    const seller = (d[1] as string)?.toLowerCase();
    const buyer = (d[2] as string)?.toLowerCase();
    const completed = d[7] as boolean;
    const addr = address?.toLowerCase();

    if (seller === addr) dealsAsSeller++;
    if (buyer === addr) dealsAsBuyer++;
    if (completed && (seller === addr || buyer === addr)) completedDeals++;
  });

  const isLP = collateralData ? (collateralData as bigint) > 0n : false;

  // Build owned NFTs list
  const ownedNFTs: OwnedNFT[] = [];
  if (ownerOfData && allListingsData) {
    ownerOfData.forEach((ownerResult, idx) => {
      if (!ownerResult || ownerResult.status !== "success") return;
      const owner = (ownerResult.result as string)?.toLowerCase();
      if (owner !== address?.toLowerCase()) return;

      const listingResult = allListingsData[idx];
      if (!listingResult || listingResult.status !== "success") return;

      // listing: [tokenId, seller, price, title, description, contact, imageURI, active]
      const d = listingResult.result as unknown as unknown[];
      const originalSeller = d[1] as string;

      ownedNFTs.push({
        listingId: tokenIds[idx].listingId,
        tokenId: tokenIds[idx].tokenId,
        title: d[3] as string,
        imageURI: d[6] as string,
        price: d[2] as bigint,
        originalSeller,
        acquired: originalSeller.toLowerCase() !== address?.toLowerCase(),
      });
    });
  }

  // Account age — disabled
  // const accountAgeDays = accountAgeData === undefined ? null : accountAgeData === -1 ? null : accountAgeData;

  const stats: ReputationStats = {
    txCount: txCount ?? 0,
    balanceMON: balanceData ? formatEther(balanceData.value) : "0",
    accountAgeDays: null,
    totalListings: myListingsCount,
    completedDeals,
    totalDeals: dealsAsSeller + dealsAsBuyer,
    dealsAsSeller,
    dealsAsBuyer,
    usedBNPL: false,
    isLP,
  };

  const tier = computeTier(stats);
  // const ageBadge = computeAgeBadge(accountAgeDays); // account age — disabled
  const badges = computeBadges(stats);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const isLoading =
    !balanceData &&
    txCount === undefined &&
    totalListingsCount === 0 &&
    totalDealsCount === 0;

  return { stats, tier, badges, unlockedCount, ownedNFTs, isLoading };
}
