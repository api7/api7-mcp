import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GetResourceSchema, SendRequestSchema } from "../types/common.js";
import makeAPIRequest from "../request.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { GATEWAY_SERVER_URL } from "../env.js";
type RequestConfig = z.infer<typeof SendRequestSchema>["requests"][number];

const setupCommonTools = (server: McpServer) => {
  server.tool(
    "get_resource",
    `Get resource details by ID or list resources based on filters, support resources: ${Object.keys(
      GetResourceSchema.shape
    ).join(", ")}`,
    GetResourceSchema.shape,
    async (args) => {
      const result: CallToolResult = {
        content: [],
      };
      const keys = Object.keys(args);
      if (keys.length === 0) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "No resource parameters passed in",
            },
          ],
        };
      }

      const results: CallToolResult[] = [];
      for (const key of keys) {
        switch (key) {
          case "publishedService":
            if (
              args?.publishedService &&
              "service_id" in args.publishedService
            ) {
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/services/${args.publishedService.service_id}`,
                  method: "GET",
                  params: {
                    gateway_group_id: args.publishedService.gateway_group_id,
                  },
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/apisix/admin/services",
                  method: "GET",
                  params: args.publishedService,
                })
              );
            }
            break;
          case "upstream":
            if (args.upstream?.upstream_id) {
              const { published_service_id, upstream_id, ...rest } =
                args.upstream;
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/services/${published_service_id}/upstreams/${upstream_id}`,
                  method: "GET",
                  params: rest,
                })
              );
            } else {
              const { published_service_id, ...rest } = args.upstream!;
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/services/${published_service_id}/upstreams`,
                  method: "GET",
                  params: rest,
                })
              );
            }
            break;
          case "serviceTemplate":
            if (
              args?.serviceTemplate &&
              "service_template_id" in args.serviceTemplate
            ) {
              results.push(
                await makeAPIRequest({
                  url: `/api/services/template/${args.serviceTemplate.service_template_id}`,
                  method: "GET",
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/api/services/template",
                  method: "GET",
                  params: args.serviceTemplate,
                })
              );
            }
            break;
          case "route":
            if (args?.route && "route_id" in args.route) {
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/routes/${args.route.route_id}`,
                  method: "GET",
                  params: {
                    gateway_group_id: args.route.gateway_group_id,
                  },
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/apisix/admin/routes",
                  method: "GET",
                  params: args.route,
                })
              );
            }
            break;
          case "streamRoute":
            if (args?.streamRoute && "route_id" in args.streamRoute) {
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/stream_routes/${args.streamRoute.route_id}`,
                  method: "GET",
                  params: {
                    gateway_group_id: args.streamRoute.gateway_group_id,
                  },
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/apisix/admin/stream_routes",
                  method: "GET",
                  params: args.streamRoute,
                })
              );
            }
            break;
          case "secretProvider":
            if (
              args?.secretProvider &&
              "secret_provider_id" in args.secretProvider
            ) {
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/secret_providers/${args.secretProvider.secret_provider_id}`,
                  method: "GET",
                  params: {
                    gateway_group_id: args.secretProvider.gateway_group_id,
                  },
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/apisix/admin/secret_providers",
                  method: "GET",
                  params: args.secretProvider,
                })
              );
            }
            break;
          case "certificate":
            if (args?.certificate && "certificate_id" in args.certificate) {
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/certificates/${args.certificate.certificate_id}`,
                  method: "GET",
                  params: {
                    gateway_group_id: args.certificate.gateway_group_id,
                  },
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/apisix/admin/certificates",
                  method: "GET",
                  params: args.certificate,
                })
              );
            }
            break;
          case "consumer":
            if (args?.consumer && "username" in args.consumer) {
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/consumers/${args.consumer.username}`,
                  method: "GET",
                  params: {
                    gateway_group_id: args.consumer.gateway_group_id,
                  },
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/apisix/admin/consumers",
                  method: "GET",
                  params: {
                    ...args.consumer,
                    gateway_group_id: args.consumer?.gateway_group_id,
                  },
                })
              );
            }
            break;
          case "credential":
            if (args?.credential && "credential_id" in args.credential) {
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/consumers/${args.credential.username}/credentials/${args.credential.credential_id}`,
                  method: "GET",
                  params: {
                    gateway_group_id: args.credential.gateway_group_id,
                  },
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/consumers/${args.credential?.username}/credentials`,
                  method: "GET",
                  params: args.credential,
                })
              );
            }
            break;
          case "gatewayGroup":
            if (args?.gatewayGroup && "gateway_group_id" in args.gatewayGroup) {
              results.push(
                await makeAPIRequest({
                  url: `/api/gateway_groups/${args.gatewayGroup.gateway_group_id}`,
                  method: "GET",
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/api/gateway_groups",
                  method: "GET",
                  params: args.gatewayGroup,
                })
              );
            }
            break;
          case "caCertificate":
            if (
              args?.caCertificate &&
              "ca_certificate_id" in args.caCertificate
            ) {
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/ca_certificates/${args.caCertificate.ca_certificate_id}`,
                  method: "GET",
                  params: {
                    gateway_group_id: args.caCertificate.gateway_group_id,
                  },
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/apisix/admin/ca_certificates",
                  method: "GET",
                  params: args.caCertificate,
                })
              );
            }
            break;
          case "sni":
            if (args?.sni && "sni_id" in args.sni) {
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/snis/${args.sni.sni_id}`,
                  method: "GET",
                  params: {
                    gateway_group_id: args.sni.gateway_group_id,
                  },
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/apisix/admin/snis",
                  method: "GET",
                  params: args.sni,
                })
              );
            }
            break;
          case "globalRules":
            if (args?.globalRules && "rule_id" in args.globalRules) {
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/global_rules/${args.globalRules.rule_id}`,
                  method: "GET",
                  params: {
                    gateway_group_id: args.globalRules.gateway_group_id,
                  },
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/apisix/admin/global_rules",
                  method: "GET",
                  params: args.globalRules,
                })
              );
            }
            break;
          case "pluginMetadata":
            if (args?.pluginMetadata && "plugin_name" in args.pluginMetadata) {
              results.push(
                await makeAPIRequest({
                  url: `/apisix/admin/plugin_metadata/${args.pluginMetadata.plugin_name}`,
                  method: "GET",
                  params: {
                    gateway_group_id: args.pluginMetadata.gateway_group_id,
                  },
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/apisix/admin/plugin_metadata",
                  method: "GET",
                  params: args.pluginMetadata,
                })
              );
            }
            break;
          case "gatewayInstance":
            if (
              args?.gatewayInstance &&
              "gateway_group_id" in args.gatewayInstance
            ) {
              results.push(
                await makeAPIRequest({
                  url: `/api/gateway_groups/${args.gatewayInstance.gateway_group_id}/instances`,
                  method: "GET",
                  params: args.gatewayInstance,
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/api/instances",
                  method: "GET",
                  params: args.gatewayInstance,
                })
              );
            }
            break;
          case "serviceRegistry":
            if (
              args?.serviceRegistry &&
              "service_registry_id" in args.serviceRegistry
            ) {
              results.push(
                await makeAPIRequest({
                  url: `/api/gateway_groups/${args.serviceRegistry.gateway_group_id}/service_registries/${args.serviceRegistry.service_registry_id}`,
                  method: "GET",
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: `/api/gateway_groups/${args.serviceRegistry?.gateway_group_id}/service_registries`,
                  method: "GET",
                  params: args.serviceRegistry,
                })
              );
            }
            break;
          case "customPlugin":
            if (args?.customPlugin && "custom_plugin_id" in args.customPlugin) {
              results.push(
                await makeAPIRequest({
                  url: `/api/custom_plugins/${args.customPlugin.custom_plugin_id}`,
                  method: "GET",
                  params: {
                    gateway_group_id: args.customPlugin.gateway_group_id,
                  },
                })
              );
            } else {
              results.push(
                await makeAPIRequest({
                  url: "/api/custom_plugins",
                  method: "GET",
                  params: args.customPlugin,
                })
              );
            }
            break;
        }
      }

      for (const res of results) {
        if (res.isError) {
          return res;
        }

        if (Array.isArray(res.content)) {
          res.content.forEach((item) => {
            result.content.push(item);
          });
        }
      }

      return result;
    }
  );

  server.tool("send_request_to_gateway", "Send a request or multiple requests to the API7EE gateway instance", SendRequestSchema.shape, async (args) => {
    const makeRequest = async (config: RequestConfig) => {
      try {
        const response = await axios.request({
          url: `${GATEWAY_SERVER_URL}${config.path}`,
          method: config.method,
          data: config.data,
          headers: config.headers,
          timeout: 10000,
        });

        return {
          status: response.status,
          data: response.data,
          headers: response.headers,
        };
      } catch (error) {
        // handle error
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          // The server responded with an error status code
          return {
            status: axiosError.response.status,
            data: axiosError.response.data || { error: 'Request failed' },
            headers: axiosError.response?.headers || {},
          };
        } else if (axiosError.request) {
          // The request was sent but no response was received
          return {
            status: 503, // Use 503 to indicate service is unavailable
            data: { error: 'Gateway is not responding' },
            headers: axiosError.request?.headers || {},
          };
        } else {
          // An error occurred while setting up the request
          return {
            status: 500,
            data: { error: axiosError.message || 'Request error' },
            headers: axiosError.request?.headers || {},
          };
        }
      }
    };

    const makeRepeatedRequests = async (config: RequestConfig) => {
      const repeatCount = config.repeatCount || 1;
      if (repeatCount > 1) {
        return Promise.all(Array(repeatCount).fill(null).map(() => makeRequest(config)));
      } else {
        return makeRequest(config);
      }
    };

    let results = [];
    results = await Promise.all(args.requests.map(req => makeRepeatedRequests(req)));


    // Flatten results if needed and count
    const flatResults = results.flat();
    const singleResults = flatResults.filter(r => !Array.isArray(r));
    const multiResults = flatResults.filter(r => Array.isArray(r)).flat();
    const allResults = [...singleResults, ...multiResults];

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          results: allResults,
          summary: {
            total: allResults.length,
            successful: allResults.filter(r => r.status >= 200 && r.status < 300).length,
            failed: allResults.filter(r => r.status >= 400).length
          }
        }, null, 2)
      }]
    };
  });
};

export default setupCommonTools;
