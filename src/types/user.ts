import { z } from "zod";
import { IDSchema } from "./common.js";

export const GetUserIdByUsernameSchema = z.object({
  username: z.string().optional().describe("username"),
});

export const GetRoleByUserIdSchema = z.object({
  id: IDSchema.optional(),
});
