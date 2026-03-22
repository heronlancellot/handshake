"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  usePoolStats,
  useMyDeposit,
  useAvailableLiquidity,
  useDeposit,
  useWithdraw,
  formatEther,
} from "@/src/hooks/useLendingPool";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-600">{sub}</p>}
    </div>
  );
}

export default function PoolPage() {
  const { address, isConnected } = useAccount();
  const { data: stats, refetch: refetchStats } = usePoolStats();
  const { data: myDeposit, refetch: refetchDeposit } = useMyDeposit(address);
  const { data: liquidity } = useAvailableLiquidity();

  const { deposit, isPending: depositPending, isSuccess: depositSuccess, error: depositError } = useDeposit();
  const { withdraw, isPending: withdrawPending, isSuccess: withdrawSuccess, error: withdrawError } = useWithdraw();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [totalDeposited, totalBorrowed, totalLoans, availLiquidity] = (stats as [bigint, bigint, bigint, bigint] | undefined) ?? [0n, 0n, 0n, 0n];
  const myDepositVal = (myDeposit as bigint) ?? 0n;

  const utilization = totalDeposited > 0n
    ? Number((totalBorrowed * 100n) / totalDeposited)
    : 0;

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h2 className="text-xl font-semibold text-zinc-300 mb-6">Connect your wallet to access the pool</h2>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Liquidity Pool</h1>
        <p className="mt-1 text-zinc-400 text-sm">
          Deposit MON to earn 5% interest on financed purchases. Your capital funds buyers&#39; credit.
        </p>
      </div>

      {/* Pool stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Deposited"
          value={`${formatEther(totalDeposited as bigint)} MON`}
        />
        <StatCard
          label="Total Borrowed"
          value={`${formatEther(totalBorrowed as bigint)} MON`}
        />
        <StatCard
          label="Available"
          value={`${formatEther((liquidity as bigint) ?? 0n)} MON`}
        />
        <StatCard
          label="Utilization"
          value={`${utilization}%`}
          sub={`${Number(totalLoans as bigint)} total loans`}
        />
      </div>

      {/* My position */}
      <div className="rounded-xl border border-violet-800 bg-violet-900/10 p-5">
        <p className="text-sm font-semibold text-violet-300 mb-4">My Position</p>
        <p className="text-3xl font-bold text-white">{formatEther(myDepositVal)} MON</p>
        <p className="text-xs text-zinc-500 mt-1">Deposited · earns proportional interest from loan repayments</p>
      </div>

      {/* Deposit */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
        <h2 className="font-semibold text-zinc-200">Deposit MON</h2>
        {depositSuccess ? (
          <p className="text-emerald-400 text-sm">Deposit confirmed!</p>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Amount in MON"
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
              />
              <button
                onClick={() => deposit(depositAmount)}
                disabled={depositPending || !depositAmount}
                className="rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors"
              >
                {depositPending ? "Confirming…" : "Deposit"}
              </button>
            </div>
            {depositError && (
              <p className="text-xs text-red-400">{depositError.message.split("\n")[0]}</p>
            )}
          </>
        )}
        <p className="text-xs text-zinc-600">
          Deposits can be withdrawn at any time, subject to available liquidity.
        </p>
      </div>

      {/* Withdraw */}
      {myDepositVal > 0n && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
          <h2 className="font-semibold text-zinc-200">Withdraw MON</h2>
          {withdrawSuccess ? (
            <p className="text-emerald-400 text-sm">Withdrawal confirmed!</p>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={formatEther(myDepositVal)}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Up to ${formatEther(myDepositVal)} MON`}
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                />
                <button
                  onClick={() => withdraw(withdrawAmount)}
                  disabled={withdrawPending || !withdrawAmount}
                  className="rounded-lg border border-zinc-600 px-5 py-2.5 font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  {withdrawPending ? "Confirming…" : "Withdraw"}
                </button>
                <button
                  onClick={() => withdraw(formatEther(myDepositVal))}
                  disabled={withdrawPending}
                  className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
                >
                  Max
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
