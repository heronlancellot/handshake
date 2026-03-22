"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { LENDING_POOL_ADDRESS, LENDING_POOL_ABI, LOAN_STATUS } from "@/src/lib/lendingPool";

export { formatEther, parseEther, LOAN_STATUS };

// -----------------------------------------------------------------------
// Reads
// -----------------------------------------------------------------------

export function usePoolStats() {
  return useReadContract({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    functionName: "getPoolStats",
  });
}

export function useMyDeposit(address?: string) {
  return useReadContract({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    functionName: "deposits",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });
}

export function useAvailableLiquidity() {
  return useReadContract({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    functionName: "getAvailableLiquidity",
  });
}

export function useUserLoanIds(address?: string) {
  return useReadContract({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    functionName: "getUserLoanIds",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });
}

export function useLoan(loanId: number) {
  return useReadContract({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    functionName: "loans",
    args: [BigInt(loanId)],
    query: { enabled: loanId > 0 },
  });
}

export function useIsDefaulter(address?: string) {
  return useReadContract({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    functionName: "isDefaulter",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });
}

// -----------------------------------------------------------------------
// Writes
// -----------------------------------------------------------------------

export function useDeposit() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = (amountEth: string) => {
    writeContract({
      address: LENDING_POOL_ADDRESS,
      abi: LENDING_POOL_ABI,
      functionName: "deposit",
      value: parseEther(amountEth),
    });
  };

  return { deposit, isPending: isPending || isConfirming, isSuccess, error, hash };
}

export function useWithdraw() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = (amountEth: string) => {
    writeContract({
      address: LENDING_POOL_ADDRESS,
      abi: LENDING_POOL_ABI,
      functionName: "withdraw",
      args: [parseEther(amountEth)],
    });
  };

  return { withdraw, isPending: isPending || isConfirming, isSuccess, error, hash };
}

export function useRepayLoan() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const repayLoan = (loanId: number, amountEth: string) => {
    writeContract({
      address: LENDING_POOL_ADDRESS,
      abi: LENDING_POOL_ABI,
      functionName: "repayLoan",
      args: [BigInt(loanId)],
      value: parseEther(amountEth),
    });
  };

  return { repayLoan, isPending: isPending || isConfirming, isSuccess, error, hash };
}

export function useMarkDefault() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const markDefault = (loanId: number) => {
    writeContract({
      address: LENDING_POOL_ADDRESS,
      abi: LENDING_POOL_ABI,
      functionName: "markDefault",
      args: [BigInt(loanId)],
    });
  };

  return { markDefault, isPending: isPending || isConfirming, isSuccess, error, hash };
}
