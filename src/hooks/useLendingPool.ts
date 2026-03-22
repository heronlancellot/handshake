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

export function useMyCollateral(address?: string) {
  return useReadContract({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    functionName: "collateral",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });
}

export function useMyActiveDebt(address?: string) {
  return useReadContract({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    functionName: "activeDebt",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });
}

export function useBorrowingPower(address?: string) {
  return useReadContract({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    functionName: "borrowingPower",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });
}

export function useFreeCollateral(address?: string) {
  return useReadContract({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    functionName: "freeCollateral",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
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

// -----------------------------------------------------------------------
// Writes
// -----------------------------------------------------------------------

export function useDepositCollateral() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const depositCollateral = (amountEth: string) => {
    writeContract({
      address: LENDING_POOL_ADDRESS,
      abi: LENDING_POOL_ABI,
      functionName: "depositCollateral",
      value: parseEther(amountEth),
    });
  };

  return { depositCollateral, isPending: isPending || isConfirming, isSuccess, error, hash };
}

export function useWithdrawCollateral() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdrawCollateral = (amountEth: string) => {
    writeContract({
      address: LENDING_POOL_ADDRESS,
      abi: LENDING_POOL_ABI,
      functionName: "withdrawCollateral",
      args: [parseEther(amountEth)],
    });
  };

  return { withdrawCollateral, isPending: isPending || isConfirming, isSuccess, error, hash };
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

export function useLiquidate() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const liquidate = (loanId: number) => {
    writeContract({
      address: LENDING_POOL_ADDRESS,
      abi: LENDING_POOL_ABI,
      functionName: "liquidate",
      args: [BigInt(loanId)],
    });
  };

  return { liquidate, isPending: isPending || isConfirming, isSuccess, error, hash };
}
