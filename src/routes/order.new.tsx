import { createFileRoute } from "@tanstack/react-router";
import { OrderFormPage } from "../modules/order-form";

export const Route = createFileRoute("/order/new")({
  component: () => <OrderFormPage />,
});
