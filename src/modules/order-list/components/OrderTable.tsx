import { Link } from "@tanstack/react-router";
import type { Order } from "@/domain";

// Only order-list renders this, so it lives inside order-list. It moves down to
// src/components/ the day a SECOND surface needs it — not before.
// See docs/architecture.md > "Module-owned components".
export function OrderTable({ orders }: { orders: Order[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Item</th>
          <th scope="col">Qty</th>
          <th scope="col">Status</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{order.item}</td>
            <td>{order.qty}</td>
            <td>{order.status}</td>
            <td>
              <Link to="/order/$orderId" params={ { orderId: order.id } }>
                View
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
