import { useEffect, useState } from "react";
import { getOrder } from "@/services/order-service";
import { listTransactionsForOrder } from "@/services/transaction-service";
import type { Order, Transaction } from "@/domain";

/**
 * Reads TWO concepts. Note what it does not do: it never imports
 * modules/transaction-list, even though that surface also shows transactions.
 * The relation lives on the entity (domain/transaction.ts declares orderId) and the
 * read goes through a service. See docs/architecture.md > "Relating two concepts".
 */
export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void Promise.all([getOrder(orderId), listTransactionsForOrder(orderId)]).then(
      ([nextOrder, nextTransactions]) => {
        if (cancelled) return;
        setOrder(nextOrder);
        setTransactions(nextTransactions);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return { order, transactions, loading };
}
