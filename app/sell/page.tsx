"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useListItem } from "@/src/hooks/useMarketplace";
import { uploadImageToPinata, uploadMetadataToPinata } from "@/src/lib/ipfs";

type UploadState = "idle" | "uploading-image" | "uploading-metadata" | "done" | "error";

export default function SellPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { listItem, isPending, isSuccess, error } = useListItem();

  const [form, setForm] = useState({
    title: "",
    description: "",
    contact: "",
    price: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !imageFile) return;

    setUploadError("");

    try {
      // 1. Upload image to Pinata
      setUploadState("uploading-image");
      const imageHash = await uploadImageToPinata(imageFile);

      // 2. Build & upload NFT metadata
      setUploadState("uploading-metadata");
      const metadataHash = await uploadMetadataToPinata({
        name: form.title,
        description: form.description,
        image: `ipfs://${imageHash}`,
        attributes: [
          { trait_type: "Price", value: `${form.price} MON` },
          { trait_type: "Contact", value: form.contact || "N/A" },
          { trait_type: "Platform", value: "Handshake" },
        ],
      });

      setUploadState("done");

      // 3. Mint NFT + create listing on-chain
      listItem(form.price, form.title, form.description, form.contact, `ipfs://${metadataHash}`);
    } catch (err) {
      setUploadState("error");
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const uploadLabel: Record<UploadState, string> = {
    idle: "List Item",
    "uploading-image": "Uploading image…",
    "uploading-metadata": "Uploading metadata…",
    done: isPending ? "Confirming on-chain…" : "List Item",
    error: "Retry",
  };

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="text-5xl mb-4">🤝</div>
        <h2 className="text-2xl font-extrabold text-white">Listed!</h2>
        <p className="mt-2 text-zinc-400 font-bold">
          Your NFT is minted and your item is live on Handshake.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => router.push("/")}
            className="rounded-lg px-5 py-2 text-sm font-extrabold text-zinc-950 transition-colors"
            style={{ background: "#F5E033" }}
          >
            Browse Listings
          </button>
          <button
            onClick={() => {
              setForm({ title: "", description: "", contact: "", price: "" });
              setImageFile(null);
              setImagePreview("");
              setUploadState("idle");
              window.location.reload();
            }}
            className="rounded-lg border border-zinc-700 px-5 py-2 text-sm font-extrabold text-zinc-300 hover:border-zinc-500 transition-colors"
          >
            List Another
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h2 className="text-xl font-extrabold text-zinc-300 mb-6">
          Connect your wallet to list an item
        </h2>
        <ConnectButton />
      </div>
    );
  }

  const isBusy = uploadState === "uploading-image" || uploadState === "uploading-metadata" || isPending;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-extrabold text-white mb-6">List an Item</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image upload */}
        <div>
          <label className="block text-sm font-extrabold text-zinc-400 mb-1">
            Product Image *
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-xl border-2 border-dashed border-zinc-700 hover:border-zinc-500 transition-colors overflow-hidden"
            style={{ minHeight: 180 }}
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="preview"
                className="w-full object-cover"
                style={{ maxHeight: 260 }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                <span className="text-4xl mb-2">📷</span>
                <p className="text-sm font-extrabold">Click to upload image</p>
                <p className="text-xs mt-1">JPG, PNG, GIF, WEBP</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {imageFile && (
            <p className="mt-1 text-xs text-zinc-500">{imageFile.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-extrabold text-zinc-400 mb-1">Title *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Mountain bike, iPhone 14…"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none"
            style={{ ["--focus-border" as string]: "#7B6FD4" }}
            onFocus={(e) => (e.target.style.borderColor = "#7B6FD4")}
            onBlur={(e) => (e.target.style.borderColor = "")}
          />
        </div>

        <div>
          <label className="block text-sm font-extrabold text-zinc-400 mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your item…"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none resize-none"
            onFocus={(e) => (e.target.style.borderColor = "#7B6FD4")}
            onBlur={(e) => (e.target.style.borderColor = "")}
          />
        </div>

        <div>
          <label className="block text-sm font-extrabold text-zinc-400 mb-1">Price (MON) *</label>
          <input
            type="number"
            step="0.001"
            min="0"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="1.5"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none"
            onFocus={(e) => (e.target.style.borderColor = "#7B6FD4")}
            onBlur={(e) => (e.target.style.borderColor = "")}
          />
        </div>

        <div>
          <label className="block text-sm font-extrabold text-zinc-400 mb-1">Contact</label>
          <input
            type="text"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder="Telegram, WhatsApp, email…"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none"
            onFocus={(e) => (e.target.style.borderColor = "#7B6FD4")}
            onBlur={(e) => (e.target.style.borderColor = "")}
          />
        </div>

        {(uploadError || error) && (
          <p className="rounded-lg bg-red-900/40 border border-red-700 px-4 py-2 text-sm text-red-400">
            {uploadError || error?.message.split("\n")[0]}
          </p>
        )}

        {/* Upload progress */}
        {(uploadState === "uploading-image" || uploadState === "uploading-metadata") && (
          <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full animate-pulse" style={{ background: "#7B6FD4" }} />
              {uploadState === "uploading-image" ? "Uploading image to IPFS…" : "Uploading metadata to IPFS…"}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isBusy || !imageFile}
          className="w-full rounded-lg py-3 font-extrabold text-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ background: "#F5E033" }}
        >
          {uploadLabel[uploadState]}
        </button>

        <p className="text-xs text-zinc-600 text-center">
          Your image and metadata will be stored on IPFS via Pinata.
          The NFT is transferred to the buyer upon delivery confirmation.
        </p>
      </form>
    </div>
  );
}
