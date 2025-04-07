import { z } from "zod";

export const IDSchema = z
  .string()
  .regex(/^[a-zA-Z0-9-_.]+$/)
  .min(1)
  .max(256)
  .describe("The object ID.");

export const PaginationSchema = z.object({
  page: z.number().min(1).describe("The page number.").default(1).optional(),
  page_size: z
    .number()
    .min(1)
    .describe("The page size.")
    .default(30)
    .optional(),
  search: z.string().describe("The search query.").optional(),
});

const GetPublishedServiceSchema = z
  .object({
    service_id: IDSchema.describe("The service ID."),
    gateway_group_id: IDSchema.describe("The gateway group ID."),
  })
  .or(
    z
      .object({
        gateway_group_id: IDSchema.describe("The gateway group ID."),
      })
      .merge(PaginationSchema)
  )
  .optional();

const GetServiceTemplateSchema = z
  .object({
    service_template_id: IDSchema.describe("The service template ID."),
  })
  .or(PaginationSchema)
  .optional();

const GetUpstreamSchema = z
  .object({
    upstream_id: IDSchema.optional().describe("The upstream ID."),
    service_id: IDSchema.describe("The service ID."),
    gateway_group_id: IDSchema.describe("The gateway group ID."),
  })
  .optional();

const GetRouteSchema = z
  .object({
    service_id: IDSchema.optional().describe("The service ID."),
    route_id: IDSchema.describe("The route ID."),
    gateway_group_id: IDSchema.describe("The gateway group ID."),
  })
  .or(
    z
      .object({
        gateway_group_id: IDSchema.describe("The gateway group ID."),
      })
      .merge(PaginationSchema)
  )
  .optional();

const GetStreamRouteSchema = z
  .object({
    service_id: IDSchema.optional().describe("The service ID."),
    route_id: IDSchema.describe("The route ID."),
    gateway_group_id: IDSchema.describe("The gateway group ID."),
  })
  .or(
    z
      .object({
        gateway_group_id: IDSchema.describe("The gateway group ID."),
      })
      .merge(PaginationSchema)
  )
  .optional();

  const SecretProviderSchema = z.object({
    type:z.enum(["vault","kubernetes","aws"]),
    secret_provider_id: IDSchema.describe("The secret provider ID."),
    gateway_group_id: IDSchema.describe("The gateway group ID."),
  }).or(z.object({
    type:z.enum(["vault","kubernetes","aws"]),
    gateway_group_id: IDSchema.describe("The gateway group ID."),
  }).merge(PaginationSchema))
  .optional();

  const CertificateSchema = z.object({
    certificate_id: IDSchema.describe("The certificate ID."),
    gateway_group_id: IDSchema.describe("The gateway group ID."),
  }).or(z.object({
    gateway_group_id: IDSchema.describe("The gateway group ID."),
  }).merge(PaginationSchema))
  .optional();

  const ConsumerSchema = z.object({
    username: z.string().describe("The consumer username."),
    gateway_group_id: IDSchema.describe("The gateway group ID."),
  }).or(z.object({
    gateway_group_id: IDSchema.describe("The gateway group ID."),
  }).merge(PaginationSchema))
  .optional();

  const CredentialSchema = z.object({
    credential_id: IDSchema.describe("The credential ID."),
    username: IDSchema.describe("The credential ID."),
    gateway_group_id: IDSchema.describe("The gateway group ID."),
  }).or(z.object({
    username: IDSchema.describe("The credential ID."),
    gateway_group_id: IDSchema.describe("The gateway group ID."),
  }).merge(PaginationSchema))
  .optional();

  const GatewayGroupSchema = z.object({
    gateway_group_id: IDSchema.describe("The gateway group ID."),
  }).or(PaginationSchema)
  .optional();

export const GetResourceSchema = z.object({
  publishedService: GetPublishedServiceSchema,
  serviceTemplate: GetServiceTemplateSchema,
  upstream: GetUpstreamSchema,
  route: GetRouteSchema,
  stream_route: GetStreamRouteSchema,
  secretProvider: SecretProviderSchema,
  certificate: CertificateSchema,
  consumer: ConsumerSchema,
  credential: CredentialSchema,
  gatewayGroup: GatewayGroupSchema,
});
