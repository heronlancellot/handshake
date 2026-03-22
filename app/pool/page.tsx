"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { toast } from "sonner";
import { parseContractError } from "@/src/lib/errors";
import {
  usePoolStats,
  useMyCollateral,
  useMyActiveDebt,
  useBorrowingPower,
  useFreeCollateral,
  useDepositCollateral,
  useWithdrawCollateral,
  formatEther,
} from "@/src/hooks/useLendingPool";
import { useLanguage } from "@/src/lib/i18n/context";

function CollateralBar({ locked, free, total }: { locked: bigint; free: bigint; total: bigint }) {
  const { t } = useLanguage();
  if (total === 0n) return null;
  const lockedPct = Number((locked * 100n) / total);
  const freePct = Number((free * 100n) / total);

  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
        <span>{t.pool.totalDeposited}: {Number(formatEther(total)).toFixed(4)} MON</span>
        <span>{lockedPct}% {t.pool.lockedInLoans}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden flex">
        <div className="h-full bg-orange-500 transition-all" style={{ width: `${lockedPct}%` }} />
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${freePct}%` }} />
      </div>
      <div className="flex gap-4 mt-1.5 text-xs text-zinc-600">
        <span><span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1" />{t.pool.lockedInLoans}</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />{t.pool.freeToWithdraw}</span>
      </div>
    </div>
  );
}

export default function PoolPage() {
  const { t } = useLanguage();
  const { address, isConnected } = useAccount();
  const { data: stats } = usePoolStats();
  const { data: myCollateral } = useMyCollateral(address);
  const { data: myDebt } = useMyActiveDebt(address);
  const { data: myBorrowingPower } = useBorrowingPower(address);
  const { data: myFreeCollateral } = useFreeCollateral(address);

  const { depositCollateral, isPending: depositPending, isSuccess: depositSuccess, error: depositError } = useDepositCollateral();
  const { withdrawCollateral, isPending: withdrawPending, isSuccess: withdrawSuccess, error: withdrawError } = useWithdrawCollateral();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => { if (depositSuccess) toast.success(t.pool.depositSuccess); }, [depositSuccess, t]);
  useEffect(() => { if (depositError) toast.error(parseContractError(depositError, t)); }, [depositError, t]);
  useEffect(() => { if (withdrawSuccess) toast.success(t.pool.withdrawSuccess); }, [withdrawSuccess, t]);
  useEffect(() => { if (withdrawError) toast.error(parseContractError(withdrawError, t)); }, [withdrawError, t]);

  const [poolBalance, totalLoans] = (stats as [bigint, bigint] | undefined) ?? [0n, 0n];
  const collateralVal = (myCollateral as bigint) ?? 0n;
  const debtVal = (myDebt as bigint) ?? 0n;
  const borrowingPowerVal = (myBorrowingPower as bigint) ?? 0n;
  const freeCollateralVal = (myFreeCollateral as bigint) ?? 0n;
  const lockedCollateral = collateralVal - freeCollateralVal;

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h2 className="text-xl font-semibold text-zinc-300 mb-6">{t.pool.connectPrompt}</h2>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t.pool.title}</h1>
        <p className="mt-1 text-zinc-400 text-sm">{t.pool.subtitle}</p>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{t.pool.howItWorks}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-zinc-500">
          <div className="flex items-start gap-2">
            <span className="text-violet-400 font-bold shrink-0">1.</span>
            <span>{t.pool.step1}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-violet-400 font-bold shrink-0">2.</span>
            <span>{t.pool.step2}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-violet-400 font-bold shrink-0">3.</span>
            <span>{t.pool.step3}</span>
          </div>
        </div>
        <div className="pt-1 border-t border-zinc-800 text-xs text-zinc-600">
          {t.pool.defaultNote}{" "}
          {t.pool.seeLoans} <Link href="/my-loans" className="text-violet-400 hover:text-violet-300">{t.navbar.myLoans} →</Link>
        </div>
      </div>

      {/* Pool stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{t.pool.poolBalance}</p>
          <p className="mt-1 text-2xl font-bold text-white">{Number(formatEther(poolBalance as bigint)).toFixed(4)} MON</p>
          <p className="mt-1 text-xs text-zinc-600">{t.pool.poolBalanceSub}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{t.pool.activeLoans}</p>
          <p className="mt-1 text-2xl font-bold text-white">{Number(totalLoans as bigint)}</p>
          <p className="mt-1 text-xs text-zinc-600">{t.pool.activeLoansSub}</p>
        </div>
      </div>

      {/* My position */}
      <div className="rounded-xl border border-violet-800 bg-violet-900/10 p-5 space-y-5">
        <p className="text-sm font-semibold text-violet-300">{t.pool.myPosition}</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-zinc-900 p-3 text-xs">
            <p className="text-zinc-500 mb-1">{t.pool.totalDeposited}</p>
            <p className="text-white font-bold text-base">{Number(formatEther(collateralVal)).toFixed(4)}</p>
            <p className="text-zinc-600">MON</p>
          </div>
          <div className="rounded-lg bg-zinc-900 p-3 text-xs">
            <p className="text-zinc-500 mb-1">{t.pool.lockedInLoans}</p>
            <p className="text-orange-400 font-bold text-base">{Number(formatEther(lockedCollateral)).toFixed(4)}</p>
            <p className="text-zinc-600">{t.pool.notWithdrawable}</p>
          </div>
          <div className="rounded-lg bg-zinc-900 p-3 text-xs">
            <p className="text-zinc-500 mb-1">{t.pool.freeToWithdraw}</p>
            <p className="text-emerald-400 font-bold text-base">{Number(formatEther(freeCollateralVal)).toFixed(4)}</p>
            <p className="text-zinc-600">MON</p>
          </div>
          <div className="rounded-lg bg-zinc-900 p-3 text-xs">
            <p className="text-zinc-500 mb-1">{t.pool.borrowingPower}</p>
            <p className="text-violet-400 font-bold text-base">{Number(formatEther(borrowingPowerVal)).toFixed(4)}</p>
            <p className="text-zinc-600">{t.pool.ltvLabel}</p>
          </div>
        </div>

        <CollateralBar locked={lockedCollateral} free={freeCollateralVal} total={collateralVal} />

        {debtVal > 0n && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs">
            <span className="text-zinc-400">{t.pool.activeDebtWarning} </span>
            <span className="text-red-400 font-bold">{Number(formatEther(debtVal)).toFixed(4)} MON</span>
            <span className="text-zinc-500"> {t.pool.activeDebtSub} </span>
            <Link href="/my-loans" className="text-violet-400 hover:text-violet-300">{t.navbar.myLoans} →</Link>
          </div>
        )}
      </div>

      {/* Deposit */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-zinc-200">{t.pool.depositTitle}</h2>
          <p className="text-xs text-zinc-600 mt-0.5">{t.pool.depositSub}</p>
        </div>
        {depositSuccess ? (
          <p className="text-emerald-400 text-sm">{t.pool.depositSuccess}</p>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder={t.pool.depositPlaceholder}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
              />
              <button
                onClick={() => depositCollateral(depositAmount)}
                disabled={depositPending || !depositAmount}
                className="rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors"
              >
                {depositPending ? t.pool.depositing : t.pool.deposit}
              </button>
            </div>
            {depositAmount && Number(depositAmount) > 0 && (
              <p className="text-xs text-zinc-500">
                {t.pool.unlocks} <span className="text-violet-400 font-medium">{(Number(depositAmount) * 0.7).toFixed(4)} MON</span> {t.pool.ofBorrowingPower}
              </p>
            )}
            {depositError && (
              <p className="text-xs text-red-400">{depositError.message.split("\n")[0]}</p>
            )}
          </>
        )}
      </div>

      {/* Withdraw */}
      {freeCollateralVal > 0n && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-zinc-200">{t.pool.withdrawTitle}</h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              {t.pool.withdrawSub} <span className="text-emerald-400">{Number(formatEther(freeCollateralVal)).toFixed(4)} MON</span> {t.pool.withdrawSub2}
              {lockedCollateral > 0n && ` ${Number(formatEther(lockedCollateral)).toFixed(4)} ${t.pool.withdrawSub3}`}
            </p>
          </div>
          {withdrawSuccess ? (
            <p className="text-emerald-400 text-sm">{t.pool.withdrawSuccess}</p>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={formatEther(freeCollateralVal)}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`${t.pool.withdrawPlaceholder} ${Number(formatEther(freeCollateralVal)).toFixed(4)} MON`}
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                />
                <button
                  onClick={() => withdrawCollateral(withdrawAmount)}
                  disabled={withdrawPending || !withdrawAmount}
                  className="rounded-lg border border-zinc-600 px-5 py-2.5 font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  {withdrawPending ? t.pool.withdrawing : t.pool.withdraw}
                </button>
                <button
                  onClick={() => withdrawCollateral(formatEther(freeCollateralVal))}
                  disabled={withdrawPending}
                  className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
                >
                  {t.pool.max}
                </button>
              </div>
              {withdrawError && (
                <p className="text-xs text-red-400">{withdrawError.message.split("\n")[0]}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
