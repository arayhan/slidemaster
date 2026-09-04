import { createFileRoute } from "@tanstack/react-router";
import { OrderListPage } from "../modules/order-list";

export const Route = createFileRoute("/order/")({
  component: OrderListPage,
});
