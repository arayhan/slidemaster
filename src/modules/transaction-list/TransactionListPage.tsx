import { Link } from "@tanstack/react-router";
import { useTransactionList } from "./transaction-list.query";
import { totalCents } from "@/domain";

export function TransactionListPage() {
  const { transactions, loading } = useTransactionList();

  if (loading) return <p>Loading transactions…</p>;

  return (
    <>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            {transaction.kind} — {(transaction.amountCents / 100).toFixed(2)}{" "}
            {/* The relation again, read from the other side: a transaction knows its
                order's id, so linking to that order needs no import from order-*. */}
            <Link to="/order/$orderId" params={ { orderId: transaction.orderId } }>
              order {transaction.orderId}
            </Link>
          </li>
        ))}
      </ul>
      <p>Net: {(totalCents(transactions) / 100).toFixed(2)}</p>
    </>
  );
}
