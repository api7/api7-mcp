import { z } from "zod";
import { IDSchema } from "./common.js";

const RoleSchema = z.object({
  name: z.string().min(1).max(256).describe("The role name."),
  desc: z.string().max(65536).describe("The object description.").optional(),
  labels: z.record(z.string().regex(/^.+$/).min(1).max(65536)).describe("The labels of the object.").optional(),
  policies: z
    .array(
      z
        .string()
        .regex(/^[a-zA-Z0-9-_.]+$/)
        .max(256)
        .describe("The object ID.")
    )
    .describe("The polices attached to the role."),
});

export const GetRoleSchema = z.object({
  id: IDSchema.optional(),
  search: z.string().optional().describe("The search query."),
});

export const CreateRoleSchema = z.object({
  role: RoleSchema,
});

export const UpdateAssignedRolesForUserSchema = z.object({
  user_id: IDSchema,
  roles: z.array(IDSchema).describe("The roles to assign to the user."),
});

export const DeleteRoleSchema = z.object({
  id: IDSchema,
});

z.object({
  code: z.string()
})