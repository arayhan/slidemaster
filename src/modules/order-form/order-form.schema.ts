// Example schema -- delete alongside the order-* modules when real features start.
// One definition of "valid", imported by both the form component and the mutation,
// so what the user is told and what the write enforces cannot drift apart.
// See docs/architecture.md > "Form schemas".
import { z } from "zod";

export const orderFormSchema = z.object({
  item: z.string().min(1, "Item is required"),
  qty: z.coerce.number().int().min(1, "Qty must be at least 1"),
});

// Derived, never hand-declared twice.
export type OrderFormValues = z.infer<typeof orderFormSchema>;
