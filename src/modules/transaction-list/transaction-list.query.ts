import { useEffect, useState } from "react";
import { listTransactions } from "@/services/transaction-service";
import type { Transaction } from "@/domain";

export function useTransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void listTransactions().then((next) => {
      if (cancelled) return;
      setTransactions(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { transactions, loading };
}
