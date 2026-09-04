import { useState, type FormEvent } from "react";
import { orderFormSchema } from "../order-form.schema";
import type { Order, OrderInput } from "@/domain";

// Only order-form renders this. It stays inside the module until a second surface
// needs it. See docs/architecture.md > "Module-owned components".
export function OrderForm({
  order,
  saving,
  onSubmit,
}: {
  order: Order | null;
  saving: boolean;
  onSubmit: (input: OrderInput) => void;
}) {
  const [item, setItem] = useState(order?.item ?? "");
  const [qty, setQty] = useState(String(order?.qty ?? 1));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    // The schema is the only validation authority — see order-form.schema.ts.
    const parsed = orderFormSchema.safeParse({ item, qty });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  };

  return (
    <form onSubmit={submit}>
      <p>
        <label htmlFor="item">Item</label>
        <input id="item" value={item} onChange={(event) => setItem(event.target.value)} />
        {errors.item ? <span role="alert">{errors.item}</span> : null}
      </p>
      <p>
        <label htmlFor="qty">Qty</label>
        <input id="qty" type="number" min={1} value={qty} onChange={(event) => setQty(event.target.value)} />
        {errors.qty ? <span role="alert">{errors.qty}</span> : null}
      </p>
      <button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save order"}
      </button>
    </form>
  );
}
