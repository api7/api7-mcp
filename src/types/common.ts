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
}).passthrough().describe("The pagination and search parameters.");

const GetPublishedServiceSchema = z.object({
  service_id: IDSchema.describe("The service ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve published service resources.");

const GetServiceTemplateSchema = z.object({
  service_template_id: IDSchema.describe("The service template ID.").optional(),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve service template resources.");

const GetUpstreamSchema = z.object({
  upstream_id: IDSchema.optional().describe("The upstream ID."),
  published_service_id: IDSchema.describe("The published service ID."),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).optional().describe("Pass this parameter to retrieve upstream resources.");

const GetRouteSchema = z.object({
  service_id: IDSchema.describe("The service ID."),
  route_id: IDSchema.describe("The route ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve route resources.");

const GetStreamRouteSchema = z.object({
  service_id: IDSchema.describe("The service ID."),
  route_id: IDSchema.describe("The route ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve stream route resources.");

const SecretProviderSchema = z.object({
  type: z.enum(["vault", "kubernetes", "aws"]),
  secret_provider_id: IDSchema.describe("The secret provider ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve secret provider resources.");

const CertificateSchema = z.object({
  certificate_id: IDSchema.describe("The certificate ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve certificate resources.");

const ConsumerSchema = z.object({
  username: z.string().describe("The consumer username.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve consumer resources.");

const CredentialSchema = z.object({
  credential_id: IDSchema.describe("The credential ID.").optional(),
  username: IDSchema.describe("The credential ID."),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve credential resources.");

const GatewayGroupSchema = z.object({
  gateway_group_id: IDSchema.describe("The gateway group ID.").optional(),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve gateway group resources.");

const CaCertificateSchema = z.object({
  ca_certificate_id: IDSchema.describe("The CA certificate ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve CA certificate resources.");

const SniSchema = z.object({
  sni_id: IDSchema.describe("The SNI ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve SNI resources.");

const GlobalRulesSchema = z.object({
  rule_id: IDSchema.describe("The rule ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve global rules resources.");

const PluginMetadataSchema = z.object({
  plugin_name: z.string().describe("The plugin name."),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve plugin metadata resources.");

const GatewayInstanceSchema = z.object({
  gateway_group_id: IDSchema.describe("The gateway group ID.").optional(),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve gateway instance resources.");

const ServiceRegistrySchema = z.object({
  service_registry_id: IDSchema.describe("The service registry ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve service registry resources.");

const CustomPluginSchema = z.object({
  custom_plugin_id: IDSchema.describe("The custom plugin ID.").optional(),
  gateway_group_id: IDSchema.describe("The gateway group ID."),
}).merge(PaginationSchema).optional().describe("Pass this parameter to retrieve custom plugin resources.");

export const GetResourceSchema = z.object({
  publishedService: GetPublishedServiceSchema,
  serviceTemplate: GetServiceTemplateSchema,
  upstream: GetUpstreamSchema,
  route: GetRouteSchema,
  streamRoute: GetStreamRouteSchema,
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
