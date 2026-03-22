"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import Link from "next/link";
import {
  useUserLoanIds,
  useLoan,
  useRepayLoan,
  useMarkDefault,
  useIsDefaulter,
  LOAN_STATUS,
  formatEther,
  parseEther,
} from "@/src/hooks/useLendingPool";

const STATUS_COLORS = {
  Active: "text-violet-400 bg-violet-900/30 border-violet-800",
  Paid: "text-emerald-400 bg-emerald-900/30 border-emerald-800",
  Defaulted: "text-red-400 bg-red-900/30 border-red-800",
};

function LoanCard({ loanId, address }: { loanId: number; address: string }) {
  const { data } = useLoan(loanId);
  const { repayLoan, isPending: repayPending, isSuccess: repaySuccess, error: repayError } = useRepayLoan();
  const { markDefault, isPending: defaultPending } = useMarkDefault();
  const [repayAmount, setRepayAmount] = useState("");

  if (!data) return null;

  const [borrower, principal, totalDue, paidAmount, dueDate, listingId, status] = data as [
    string, bigint, bigint, bigint, bigint, bigint, number
  ];

  if ((borrower as string).toLowerCase() !== address.toLowerCase()) return null;

  const statusName = LOAN_STATUS[status as number] ?? "Unknown";
  const remaining = (totalDue as bigint) - (paidAmount as bigint);
  const dueDateMs = Number(dueDate as bigint) * 1000;
  const isOverdue = Date.now() > dueDateMs && statusName === "Active";
  const remainingEth = formatEther(remaining);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/product/${(listingId as bigint).toString()}`} className="text-sm font-semibold text-white hover:text-violet-400 transition-colors">
            Loan #{loanId} — Listing #{(listingId as bigint).toString()}
          </Link>
          <p className="text-xs text-zinc-500 mt-0.5">
            Due: {new Date(dueDateMs).toLocaleDateString()}
            {isOverdue && <span className="ml-2 text-red-400 font-medium">OVERDUE</span>}
          </p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[statusName as keyof typeof STATUS_COLORS] ?? ""}`}>
          {statusName}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs text-zinc-400">
        <div>
          <p className="text-zinc-600">Principal</p>
          <p className="text-white font-medium">{formatEther(principal as bigint)} MON</p>
        </div>
        <div>
          <p className="text-zinc-600">Total Due (w/ 5%)</p>
          <p className="text-white font-medium">{formatEther(totalDue as bigint)} MON</p>
        </div>
        <div>
          <p className="text-zinc-600">Remaining</p>
          <p className={remaining > 0n ? "text-violet-400 font-medium" : "text-emerald-400 font-medium"}>
            {formatEther(remaining)} MON
          </p>
        </div>
      </div>

      {statusName === "Active" && (
        <div className="space-y-2 pt-1">
          {repaySuccess ? (
            <p className="text-emerald-400 text-sm">Payment sent!</p>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max={remainingEth}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  placeholder={`Up to ${remainingEth} MON`}
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                />
                <button
                  onClick={() => repayLoan(loanId, repayAmount)}
                  disabled={repayPending || !repayAmount}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {repayPending ? "Paying…" : "Pay"}
                </button>
                <button
                  onClick={() => repayLoan(loanId, remainingEth)}
                  disabled={repayPending}
                  className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-900/30 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  Pay All
                </button>
              </div>
              {repayError && (
                <p className="text-xs text-red-400">{repayError.message.split("\n")[0]}</p>
              )}
            </>
          )}

          {isOverdue && (
            <button
              onClick={() => markDefault(loanId)}
              disabled={defaultPending}
              className="w-full rounded-lg border border-zinc-700 py-2 text-xs text-zinc-500 hover:text-red-400 hover:border-red-800 transition-colors"
            >
              {defaultPending ? "Processing…" : "Trigger Default (overdue)"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function LoanList({ ids, address }: { ids: readonly bigint[]; address: string }) {
  if (ids.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <p>No loans found.</p>
        <Link href="/" className="mt-4 inline-block text-violet-400 hover:text-violet-300 text-sm">
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {[...ids].reverse().map((id) => (
        <LoanCard key={id.toString()} loanId={Number(id)} address={address} />
      ))}
    </div>
  );
}

export default function MyLoansPage() {
  const { address, isConnected } = useAccount();
  const { data: loanIds, isLoading } = useUserLoanIds(address);
  const { data: isDefaulter } = useIsDefaulter(address);

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h2 className="text-xl font-semibold text-zinc-300 mb-6">Connect your wallet to see your loans</h2>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Loans</h1>
        {isDefaulter && (
          <span className="rounded-full border border-red-700 bg-red-900/30 px-3 py-1 text-xs font-medium text-red-400">
            Defaulter — Credit Blocked
          </span>
        )}
      </div>

      <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-500">
        Loans carry 5% interest and must be repaid within 30 days. Default blocks future credit.
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl border border-zinc-800 bg-zinc-900 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && address && (
        <LoanList ids={(loanIds as readonly bigint[]) ?? []} address={address} />
      )}
    </div>
  );
}
