"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { parseContractError } from "@/src/lib/errors";
import {
  useUserLoanIds,
  useLoan,
  useRepayLoan,
  useLiquidate,
  LOAN_STATUS,
  formatEther,
} from "@/src/hooks/useLendingPool";
import { useLanguage } from "@/src/lib/i18n/context";

const STATUS_COLORS = {
  Active: "text-violet-400 bg-violet-900/30 border-violet-800",
  Paid: "text-emerald-400 bg-emerald-900/30 border-emerald-800",
  Defaulted: "text-red-400 bg-red-900/30 border-red-800",
};

function daysRemaining(dueDateMs: number): number {
  return Math.max(0, Math.ceil((dueDateMs - Date.now()) / (1000 * 60 * 60 * 24)));
}

function DaysLabel({ dueDateMs, isActive }: { dueDateMs: number; isActive: boolean }) {
  const { t } = useLanguage();
  if (!isActive) return null;
  const days = daysRemaining(dueDateMs);
  const isOverdue = Date.now() > dueDateMs;

  if (isOverdue) return <span className="ml-2 font-bold text-red-400">{t.myLoans.overdue}</span>;
  if (days <= 3) return <span className="ml-2 font-bold text-red-400">{days}{t.myLoans.daysLeft}</span>;
  if (days <= 7) return <span className="ml-2 font-bold text-yellow-400">{days}{t.myLoans.daysLeft}</span>;
  return <span className="ml-2 text-emerald-400">{days}{t.myLoans.daysLeft}</span>;
}

