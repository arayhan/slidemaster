// Example vocabulary -- delete alongside the order-* modules when real features start.
// Naming convention: docs/architecture.md > "Module file naming".

export type TransactionKind = "charge" | "refund";

export interface Transaction {
  id: string;
  /**
   * THE RELATION. Order and Transaction know about each other here, in the one
   * layer that is allowed to hold shared vocabulary — not by one feature module
   * importing another. See architecture.md > "Relating two concepts".
   */
  orderId: string;
  kind: TransactionKind;
  amountCents: number;
}

/** Signed value, so a mixed list of charges and refunds can just be summed. */
export function signedAmountCents(transaction: Transaction): number {
  return transaction.kind === "refund" ? -transaction.amountCents : transaction.amountCents;
}

export function totalCents(transactions: Transaction[]): number {
  return transactions.reduce((sum, transaction) => sum + signedAmountCents(transaction), 0);
}
