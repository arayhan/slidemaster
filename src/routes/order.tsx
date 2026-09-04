import { Outlet, createFileRoute } from "@tanstack/react-router";
import { OrderShell } from "../components/OrderShell";

// Layout route for every /order/* surface. Thin by design: it composes, it does
// not contain feature logic. See docs/architecture.md > "The import rules".
export const Route = createFileRoute("/order")({
  component: () => (
    <OrderShell>
      <Outlet />
    </OrderShell>
  ),
});
