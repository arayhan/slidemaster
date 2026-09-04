import { createFileRoute } from "@tanstack/react-router";
import { TransactionListPage } from "../modules/transaction-list";

export const Route = createFileRoute("/transaction")({
  component: TransactionListPage,
});
