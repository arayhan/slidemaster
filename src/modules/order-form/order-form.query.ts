import { useEffect, useState } from "react";
import { getOrder, saveOrder } from "@/services/order-service";
import type { Order, OrderInput } from "@/domain";

/**
 * One hook for create and edit. `orderId` absent means create; present means load
 * the existing order first and save back over it — the same fields and the same
 * rules either way, which is why there is no separate order-create module.
 */
export function useOrderForm(orderId?: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    void getOrder(orderId).then((next) => {
      if (cancelled) return;
      setOrder(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const save = async (input: OrderInput): Promise<Order> => {
    setSaving(true);
    try {
      return await saveOrder(input, orderId);
    } finally {
      setSaving(false);
    }
  };

  return { order, loading, saving, save, mode: orderId ? ("edit" as const) : ("create" as const) };
}
