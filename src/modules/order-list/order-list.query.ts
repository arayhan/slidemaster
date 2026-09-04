import { useEffect, useState } from "react";
import { listOrders } from "@/services/order-service";
import type { Order } from "@/domain";

/** This surface's data access: loads the list once and reports its loading state. */
export function useOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void listOrders().then((next) => {
      if (cancelled) return;
      setOrders(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { orders, loading };
}
