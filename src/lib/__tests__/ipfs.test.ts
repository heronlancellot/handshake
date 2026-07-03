import { describe, it, expect } from "vitest";
import { ipfsToHttp } from "../ipfs";

describe("ipfsToHttp", () => {
  it("converts ipfs:// URI to http URL using fallback gateway", () => {
    const result = ipfsToHttp("ipfs://QmTest123");
    expect(result).toBe("https://ipfs.io/ipfs/QmTest123");
  });

  it("returns http URLs unchanged", () => {
    const url = "https://example.com/image.png";
    expect(ipfsToHttp(url)).toBe(url);
  });

  it("returns https URLs unchanged", () => {
    const url = "https://gateway.pinata.cloud/ipfs/QmTest";
    expect(ipfsToHttp(url)).toBe(url);
  });

  it("returns empty string for empty input", () => {
    expect(ipfsToHttp("")).toBe("");
  });

  it("handles ipfs:// URI with CID path", () => {
    const result = ipfsToHttp("ipfs://QmABC/metadata.json");
    expect(result).toBe("https://ipfs.io/ipfs/QmABC/metadata.json");
  });
});
