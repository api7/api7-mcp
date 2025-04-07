import { z } from "zod";
import { IDSchema } from "./common.js";

const BaseCondition = z.object({
  type: z.enum(["MatchLabel"]),
  options: z.object({
    key: z.string(),
    operator: z.enum(["exact_match", "contains_string", "present"]),
    value: z.string(),
  }),
});

const GatewayGroupCondition = z.object({
  gateway_group_label: BaseCondition,
});

const ServiceCondition = z.object({
  service_label: BaseCondition,
});

const PermissionPolicyCondition = z.object({
  permission_policy_label: BaseCondition,
});

const PublishedServiceCondition = z.object({
  gateway_group_label: BaseCondition,
  service_label: BaseCondition,
});

const RoleCondition = z.object({
  role_label: BaseCondition,
});

const UserCondition = z.object({
  user_label: BaseCondition,
  permission_boundaries: z.object({
    type: z.enum(["AllOfStrings"]),
    options: z.array(z.string()),
  }),
});

const ConsumerCondition = z.object({
  gateway_group_label: BaseCondition,
  consumer_label: BaseCondition,
});

const SecretCondition = z.object({
  gateway_group_label: BaseCondition,
  secret_provider_label: BaseCondition,
});

const ContactPointCondition = z.object({
  contact_point_label: BaseCondition,
});

const AlertPolicyCondition = z.object({
  alert_policy_label: BaseCondition,
});

const DeveloperCondition = z.object({
  developer_label: BaseCondition,
});

const APIProductCondition = z.object({
  api_product_label: BaseCondition,
});

const CaCertificateCondition = z.object({
  ca_certificate_label: BaseCondition,
});

const CertificateCondition = z.object({
  certificate_label: BaseCondition,
});

const SniCondition = z.object({
  sni_label: BaseCondition,
});

const Statement = z.object({
  effect: z.enum(["allow", "deny"]),
  resources: z.array(z.string()).min(1),
  actions: z.array(z.string()).min(1),
  conditions: z
    .union([
      GatewayGroupCondition,
      ServiceCondition,
      PermissionPolicyCondition,
      PublishedServiceCondition,
      RoleCondition,
      UserCondition,
      ConsumerCondition,
      SecretCondition,
      ContactPointCondition,
      AlertPolicyCondition,
      DeveloperCondition,
      APIProductCondition,
      CaCertificateCondition,
      CertificateCondition,
      SniCondition,
    ])
    .optional(),
});

const PolicyDocument = z.object({
  statement: z.array(Statement).min(1),
});

const PermissionPolicySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["built_in", "custom"]).optional().default("custom"),
  desc: z.string().max(65536).optional(),
  labels: z
    .record(z.string().min(1).max(65536), z.string().min(1).max(65536))
    .optional(),
  policy_document: PolicyDocument,
});

export const CreatePermissionPolicySchema = z.object({
  permissionPolicy: PermissionPolicySchema,
  alreadyReadPermissionPolicyConfig: z.boolean(),
});

export const GetPermissionPolicySchema = z.object({
  id: IDSchema.optional(),
  search: z.string().optional(),
});

export const UpdatePermissionPolicySchema = z.object({
  id: IDSchema,
  permissionPolicy: PermissionPolicySchema,
  alreadyReadPermissionPolicyConfig: z.boolean(),
});

export const DeletePermissionPolicySchema = z.object({
  id: IDSchema,
});

export const GetPermissionPolicyByRoleSchema = z.object({
  id: IDSchema,
});

export const AttachPermissionPolicyToRoleSchema = z.object({
  id: IDSchema,
  permissionPolicyId: z.array(IDSchema),
});

export const DetachPermissionPolicyFromRoleSchema = z.object({
  id: IDSchema,
  permissionPolicyId: z.array(IDSchema),
});
