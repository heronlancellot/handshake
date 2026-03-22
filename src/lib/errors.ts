import type { Translations } from "./i18n/en";

export function parseContractError(error: unknown, t?: Translations): string {
  const msg = error instanceof Error ? error.message : String(error);
  const e = t?.errors;

  if (msg.includes("insufficient borrowing power") || msg.includes("Insufficient borrowing power"))
    return e?.insufficientBorrowingPower ?? "Insufficient borrowing power. Deposit more collateral in the Pool.";
  if (msg.includes("Not enough free collateral"))
    return e?.notEnoughFreeCollateral ?? "Insufficient collateral. Deposit more MON in the Pool.";
  if (msg.includes("Pool has insufficient liquidity"))
    return e?.poolInsufficientLiquidity ?? "The pool doesn't have enough liquidity at the moment.";
  if (msg.includes("Listing not active"))
    return e?.listingNotActive ?? "This listing is no longer active.";
  if (msg.includes("Seller cannot make offer"))
    return e?.sellerCannotOffer ?? "You cannot make an offer on your own listing.";
  if (msg.includes("Use makeOffer instead"))
    return e?.useMakeOffer ?? "You have enough balance — use 'Pay in Full'.";
  if (msg.includes("No loan needed"))
    return e?.noLoanNeeded ?? "No loan needed for this amount.";
  if (msg.includes("Overpayment"))
    return e?.overpayment ?? "Amount exceeds the remaining balance.";
  if (msg.includes("Not your loan"))
    return e?.notYourLoan ?? "This loan is not yours.";
  if (msg.includes("Not yet due"))
    return e?.notYetDue ?? "The loan is not overdue yet.";
  if (msg.includes("Loan not active"))
    return e?.loanNotActive ?? "This loan is no longer active.";
  if (msg.includes("Collateral locked by active loans"))
    return e?.collateralLocked ?? "Collateral locked by active loans. Repay your loans first.";
  if (msg.includes("User rejected") || msg.includes("user rejected"))
    return e?.userRejected ?? "Transaction cancelled.";
  if (msg.includes("Must send MON"))
    return e?.mustSendMON ?? "You need to send MON to perform this action.";

  return msg.split("\n")[0].slice(0, 120);
}
