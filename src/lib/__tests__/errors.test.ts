import { describe, it, expect } from "vitest";
import { parseContractError } from "../errors";

describe("parseContractError", () => {
  it("returns human-readable message for insufficientBorrowingPower", () => {
    const result = parseContractError(new Error("insufficient borrowing power"));
    expect(result).toBe("Insufficient borrowing power. Deposit more collateral in the Pool.");
  });

  it("is case-insensitive for borrowing power error", () => {
    const result = parseContractError(new Error("Insufficient borrowing power"));
    expect(result).toBe("Insufficient borrowing power. Deposit more collateral in the Pool.");
  });

  it("returns message for notEnoughFreeCollateral", () => {
    const result = parseContractError(new Error("Not enough free collateral"));
    expect(result).toBe("Insufficient collateral. Deposit more MON in the Pool.");
  });

  it("returns message for poolInsufficientLiquidity", () => {
    const result = parseContractError(new Error("Pool has insufficient liquidity"));
    expect(result).toBe("The pool doesn't have enough liquidity at the moment.");
  });

  it("returns message for listingNotActive", () => {
    const result = parseContractError(new Error("Listing not active"));
    expect(result).toBe("This listing is no longer active.");
  });

  it("returns message for sellerCannotOffer", () => {
    const result = parseContractError(new Error("Seller cannot make offer"));
    expect(result).toBe("You cannot make an offer on your own listing.");
  });

  it("returns message for useMakeOffer", () => {
    const result = parseContractError(new Error("Use makeOffer instead"));
    expect(result).toBe("You have enough balance — use 'Pay in Full'.");
  });

  it("returns message for noLoanNeeded", () => {
    const result = parseContractError(new Error("No loan needed"));
    expect(result).toBe("No loan needed for this amount.");
  });

  it("returns message for overpayment", () => {
    const result = parseContractError(new Error("Overpayment"));
    expect(result).toBe("Amount exceeds the remaining balance.");
  });

  it("returns message for notYourLoan", () => {
    const result = parseContractError(new Error("Not your loan"));
    expect(result).toBe("This loan is not yours.");
  });

  it("returns message for notYetDue", () => {
    const result = parseContractError(new Error("Not yet due"));
    expect(result).toBe("The loan is not overdue yet.");
  });

  it("returns message for loanNotActive", () => {
    const result = parseContractError(new Error("Loan not active"));
    expect(result).toBe("This loan is no longer active.");
  });

  it("returns message for collateralLocked", () => {
    const result = parseContractError(new Error("Collateral locked by active loans"));
    expect(result).toBe("Collateral locked by active loans. Repay your loans first.");
  });

  it("returns message for userRejected (lowercase)", () => {
    const result = parseContractError(new Error("user rejected the transaction"));
    expect(result).toBe("Transaction cancelled.");
  });

  it("returns message for userRejected (capitalized)", () => {
    const result = parseContractError(new Error("User rejected"));
    expect(result).toBe("Transaction cancelled.");
  });

  it("returns message for mustSendMON", () => {
    const result = parseContractError(new Error("Must send MON"));
    expect(result).toBe("You need to send MON to perform this action.");
  });

  it("falls back to the first line of the error message for unknown errors", () => {
    const result = parseContractError(new Error("Some unknown contract revert reason"));
    expect(result).toBe("Some unknown contract revert reason");
  });

  it("handles non-Error objects (strings)", () => {
    const result = parseContractError("Listing not active");
    expect(result).toBe("This listing is no longer active.");
  });

  it("truncates long unknown messages to 120 chars", () => {
    const longMsg = "x".repeat(200);
    const result = parseContractError(new Error(longMsg));
    expect(result.length).toBeLessThanOrEqual(120);
  });

  it("uses provided translations when available", () => {
    const fakeTranslations = {
      errors: {
        listingNotActive: "Anúncio inativo.",
      },
    };
    const result = parseContractError(
      new Error("Listing not active"),
      fakeTranslations as never
    );
    expect(result).toBe("Anúncio inativo.");
  });
});
