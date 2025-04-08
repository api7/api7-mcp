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

const GetPublishedServiceSchema = z.object({
  service_id: IDSchema.describe("The service ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional();

const GetServiceTemplateSchema = z.object({
  service_template_id: IDSchema.describe("The service template ID.").optional(),
}).merge(PaginationSchema).optional();

const GetUpstreamSchema = z.object({
  upstream_id: IDSchema.optional().describe("The upstream ID."),
  service_id: IDSchema.describe("The service ID."),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).optional();

const GetRouteSchema = z.object({
  service_id: IDSchema.describe("The service ID."),
  route_id: IDSchema.describe("The route ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional();

const GetStreamRouteSchema = z.object({
  service_id: IDSchema.describe("The service ID."),
  route_id: IDSchema.describe("The route ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional();

const SecretProviderSchema = z.object({
  type: z.enum(["vault", "kubernetes", "aws"]),
  secret_provider_id: IDSchema.describe("The secret provider ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional();

const CertificateSchema = z.object({
  certificate_id: IDSchema.describe("The certificate ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional();

const ConsumerSchema = z.object({
  username: z.string().describe("The consumer username.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional();

const CredentialSchema = z.object({
  credential_id: IDSchema.describe("The credential ID.").optional(),
  username: IDSchema.describe("The credential ID."),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional();

const GatewayGroupSchema = z.object({
  gateway_group_id: IDSchema.describe("The gateway group ID.").optional(),
}).merge(PaginationSchema).optional();

const CaCertificateSchema = z.object({
  ca_certificate_id: IDSchema.describe("The CA certificate ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional();

const SniSchema = z.object({
  sni_id: IDSchema.describe("The SNI ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional();

const GlobalRulesSchema = z.object({
  rule_id: IDSchema.describe("The rule ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional();

const PluginMetadataSchema = z.object({
  plugin_name: z.string().describe("The plugin name."),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
  status: z.enum(["Healthy", "OutOfSync", "LostConnection", "Offline"]).describe("The status."),
}).merge(PaginationSchema).optional();

const GatewayInstanceSchema = z.object({
  gateway_group_id: IDSchema.describe("The gateway group ID.").optional(),
}).merge(PaginationSchema).optional();

const ServiceRegistrySchema = z.object({
  service_registry_id: IDSchema.describe("The service registry ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional();

const CustomPluginSchema = z.object({
  custom_plugin_id: IDSchema.describe("The custom plugin ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional();

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
  caCertificate: CaCertificateSchema,
  sni: SniSchema,
  globalRules: GlobalRulesSchema,
  pluginMetadata: PluginMetadataSchema,
  gatewayInstance: GatewayInstanceSchema,
  serviceRegistry: ServiceRegistrySchema,
  customPlugin: CustomPluginSchema,
});
