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
