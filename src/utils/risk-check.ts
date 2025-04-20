import dayjs from "dayjs";
import makeAPIRequest from "../request.js";
import {
  ResourceOverview,
  CustomPlugin,
  GatewayGroup,
  Service,
  Consumer,
} from "../types/risk-check.js";

export const fetchResourceOverview = async (): Promise<
  ResourceOverview | string
> => {
  try {
    const customPluginsData = await makeAPIRequest({
      url: "/api/custom_plugins",
      raw: true,
    });

    let customPlugins: { id: string; name: string }[] = [];
    if (customPluginsData) {
      customPlugins = customPluginsData.list.map((plugin: CustomPlugin) => {
        return {
          id: plugin.id,
          name: plugin.name,
        };
      });
    }

    const gatewayGroupsData = await makeAPIRequest({
      url: "/api/gateway_groups",
      raw: true,
    });

    if (!gatewayGroupsData) {
      return {
        gatewayGroups: customPlugins.length > 0 ? [] : undefined,
        customPlugins: customPlugins.length > 0 ? customPlugins : undefined,
      };
    }

    const gatewayGroupPromises = gatewayGroupsData.list.map(
      async (group: GatewayGroup) => {
        const gatewayGroup: Partial<GatewayGroup> = {
          id: group.id,
          name: group.name,
        };

        const [servicesData, globalRulesData, sslData, caCertificateData, consumerData] =
          await Promise.all([
            makeAPIRequest({
              url: "/apisix/admin/services",
              method: "GET",
              params: {
                gateway_group_id: group.id,
              },
              raw: true,
            }),

            makeAPIRequest({
              url: "/apisix/admin/global_rules",
              method: "GET",
              params: {
                gateway_group_id: group.id,
              },
              raw: true,
            }),

            makeAPIRequest({
              url: "/apisix/admin/certificates",
              method: "GET",
              params: {
                gateway_group_id: group.id,
              },
              raw: true,
            }),

            makeAPIRequest({
              url: "/apisix/admin/ca_certificates",
              method: "GET",
              params: {
                gateway_group_id: group.id,
              },
              raw: true,
            }),

            makeAPIRequest({
              url: "/apisix/admin/consumers",
              method: "GET",
              params: {
                gateway_group_id: group.id,
              },
              raw: true,
            }),
          ]);

        if (servicesData && servicesData.list && servicesData.list.length > 0) {
          const servicePromises = servicesData.list.map(
            async (service: Service) => {
              const pluginNames = service.plugins
                    ? Object.keys(service.plugins)
                    : [];

              const serviceInfo: Partial<Service> = {
                id: service.id,
                name: service.name,
                path_prefix: service?.path_prefix || "",
                hosts: service?.hosts || ["*"],
                plugins: pluginNames.length > 0 ? pluginNames : undefined,
                upstream: {
                  name: service.upstream?.name,
                  checks: {
                    active: !!service.upstream?.checks?.active,
                    passive: !!service.upstream?.checks?.passive,
                  },
                },
              };

              const routesData = await makeAPIRequest({
                url: "/apisix/admin/routes",
                method: "GET",
                params: {
                  service_id: service.id,
                  gateway_group_id: group.id,
                },
                raw: true,
              });

              if (routesData && routesData.list && routesData.list.length > 0) {
                const routes = [];
                for (const route of routesData.list) {
                  const pluginNames = route.plugins
                    ? Object.keys(route.plugins)
                    : [];

                  routes.push({
                    id: route.id,
                    name: route.name,
                    paths: route.paths,
                    methods: route.methods || ['*'],
                    plugins: pluginNames.length > 0 ? pluginNames : undefined,
                  });
                }

                if (routes.length > 0) {
                  serviceInfo.routes = routes;
                }
              }

              return serviceInfo;
            }
          );

          const services = await Promise.all(servicePromises);
          if (services.length > 0) {
            gatewayGroup.publishedServices = services;
          }
        }

        if (
          globalRulesData &&
          globalRulesData.list &&
          globalRulesData.list.length > 0
        ) {
          const globalRules = [];
          for (const rule of globalRulesData.list) {
            const pluginNames = rule.plugins ? Object.keys(rule.plugins) : [];

            globalRules.push({
              id: rule.id,
              name: rule.name || `Global Rule ${rule.id}`,
              plugins: pluginNames.length > 0 ? pluginNames : undefined,
            });
          }

          if (globalRules.length > 0) {
            gatewayGroup.globalRules = globalRules;
          }
        }

        if (sslData && sslData.list && sslData.list.length > 0) {
          const ssl = [];
          for (const cert of sslData.list) {
            

            ssl.push({
              id: cert.id,
              name: cert.name,
              common_name: cert.common_name,
              exptime: cert?.exptime
              ? dayjs.unix(cert.exptime).format("YYYY-MM-DD HH:mm:ss")
              : "",
            });
          }

          if (ssl.length > 0) {
            gatewayGroup.ssl = ssl;
          }
        }

        if(caCertificateData && caCertificateData.list && caCertificateData.list.length > 0) {
          const caCertificate = [];
          for (const cert of caCertificateData.list) {
            caCertificate.push({
              id: cert.id,
              name: cert.name,
              common_name: cert.common_name,
              exptime: cert?.exptime
              ? dayjs.unix(cert.exptime).format("YYYY-MM-DD HH:mm:ss")
              : "",
            });
          }

          if (caCertificate.length > 0) {
            gatewayGroup.caCertificate = caCertificate;
          }
        }

        if (consumerData && consumerData.list && consumerData.list.length > 0) {
          const consumerPromises = consumerData.list.map(
            async (consumer: {
              id: string;
              username: string;
              plugins?: Record<string, unknown>;
            }) => {
              const consumerInfo: Partial<Consumer> = {
                id: consumer.id,
                name: consumer.username || `Consumer ${consumer.id}`,
              };

              const plugins = consumer.plugins
                ? Object.keys(consumer.plugins)
                : [];
              if (plugins.length > 0) {
                consumerInfo.plugins = plugins;
              }

              const credentialsData = await makeAPIRequest({
                url: `/apisix/admin/consumers/${consumer.username}/credentials`,
                method: "GET",
                params: {
                  gateway_group_id: group.id,
                },
                raw: true,
              });

              if (
                credentialsData &&
                credentialsData.list &&
                credentialsData.list.length > 0
              ) {
                const credentials = credentialsData.list.map(
                  (credential: {
                    id: string;
                    name: string;
                    plugins: Record<string, unknown>;
                  }) => {
                    return {
                      id: credential.id,
                      name: credential.name,
                      plugin: Object.keys(credential.plugins)[0],
                    };
                  }
                );

                if (credentials.length > 0) {
                  consumerInfo.credentials = credentials;
                }
              }

              return consumerInfo;
            }
          );

          const consumers = await Promise.all(consumerPromises);
          if (consumers.length > 0) {
            gatewayGroup.consumer = consumers;
          }
        }

        return gatewayGroup as GatewayGroup;
      }
    );

    const gatewayGroups = await Promise.all(gatewayGroupPromises);
    const filteredGatewayGroups = gatewayGroups.filter(
      (group) => Object.keys(group).length > 2
    );

    const result: ResourceOverview = {};
    if (filteredGatewayGroups.length > 0) {
      result.gatewayGroups = filteredGatewayGroups;
    }
    if (customPlugins.length > 0) {
      result.customPlugins = customPlugins;
    }

    return result;
  } catch (error) {
    return String(error);
  }
};
