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
