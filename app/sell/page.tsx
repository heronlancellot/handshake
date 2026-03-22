"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useListItem } from "@/src/hooks/useMarketplace";

export default function SellPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { listItem, isPending, isSuccess, error } = useListItem();

  const [form, setForm] = useState({
    title: "",
    description: "",
    contact: "",
    imageURI: "",
    price: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price) return;
    listItem(form.price, form.title, form.description, form.contact, form.imageURI);
  };

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="text-5xl mb-4">&#10003;</div>
        <h2 className="text-2xl font-bold text-white">Listed!</h2>
        <p className="mt-2 text-zinc-400">Your item is now live on MonadMarket.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
          >
            Browse Listings
          </button>
          <button
            onClick={() => {
              setForm({ title: "", description: "", contact: "", imageURI: "", price: "" });
              window.location.reload();
            }}
            className="rounded-lg border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-300 hover:border-zinc-500 transition-colors"
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
        <h2 className="text-xl font-semibold text-zinc-300 mb-6">Connect your wallet to list an item</h2>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">List an Item</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Title *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Mountain bike, iPhone 14..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your item..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Price (MON) *</label>
          <input
            type="number"
            step="0.001"
            min="0"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="1.5"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Image URL</label>
          <input
            type="text"
            value={form.imageURI}
            onChange={(e) => setForm({ ...form, imageURI: e.target.value })}
            placeholder="https://... or ipfs://..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Contact</label>
          <input
            type="text"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder="Telegram, WhatsApp, email..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-900/40 border border-red-700 px-4 py-2 text-sm text-red-400">
            {error.message.split("\n")[0]}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-violet-600 py-3 font-semibold text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Confirming..." : "List Item"}
        </button>
      </form>
    </div>
  );
}
