import { describe, expect, it } from "vitest";
import { getOrder, listOrders, saveOrder } from "./order-service";

// The service keeps module-level state (a fake in-memory data layer), so tests read
// the current list before mutating instead of assuming a pristine seed.
describe("order-service", () => {
  it("lists the seeded orders", async () => {
    const orders = await listOrders();
    expect(orders.length).toBeGreaterThanOrEqual(2);
    expect(orders.map((o) => o.item)).toEqual(expect.arrayContaining(["Keyboard", "Monitor"]));
  });

  it("saveOrder without an id creates a draft", async () => {
    const order = await saveOrder({ item: "Mouse", qty: 3 });
    expect(order).toMatchObject({ item: "Mouse", qty: 3, status: "draft" });
    expect(order.id).toBeTruthy();
  });

  it("saveOrder with an id updates in place and keeps the id", async () => {
    const created = await saveOrder({ item: "Desk", qty: 1 });
    const updated = await saveOrder({ item: "Desk", qty: 4 }, created.id);
    expect(updated.id).toBe(created.id);
    expect(updated.qty).toBe(4);
    expect(await getOrder(created.id)).toMatchObject({ qty: 4 });
  });

  it("getOrder returns null for an unknown id", async () => {
    expect(await getOrder("nope")).toBeNull();
  });
});
