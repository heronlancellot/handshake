"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useListItem } from "@/src/hooks/useMarketplace";
import { uploadImageToPinata, uploadMetadataToPinata } from "@/src/lib/ipfs";
import { useLanguage } from "@/src/lib/i18n/context";

type UploadState = "idle" | "uploading-image" | "uploading-metadata" | "done" | "error";

export default function SellPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { listItem, isPending, isSuccess, error } = useListItem();
  const { t } = useLanguage();

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
      setUploadState("uploading-image");
      const imageHash = await uploadImageToPinata(imageFile);

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
      listItem(form.price, form.title, form.description, form.contact, `ipfs://${metadataHash}`);
    } catch (err) {
      setUploadState("error");
      setUploadError(err instanceof Error ? err.message : t.sell.upload.error);
    }
  };

  const uploadLabel: Record<UploadState, string> = {
    idle: t.sell.submit,
    "uploading-image": t.sell.upload.uploadingImage,
    "uploading-metadata": t.sell.upload.uploadingMetadata,
    done: isPending ? t.common.pending : t.sell.submit,
    error: t.sell.upload.error,
  };

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="text-5xl mb-4">🤝</div>
        <h2 className="text-2xl font-extrabold text-white">{t.sell.upload.done}</h2>
        <p className="mt-2 text-zinc-400 font-bold">{t.sell.subtitle}</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => router.push("/")}
            className="rounded-lg px-5 py-2 text-sm font-extrabold text-zinc-950 transition-colors"
            style={{ background: "#F5E033" }}
          >
            {t.common.browseListings}
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
            {t.sell.submit}
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <h2 className="text-xl font-extrabold text-zinc-300 mb-6">{t.sell.connectPrompt}</h2>
        <ConnectButton />
      </div>
    );
  }

  const isBusy = uploadState === "uploading-image" || uploadState === "uploading-metadata" || isPending;

  return (
    <div className="mx-auto max-w-lg px-3 sm:px-4 py-6 sm:py-10">
      <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-2">{t.sell.title}</h1>
      <p className="text-sm text-zinc-500 mb-6">{t.sell.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image upload */}
        <div>
          <label className="block text-sm font-extrabold text-zinc-400 mb-1">
            {t.sell.form.image} *
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
                <p className="text-sm font-extrabold">{t.sell.form.imagePlaceholder}</p>
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
          <label className="block text-sm font-extrabold text-zinc-400 mb-1">{t.sell.form.title} *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t.sell.form.titlePlaceholder}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white placeholder-zinc-600 focus:outline-none"
            onFocus={(e) => (e.currentTarget.style.borderColor = "#7B6FD4")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "")}
          />
        </div>

        <div>
          <label className="block text-sm font-extrabold text-zinc-400 mb-1">{t.sell.form.description}</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder={t.sell.form.descriptionPlaceholder}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white placeholder-zinc-600 focus:outline-none resize-none"
            onFocus={(e) => (e.currentTarget.style.borderColor = "#7B6FD4")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "")}
          />
        </div>

        <div>
          <label className="block text-sm font-extrabold text-zinc-400 mb-1">{t.sell.form.price} *</label>
          <input
            type="number"
            step="0.001"
            min="0"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder={t.sell.form.pricePlaceholder}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white placeholder-zinc-600 focus:outline-none"
            onFocus={(e) => (e.currentTarget.style.borderColor = "#7B6FD4")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "")}
          />
        </div>

        <div>
          <label className="block text-sm font-extrabold text-zinc-400 mb-1">{t.sell.form.contact}</label>
          <input
            type="text"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder={t.sell.form.contactPlaceholder}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white placeholder-zinc-600 focus:outline-none"
            onFocus={(e) => (e.currentTarget.style.borderColor = "#7B6FD4")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "")}
          />
        </div>

        {(uploadError || error) && (
          <p className="rounded-lg bg-red-900/40 border border-red-700 px-4 py-2 text-sm text-red-400">
            {uploadError || error?.message.split("\n")[0]}
          </p>
        )}

        {(uploadState === "uploading-image" || uploadState === "uploading-metadata") && (
          <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full animate-pulse" style={{ background: "#7B6FD4" }} />
              {uploadState === "uploading-image" ? t.sell.upload.uploadingImage : t.sell.upload.uploadingMetadata}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isBusy || !imageFile}
          className="w-full rounded-xl py-4 font-extrabold text-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
          style={{ background: "#F5E033" }}
        >
          {uploadLabel[uploadState]}
        </button>
      </form>
    </div>
  );
}
