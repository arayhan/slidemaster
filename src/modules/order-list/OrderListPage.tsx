import { Link } from "@tanstack/react-router";
import { useOrderList } from "./order-list.query";
import { OrderTable } from "./components/OrderTable";

export function OrderListPage() {
  const { orders, loading } = useOrderList();

  if (loading) return <p>Loading orders…</p>;

  return (
    <>
      <p>
        <Link to="/order/new">New order</Link>
      </p>
      {orders.length === 0 ? <p>No orders yet.</p> : <OrderTable orders={orders} />}
    </>
  );
}
