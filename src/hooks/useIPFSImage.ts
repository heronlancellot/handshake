"use client";

import { useState, useEffect } from "react";
import { resolveNFTImage, ipfsToHttp } from "@/src/lib/ipfs";

// Resolves an IPFS URI (metadata JSON or direct image) to a displayable HTTP URL
export function useIPFSImage(uri: string) {
  const [src, setSrc] = useState<string>(() => ipfsToHttp(uri));

  useEffect(() => {
    if (!uri) return;
    // Only fetch to resolve if it's an IPFS URI — might be metadata JSON
    if (uri.startsWith("ipfs://")) {
      let cancelled = false;
      resolveNFTImage(uri).then((resolved) => {
        if (!cancelled) setSrc(resolved);
      });
      return () => { cancelled = true; };
    } else {
      setSrc(uri);
    }
  }, [uri]);

  return src;
}
