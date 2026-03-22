"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import Link from "next/link";
import { useIPFSImage } from "@/src/hooks/useIPFSImage";
import {
  useOnChainReputation,
  // computeAgeBadge, // account age — disabled
  type ReputationTier,
  // type AgeBadge,   // account age — disabled
  type Badge,
  type OwnedNFT,
} from "@/src/hooks/useOnChainReputation";

const TIER_CONFIG: Record<
  ReputationTier,
  { label: string; color: string; border: string; bg: string }
> = {
  Bronze: {
    label: "Bronze",
    color: "text-amber-400",
    border: "border-amber-700",
    bg: "bg-amber-900/20",
  },
  Silver: {
    label: "Silver",
    color: "text-zinc-300",
    border: "border-zinc-500",
    bg: "bg-zinc-800/40",
  },
  Gold: {
    label: "Gold",
    color: "text-yellow-300",
    border: "border-yellow-600",
    bg: "bg-yellow-900/20",
  },
  Diamond: {
    label: "Diamond",
    color: "text-cyan-300",
    border: "border-cyan-500",
    bg: "bg-cyan-900/20",
  },
};

// Account age — disabled
// const AGE_BADGE_CONFIG: Record<
//   NonNullable<AgeBadge>,
//   { icon: string; color: string }
// > = {
//   Newcomer: { icon: "🌱", color: "text-green-400" },
//   Regular: { icon: "🔵", color: "text-blue-400" },
//   Veteran: { icon: "🟣", color: "text-violet-400" },
//   OG: { icon: "👑", color: "text-yellow-300" },
// };

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      <p className="text-xs text-zinc-400 mt-1 font-medium">{label}</p>
    </div>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col items-center gap-2 transition-all ${
        badge.unlocked
          ? "border-violet-700 bg-violet-900/20"
          : "border-zinc-800 bg-zinc-900 opacity-40 grayscale"
      }`}
    >
      <span className="text-3xl">{badge.icon}</span>
      <p
        className={`text-sm font-semibold text-center ${
          badge.unlocked ? "text-white" : "text-zinc-500"
        }`}
      >
        {badge.name}
      </p>
      <p className="text-xs text-zinc-500 text-center leading-tight">
        {badge.description}
      </p>
      {badge.unlocked && (
        <span className="rounded-full bg-violet-600/30 border border-violet-600 px-2 py-0.5 text-xs text-violet-300 font-medium">
          Earned
        </span>
      )}
    </div>
  );
}

function NFTCard({ nft }: { nft: OwnedNFT }) {
  const imgSrc = useIPFSImage(nft.imageURI);

  return (
    <Link href={`/product/${nft.listingId}`}>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-violet-700 transition-colors group">
        <div className="aspect-square w-full bg-zinc-800 overflow-hidden">
          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt={nft.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/400x400/1a1a2e/7C3AED?text=${encodeURIComponent(nft.title)}`;
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-600 text-4xl">
              &#9670;
            </div>
          )}
        </div>
        <div className="p-3 space-y-1">
          <p className="text-sm font-semibold text-white truncate">{nft.title}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-violet-400 font-bold">
              {formatEther(nft.price)} MON
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium border ${
                nft.acquired
                  ? "text-emerald-300 border-emerald-700 bg-emerald-900/20"
                  : "text-violet-300 border-violet-700 bg-violet-900/20"
              }`}
            >
              {nft.acquired ? "Acquired" : "Listed"}
            </span>
          </div>
          <p className="text-xs text-zinc-600">#{nft.tokenId.toString()}</p>
        </div>
      </div>
    </Link>
  );
}

function ProfileContent({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const { stats, tier, badges, unlockedCount, ownedNFTs, isLoading } =
    useOnChainReputation(address);

  const tierCfg = TIER_CONFIG[tier];
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  function copyAddress() {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const formattedBalance = parseFloat(stats.balanceMON).toFixed(4);
  // const ageCfg = ageBadge ? AGE_BADGE_CONFIG[ageBadge] : null; // account age — disabled

  const tierEmoji =
    tier === "Diamond" ? "💎" : tier === "Gold" ? "🥇" : tier === "Silver" ? "🥈" : "🥉";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://effigy.im/a/${address}.svg`}
          alt="avatar"
          className="w-20 h-20 rounded-full border-2 border-violet-600 shadow-lg"
        />
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-semibold text-white">
            {shortAddress}
          </span>
          <button
            onClick={copyAddress}
            className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-0.5 rounded border border-zinc-700 hover:border-zinc-500"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div
          className={`rounded-full border px-5 py-1.5 font-bold text-sm ${tierCfg.border} ${tierCfg.bg} ${tierCfg.color}`}
        >
          {tierEmoji} {tier}
        </div>
      </div>

      {/* Stats row */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-zinc-800 bg-zinc-900 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Transactions" value={stats.txCount} sub="on Monad" />
          <StatCard label="Balance" value={formattedBalance} sub="MON" />
          <StatCard
            label="Deals Closed"
            value={stats.completedDeals}
            sub={`${stats.dealsAsSeller} sold · ${stats.dealsAsBuyer} bought`}
          />
          <StatCard label="Listings" value={stats.totalListings} sub="created" />
        </div>
      )}

      {/* Account Age — disabled (requires archive node or explorer API)
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-300">Account Age on Monad</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Based on first transaction on-chain
          </p>
        </div>
        {accountAgeLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-zinc-700 border-t-violet-500 animate-spin" />
            <p className="text-zinc-500 text-sm">Loading…</p>
          </div>
        ) : stats.accountAgeDays !== null ? (
          <div className="text-right">
            <p className="text-white font-bold text-lg">
              {stats.accountAgeDays === 0
                ? "Today"
                : `${stats.accountAgeDays} day${stats.accountAgeDays !== 1 ? "s" : ""}`}
            </p>
            {ageCfg && ageBadge && (
              <p className={`text-sm font-semibold ${ageCfg.color}`}>
                {ageCfg.icon} {ageBadge}
              </p>
            )}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm italic">Not indexed yet</p>
        )}
      </div>
      */}

      {/* NFT Gallery */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">My NFTs</h2>
          <span className="text-sm text-zinc-400">
            <span className="text-violet-400 font-bold">{ownedNFTs.length}</span> owned
          </span>
        </div>

        {ownedNFTs.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 py-12 text-center">
            <p className="text-zinc-500 text-sm">No NFTs yet.</p>
            <Link
              href="/sell"
              className="mt-3 inline-block text-violet-400 hover:text-violet-300 text-sm"
            >
              List your first item →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ownedNFTs.map((nft) => (
              <NFTCard key={nft.listingId} nft={nft} />
            ))}
          </div>
        )}
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Badges & Achievements</h2>
          <span className="text-sm text-zinc-400">
            <span className="text-violet-400 font-bold">{unlockedCount}</span>
            {" / "}
            {badges.length} earned
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>

      {/* LP / BNPL indicators */}
      {(stats.isLP || stats.usedBNPL) && (
        <div className="flex gap-3 flex-wrap">
          {stats.isLP && (
            <div className="rounded-lg border border-blue-700 bg-blue-900/20 px-4 py-2 text-sm text-blue-300 font-medium">
              💧 Active Liquidity Provider
            </div>
          )}
          {stats.usedBNPL && (
            <div className="rounded-lg border border-purple-700 bg-purple-900/20 px-4 py-2 text-sm text-purple-300 font-medium">
              💳 BNPL User
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-6">
        <p className="text-xl font-semibold text-zinc-300">
          Connect your wallet to view your profile
        </p>
        <ConnectButton />
      </div>
    );
  }

  return <ProfileContent address={address} />;
}
