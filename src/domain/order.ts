// Example vocabulary -- delete alongside the order-* modules when real features start.
// Naming convention: docs/architecture.md > "Module file naming".
// This is the bottom of the import graph: it names the concept and the rules that
// are true about it everywhere, and imports nothing from the layers above it.

export type OrderStatus = "draft" | "submitted";

export interface Order {
  id: string;
  item: string;
  qty: number;
  status: OrderStatus;
}

/** What a caller supplies to create or update one — the id is the store's to assign. */
export type OrderInput = Omit<Order, "id" | "status">;

/**
 * A rule about orders, not about any one screen. It lives here so the list, the
 * detail view and the editor all agree on it without importing each other.
 */
export function canSubmit(order: Order): boolean {
  return order.status === "draft" && order.qty > 0;
}
