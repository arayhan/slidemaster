// Shared business rules — bottom of the import graph, dependency-light.
// See docs/architecture.md#domain-sits-at-the-bottom before adding a dependency here.
export type { Order, OrderInput, OrderStatus } from "./order";
export { canSubmit } from "./order";
export type { Transaction, TransactionKind } from "./transaction";
export { signedAmountCents, totalCents } from "./transaction";
