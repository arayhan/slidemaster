import { createFileRoute, useParams } from "@tanstack/react-router";
import { OrderDetailPage } from "../modules/order-detail";

export const Route = createFileRoute("/order/$orderId/")({
  component: OrderDetailRoute,
});

function OrderDetailRoute() {
  const { orderId } = useParams({ from: "/order/$orderId/" });
  return <OrderDetailPage orderId={orderId} />;
}
