// Example service -- delete alongside the order-* modules when real features start.
// Shared by every order surface (list, detail, form). It lives here rather than in
// one of those modules because all three need it, and modules never import each
// other. See docs/architecture.md > "One concept, several surfaces".
import type { Order, OrderInput } from "@/domain";

// Fake in-memory data layer; swap for a real API client without touching callers.
let orders: Order[] = [
  { id: "1", item: "Keyboard", qty: 1, status: "submitted" },
  { id: "2", item: "Monitor", qty: 2, status: "draft" },
];

const io = () => new Promise((resolve) => setTimeout(resolve, 50));

export async function listOrders(): Promise<Order[]> {
  await io();
  return [...orders];
}

export async function getOrder(id: string): Promise<Order | null> {
  await io();
  return orders.find((order) => order.id === id) ?? null;
}

/** Create when `id` is absent, update when it is present — one path, like the editor. */
export async function saveOrder(input: OrderInput, id?: string): Promise<Order> {
  await io();
  if (id) {
    const existing = orders.find((order) => order.id === id);
    if (!existing) throw new Error(`No order ${id}`);
    const updated: Order = { ...existing, ...input };
    orders = orders.map((order) => (order.id === id ? updated : order));
    return updated;
  }
  const created: Order = { id: String(Date.now()), status: "draft", ...input };
  orders = [...orders, created];
  return created;
}
