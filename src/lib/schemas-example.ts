// Example only -- delete once you have real schemas.
import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

export type User = z.infer<typeof userSchema>;
