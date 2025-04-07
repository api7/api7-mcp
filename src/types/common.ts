import { z } from "zod";

export const IDSchema = z
  .string()
  .regex(/^[a-zA-Z0-9-_.]+$/)
  .min(1)
  .max(256)
  .describe("The object ID.");
