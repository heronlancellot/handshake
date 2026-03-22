const GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY
  ? `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs`
  : "https://ipfs.io/ipfs";

export function ipfsToHttp(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) return `${GATEWAY}/${uri.slice(7)}`;
  return uri;
}

export type NFTMetadata = {
  name: string;
  description: string;
  image: string;
  attributes?: { trait_type: string; value: string }[];
};

// Upload image file → returns ipfsHash
export async function uploadImageToPinata(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/pinata/image", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Image upload failed");
  const { ipfsHash } = await res.json();
  return ipfsHash;
}

// Upload metadata JSON → returns ipfsHash
export async function uploadMetadataToPinata(metadata: NFTMetadata): Promise<string> {
  const res = await fetch("/api/pinata/json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });
  if (!res.ok) throw new Error("Metadata upload failed");
  const { ipfsHash } = await res.json();
  return ipfsHash;
}

// Resolve an IPFS URI (may be metadata JSON or direct image)
// Returns the final image URL to display
export async function resolveNFTImage(uri: string): Promise<string> {
  if (!uri) return "";
  const httpUrl = ipfsToHttp(uri);
  try {
    const res = await fetch(httpUrl);
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("json")) {
      const json: NFTMetadata = await res.json();
      return json.image ? ipfsToHttp(json.image) : httpUrl;
    }
    return httpUrl;
  } catch {
    return httpUrl;
  }
}
