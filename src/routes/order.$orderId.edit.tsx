import { createFileRoute, useParams } from "@tanstack/react-router";
import { OrderFormPage } from "../modules/order-form";

export const Route = createFileRoute("/order/$orderId/edit")({
  component: OrderEditRoute,
});

function OrderEditRoute() {
  const { orderId } = useParams({ from: "/order/$orderId/edit" });
  return <OrderFormPage orderId={orderId} />;
}
