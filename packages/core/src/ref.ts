import { z } from "zod";

/** A named reference to a function the consuming application registers. */
export const refSchema = z.strictObject({ ref: z.string().min(1) });

export type Ref = z.infer<typeof refSchema>;

export function isRef(value: unknown): value is Ref {
  return refSchema.safeParse(value).success;
}
