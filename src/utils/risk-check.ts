import dayjs from "dayjs";
import makeAPIRequest from "../request.js";
import { ResourceOverview, CustomPlugin, GatewayGroup, Service, Consumer } from "../types/risk-check.js";

export const fetchResourceOverview = async (): Promise<ResourceOverview | string> => {
    try {
      // Fetch custom plugins
      const customPluginsData = await makeAPIRequest({
        url: "/api/custom_plugins",
        raw: true,
      });
  
      let customPlugins: { id: string; name: string }[] = [];
      if (customPluginsData) {
        customPlugins = customPluginsData.list.map(
          (plugin: CustomPlugin) => {
            return {
              id: plugin.id,
              name: plugin.name,
            }
          }
        );
      }
  
      const gatewayGroupsData = await makeAPIRequest({
        url: "/api/gateway_groups",
        raw: true,
      });
  
      if (!gatewayGroupsData) {
        return {
          gatewayGroups: [],
          customPlugins: customPlugins,
        };
      }
  
      const gatewayGroupPromises = gatewayGroupsData.list.map(
        async (group: GatewayGroup) => {
          const gatewayGroup: GatewayGroup = {
            id: group.id,
            name: group.name,
            publishedServices: [],
            globalRules: [],
            ssl: [],
            consumer: [],
          };
  
          const [servicesData, globalRulesData, sslData, consumerData] =
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
                url: "/apisix/admin/consumers",
                method: "GET",
                params: {
                  gateway_group_id: group.id,
                },
                raw: true,
              }),
            ]);
  
          if (servicesData && servicesData.list) {
            const servicePromises = servicesData.list.map(
              async (service: Service) => {
                const serviceInfo: Service = {
                  id: service.id,
                  name: service.name,
                  upstream: {
                    name: service.upstream?.name,
                    checks: {
                      active: !!service.upstream?.checks?.active,
                      passive: !!service.upstream?.checks?.passive,
                    },
                  },
                  routes: [],
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
  
                if (routesData && routesData.list) {
                  for (const route of routesData.list) {
                    const pluginNames = route.plugins
                      ? Object.keys(route.plugins)
                      : [];
  
                    serviceInfo.routes.push({
                      id: route.id,
                      name: route.name,
                      path: route.uri,
                      method: route.methods,
                      plugins: pluginNames,
                    });
                  }
                }
  
                return serviceInfo;
              }
            );
  
            const services = await Promise.all(servicePromises);
            gatewayGroup.publishedServices = services;
          }
  
          if (globalRulesData && globalRulesData.list) {
            for (const rule of globalRulesData.list) {
              const pluginNames = rule.plugins ? Object.keys(rule.plugins) : [];
  
              gatewayGroup.globalRules.push({
                id: rule.id,
                name: rule.name || `Global Rule ${rule.id}`,
                plugins: pluginNames,
              });
            }
          }
  
          if (sslData && sslData.list) {
            for (const ssl of sslData.list) {
              gatewayGroup.ssl.push({
                id: ssl.id,
                name: ssl.name,
                common_name: ssl.common_name,
                exptime: dayjs(ssl?.exptime).format("YYYY-MM-DD HH:mm:ss"),
              });
            }
          }
  
          if (consumerData && consumerData.list) {
            const consumerPromises = consumerData.list.map(async (consumer: {
              id: string;
              username: string;
              plugins?: Record<string, unknown>;
            }) => {
              const consumerInfo: Consumer = {
                id: consumer.id,
                name: consumer.username || `Consumer ${consumer.id}`,
                plugins: consumer.plugins ? Object.keys(consumer.plugins) : [],
                credentials: []
              };
              
              // 获取每个 consumer 的 credentials
              const credentialsData = await makeAPIRequest({
                url: `/apisix/admin/consumers/${consumer.username}/credentials`,
                method: "GET",
                params: {
                  gateway_group_id: group.id,
                },
                raw: true,
              });
              
              if (credentialsData && credentialsData.list) {
                consumerInfo.credentials = credentialsData.list.map((credential: {
                  id: string;
                  name: string;
                  plugins: Record<string, unknown>;
                }) => {
                  // 只保留 name、id 和插件名称
                  return {
                    id: credential.id,
                    name: credential.name,
                    plugin: Object.keys(credential.plugins)[0] // 获取第一个插件名称
                  };
                });
              }
              
              return consumerInfo;
            });
            
            gatewayGroup.consumer = await Promise.all(consumerPromises);
          }
  
          return gatewayGroup;
        }
      );
  
      const gatewayGroups = await Promise.all(gatewayGroupPromises);
  
      return {
        gatewayGroups: gatewayGroups,
        customPlugins: customPlugins,
      };
    } catch (error) {
      return String(error);
    }
  }