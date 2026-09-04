// Example service -- delete alongside the order-* modules when real features start.
// Read by BOTH transaction-list (its own surface) and order-detail (an order's
// transactions). That second caller is why the cross-concept read lives here and
// not inside a module: order-detail must never import modules/transaction-list.
// See docs/architecture.md > "Relating two concepts".
import type { Transaction } from "@/domain";

const transactions: Transaction[] = [
  { id: "t1", orderId: "1", kind: "charge", amountCents: 12900 },
  { id: "t2", orderId: "1", kind: "refund", amountCents: 2000 },
  { id: "t3", orderId: "2", kind: "charge", amountCents: 45000 },
];

const io = () => new Promise((resolve) => setTimeout(resolve, 50));

export async function listTransactions(): Promise<Transaction[]> {
  await io();
  return [...transactions];
}

export async function listTransactionsForOrder(orderId: string): Promise<Transaction[]> {
  await io();
  return transactions.filter((transaction) => transaction.orderId === orderId);
}