function RepayProgress({ paid, total }: { paid: bigint; total: bigint }) {
  const pct = total > 0n ? Number((paid * 100n) / total) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-500 mb-1">
        <span>{Number(formatEther(paid)).toFixed(4)} MON</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-800">
        <div
          className="h-1.5 rounded-full bg-violet-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function LoanCard({ loanId, address }: { loanId: number; address: string }) {
  const { t } = useLanguage();
  const { data } = useLoan(loanId);
  const { repayLoan, isPending: repayPending, isSuccess: repaySuccess, error: repayError } = useRepayLoan();
  const { liquidate, isPending: liquidatePending, isSuccess: liquidateSuccess, error: liquidateError } = useLiquidate();
  const [repayAmount, setRepayAmount] = useState("");

  useEffect(() => { if (repaySuccess) toast.success(t.myLoans.paymentSent); }, [repaySuccess, t]);
  useEffect(() => { if (repayError) toast.error(parseContractError(repayError, t)); }, [repayError, t]);
  useEffect(() => { if (liquidateSuccess) toast.success(t.myLoans.loanDefaulted); }, [liquidateSuccess, t]);
  useEffect(() => { if (liquidateError) toast.error(parseContractError(liquidateError, t)); }, [liquidateError, t]);

  if (!data) return null;

  const [borrower, collateralLocked, principal, totalDue, paidAmount, dueDate, listingId, status] = data as [
    string, bigint, bigint, bigint, bigint, bigint, bigint, number
  ];

  if ((borrower as string).toLowerCase() !== address.toLowerCase()) return null;

  const statusName = LOAN_STATUS[status as number] ?? "Unknown";
  const isActive = statusName === "Active";
  const remaining = (totalDue as bigint) - (paidAmount as bigint);
  const interest = (totalDue as bigint) - (principal as bigint);
  const dueDateMs = Number(dueDate as bigint) * 1000;
  const isOverdue = Date.now() > dueDateMs && isActive;
  const remainingEth = formatEther(remaining);

  const borderColor = isOverdue
    ? "border-red-800"
    : statusName === "Paid"
    ? "border-emerald-800"
    : statusName === "Defaulted"
    ? "border-red-900"
    : "border-zinc-800";

  const statusLabel =
    statusName === "Active" ? t.myDeals.status.active :
    statusName === "Paid" ? t.myDeals.status.completed :
    t.myDeals.status.cancelled;

  return (
    <div className={`rounded-2xl border ${borderColor} bg-zinc-900 p-4 space-y-4`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/product/${(listingId as bigint).toString()}`} className="text-sm font-semibold text-white hover:text-violet-400 transition-colors">
            {t.myLoans.loan}{loanId} — {t.myLoans.listingRef}{(listingId as bigint).toString()}
          </Link>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t.myLoans.due}: {new Date(dueDateMs).toLocaleDateString()}
            <DaysLabel dueDateMs={dueDateMs} isActive={isActive} />
          </p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[statusName as keyof typeof STATUS_COLORS] ?? ""}`}>
          {statusLabel}
        </span>
      </div>

      {/* Breakdown — 2 cols on mobile */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-zinc-800/50 p-3">
          <p className="text-zinc-500 mb-1">{t.myLoans.principal}</p>
          <p className="text-white font-bold">{Number(formatEther(principal as bigint)).toFixed(4)} MON</p>
        </div>
        <div className="rounded-xl bg-zinc-800/50 p-3">
          <p className="text-zinc-500 mb-1">{t.myLoans.interest}</p>
          <p className="text-yellow-400 font-bold">+{Number(formatEther(interest)).toFixed(4)} MON</p>
        </div>
        <div className="rounded-xl bg-zinc-800/50 p-3">
          <p className="text-zinc-500 mb-1">{t.myLoans.totalDue}</p>
          <p className="text-white font-bold">{Number(formatEther(totalDue as bigint)).toFixed(4)} MON</p>
        </div>
        <div className="rounded-xl bg-zinc-800/50 p-3">
          <p className="text-zinc-500 mb-1">{t.myLoans.collateralLocked}</p>
          <p className="text-orange-400 font-bold">{Number(formatEther(collateralLocked as bigint)).toFixed(4)} MON</p>
        </div>
      </div>

      {/* Progress bar */}
      {isActive && (paidAmount as bigint) > 0n && (
        <RepayProgress paid={paidAmount as bigint} total={totalDue as bigint} />
      )}

      {/* Remaining */}
      {isActive && (
        <div className="rounded-xl border border-violet-900 bg-violet-950/30 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-zinc-400">{t.myLoans.remaining}</span>
          <span className="text-lg font-bold text-violet-300">{Number(remainingEth).toFixed(4)} MON</span>
        </div>
      )}

      {/* Actions */}
      {isActive && (
        <div className="space-y-2">
          {repaySuccess ? (
            <p className="text-emerald-400 text-sm">{t.myLoans.paymentSent}</p>
          ) : (
            <>
              {/* Full-width input + Pay All on its own row for mobile */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    inputMode="decimal"
                    max={remainingEth}
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    placeholder={`${t.myLoans.upTo} ${Number(remainingEth).toFixed(4)} MON`}
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-3 text-base text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                  />
                  <button
                    onClick={() => repayLoan(loanId, repayAmount)}
                    disabled={repayPending || !repayAmount}
                    className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {repayPending ? t.myLoans.paying : t.myLoans.pay}
                  </button>
                </div>
                <button
                  onClick={() => repayLoan(loanId, remainingEth)}
                  disabled={repayPending}
                  className="w-full rounded-xl border border-emerald-700 py-3 text-sm font-semibold text-emerald-400 hover:bg-emerald-900/30 disabled:opacity-50 transition-colors"
                >
                  {t.myLoans.payAll}
                </button>
              </div>
              {repayError && (
                <p className="text-xs text-red-400">{repayError.message.split("\n")[0]}</p>
              )}
            </>
          )}

          {isOverdue && (
            <button
              onClick={() => liquidate(loanId)}
              disabled={liquidatePending}
              className="w-full rounded-xl border border-red-900 py-3 text-xs text-red-500 hover:bg-red-900/20 disabled:opacity-50 transition-colors"
            >
              {liquidatePending ? t.myLoans.liquidating : t.myLoans.liquidate}
            </button>
          )}
        </div>
      )}

      {statusName === "Paid" && (
        <p className="text-xs text-emerald-500">{t.myLoans.loanPaid}</p>
      )}

      {statusName === "Defaulted" && (
        <p className="text-xs text-red-500">{t.myLoans.loanDefaulted}</p>
      )}
    </div>
  );
}

function LoanList({ ids, address }: { ids: readonly bigint[]; address: string }) {
  const { t } = useLanguage();
  if (ids.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <p>{t.myLoans.noLoans}</p>
        <Link href="/" className="mt-4 inline-block text-violet-400 hover:text-violet-300 text-sm">
          {t.common.browseListings}
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
  const { t } = useLanguage();
  const { address, isConnected } = useAccount();
  const { data: loanIds, isLoading } = useUserLoanIds(address);

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h2 className="text-xl font-semibold text-zinc-300 mb-6">{t.myLoans.connectPrompt}</h2>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-10">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-white">{t.myLoans.title}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t.myLoans.subtitle}</p>
      </div>

      {/* Rules box */}
      <div className="mb-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{t.myLoans.rulesTitle}</p>
        <div className="grid grid-cols-3 gap-3 text-xs text-zinc-500">
          <div className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">▸</span>
            <span>{t.myLoans.rule1}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">▸</span>
            <span>{t.myLoans.rule2}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">▸</span>
            <span>{t.myLoans.rule3}</span>
          </div>
        </div>
        <p className="text-xs text-zinc-600">
          {t.myLoans.manageCollateral}{" "}
          <Link href="/pool" className="text-violet-400 hover:text-violet-300">{t.navbar.pool} →</Link>
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl border border-zinc-800 bg-zinc-900 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && address && (
        <LoanList ids={(loanIds as readonly bigint[]) ?? []} address={address} />
      )}
    </div>
  );
}
