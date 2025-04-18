import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import makeAPIRequest from "../request.js";
import {
  ResourceOverview,
  GatewayGroup,
  Service,
  CustomPlugin,
} from "../types/risk-check.js";
import dayjs from "dayjs";

const prompt = `Here's the translated prompt for invoking the API7-MCP tool to generate a risk assessment report:
---

### Call the tools in API7-MCP to inspect the following risk items and output a final risk report.

**Risk Item List:**  
#### **Security & Authentication**  
1. **Security Plugin Configuration**  
   - Data source: Configurations of get_resource routes/services/global rules.  
   - MCP tool: get_resource
   - Analysis: Examine all routes (especially those with POST/PUT/DELETE methods or sensitive paths) and services to check if necessary auth plugins (e.g., key-auth, jwt-auth, ldap-auth, openid-connect) are configured. Identify APIs without any authentication.  

2. **Weak Authentication Plugin Configurations**  
   - Data source: Consumer/auth credential plugin configurations.  
   - MCP tool: get_resource  
   - AI analysis: Evaluate the security level of configured auth plugins (e.g., key-auth, jwt-auth, openid-connect, ldap-auth).  

#### **Data Transmission**  
1. **HTTPS Enforcement for APIs**  
   - Data source: scheme field in service/upstream configurations, SSL settings.  
   - MCP tool: get_resource  
   - AI analysis: Verify that all public-facing routes/services enforce SSL, disallow plain HTTP, and check ports (80/443).  

2. **SSL Certificate Security**  
   - Data source: SSL certificate configurations.  
   - MCP tool: get_resource  
   - AI analysis: Check for expired/near-expiry certificates, encryption algorithms (e.g., TLS 1.2+), key length, unused SNIs, or orphaned certificates.  

3. **Gateway Instance Version Incompatibility**  
   - Data source: Gateway instance data.  
   - MCP tool: get_resource  
   - AI analysis: Detect incompatible gateway versions.  

#### **API Access & Rate Limiting Risks**  
1. **Sensitive API Rate Limiting (Optional)**  
   - Data source: Rate-limiting plugins (e.g., limit-req, limit-count, limit-conn) on routes/services.  
   - AI analysis: Assess if sensitive APIs have rate-limiting enabled with reasonable thresholds.  

2. **Global Protection Mechanisms (Optional)**  
   - Data source: Global rule configurations (e.g., IP whitelist/blacklist, block rules).  
   - MCP tool: get_resource  
   - AI analysis: Check for foundational protections (e.g., ip-restriction, user-agent-restriction).  

3. **Route Conflict Detection**  
   - Data source: All route data.  
   - MCP tool: get_resource  
   - AI analysis: Identify overlaps/conflicts in Host + Path Prefix + Route Path.  

4. **Health Check Configuration & Node Status**  
   - Data source: Upstream and node data.  
   - MCP tool: get_resource  
   - AI analysis: Verify health checks for multi-node upstreams and assess node health.  

#### **Logging & Auditing Risks**  
1. **Logging Completeness**  
   - Data source: Log plugin/configurations.  
   - MCP tool: get_resource  
   - AI analysis: Ensure core routes/services log critical data (e.g., user_id, IP).  

2. **Log Leakage Inspection**  
   - Data source: Access/error log samples.  
   - MCP tool: get_resource  
   - AI analysis: Check for sensitive data (e.g., Authorization headers, passwords, IDs) and recommend masking.  

#### **Plugin Management**  
1. **Duplicate Plugins**  
   - Data source: Plugin configurations for routes/services/consumers/global rules.  
   - MCP tool: get_resource  
   - AI analysis: Detect redundant/conflicting plugins.  

2. **Custom Plugin Risks**  
   - Data source: Custom plugins or serverless-pre/post-function code snippets.  
   - MCP tool: get_resource  
   - AI analysis: Static analysis for security risks (e.g., injection, hardcoded secrets) or performance issues.  

#### **API Exposure & Sensitive Protection**  
1. **Exposed Sensitive/Debug/Admin APIs**  
   - Data source: Route/upstream configurations, OpenAPI/Swagger.  
   - AI analysis: Flag unsecured endpoints (e.g., /admin, /debug).  

#### **Role Management & Compliance**  
1. **Permission Granularity & Least Privilege**  
   - Data source: Permission policies, role bindings.  
   - MCP tools: get_permission_policy, get_permission_policy_by_role, get_role  
   - AI analysis:  
     - Check for overly permissive policies (e.g., Resources: ["*"], Actions: ["*"]).  
     - Validate least privilege adherence and unused/redundant permissions.  
     - Detect role conflicts (e.g., a user with both config and audit roles).  

#### **Monitoring & Alerts**  
1. **Abnormal Traffic & Resource Usage**  
   - Data source: Real-time/historical metrics (bandwidth, QPS, concurrent requests).  
   - MCP tool: get_prometheus_metrics  
   - AI analysis: Identify spikes/drops (e.g., DoS, crawlers) or sustained high resource usage.  

2. **Request Anomalies & Error Trends**  
   - Data source: Access logs, status codes (2xx/4xx/5xx).  
   - MCP tool: get_prometheus_metrics  
   - AI analysis: Detect 5xx surges, 4xx spikes (e.g., auth failures), or prolonged API errors.  

---

### **Report Structure:**  
[Risk Category]  
│  
├── [Risk Item Name]  
│    ├── **Result**: (✅/⚠️/❌/🔴)  
│    ├── **Affected Resources**: (Route/service/certificate ID)  
│    └── **Recommendation**: (Commands/config examples)  
│  
├── [Risk Item Name]  
│    └── ...  

**Result Key:**  
- ✅ Passed  
- ⚠️ Warning (needs optimization)  
- ❌ Failed (requires fixes)  
- 🔴 Critical (high risk)  

**Affected Resources**: Specify exact routes, services, or plugin IDs.  
**Recommendations**: Include plugin names/parameters (e.g., limit-req: {rate=1000}).`;

// Guidance for AI analysis
const overviewGuidance = `
IMPORTANT INSTRUCTION:
1. First analyze the resource overview to identify potential risk areas and problematic resources.
2. Then use the get_resource tool SELECTIVELY to fetch detailed information ONLY for resources that need further investigation.
3. Don't fetch all resources at once - this will cause token limits and reduce analysis quality.
4. If the resource has a large amount of resource overview, ask the user if they want to get a detailed report or just an abbreviated report.
`;

/**
 * Fetches an overview of resources for risk assessment
 */
async function fetchResourceOverview(): Promise<ResourceOverview | string> {
  try {
    // Fetch custom plugins
    const customPluginsData = await makeAPIRequest({
      url: "/api/custom_plugins",
      raw: true,
    });

    let customPlugins: string[] = [];
    if (customPluginsData) {
      customPlugins = customPluginsData.list.map(
        (plugin: CustomPlugin) => plugin.name || `Plugin ${plugin.id}`
      );
    }

    // Fetch gateway groups
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

    // Create an array to store promises for all gateway groups
    const gatewayGroupPromises = gatewayGroupsData.list.map(
      async (group: { id: number | string; name: string }) => {
        const gatewayGroup: GatewayGroup = {
          id: group.id,
          name: group.name,
          publishedServices: [],
          globalRules: [],
          ssl: [],
          consumer: [],
        };

        // Create an array of promises to fetch data in parallel
        const [servicesData, globalRulesData, sslData, consumerData] =
          await Promise.all([
            // Fetch service data
            makeAPIRequest({
              url: "/apisix/admin/services",
              method: "GET",
              params: {
                gateway_group_id: String(group.id),
              },
              raw: true,
            }),

            // Fetch global rules data
            makeAPIRequest({
              url: "/apisix/admin/global_rules",
              method: "GET",
              params: {
                gateway_group_id: String(group.id),
              },
              raw: true,
            }),

            // Fetch SSL certificate data
            makeAPIRequest({
              url: "/apisix/admin/certificates",
              method: "GET",
              params: {
                gateway_group_id: String(group.id),
              },
              raw: true,
            }),

            // Fetch consumer data
            makeAPIRequest({
              url: "/apisix/admin/consumers",
              method: "GET",
              params: {
                gateway_group_id: String(group.id),
              },
              raw: true,
            }),
          ]);

        // Process services data
        if (servicesData && servicesData.list) {
          // Create an array of promises to fetch routes for each service
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

              // Fetch route data
              const routesData = await makeAPIRequest({
                url: "/apisix/admin/routes",
                method: "GET",
                params: {
                  service_id: String(service.id),
                  gateway_group_id: String(group.id),
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

          // Wait for all service promises to complete
          const services = await Promise.all(servicePromises);
          gatewayGroup.publishedServices = services;
        }

        // Process global rules data
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

        // Process SSL certificate data
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

        // Process consumer data
        if (consumerData && consumerData.list) {
          for (const consumer of consumerData.list) {
            gatewayGroup.consumer.push({
              id: consumer.id,
              name: consumer.username || `Consumer ${consumer.id}`,
              plugins: consumer.plugins ? Object.keys(consumer.plugins) : [],
            });
          }
        }

        return gatewayGroup;
      }
    );

    // Wait for all gateway group promises to complete
    const gatewayGroups = await Promise.all(gatewayGroupPromises);

    return {
      gatewayGroups: gatewayGroups,
      customPlugins: customPlugins,
    };
  } catch (error) {
    return String(error);
  }
}

const setupRiskCheckTools = (server: McpServer) => {
  server.tool(
    "check_risk",
    "Scan API7 resources configurations for security, performance, and compliance risks, then generates a structured report with actionable fixes.",
    async () => {
      // Fetch resource overview
      const resourceOverview = await fetchResourceOverview();

      if (typeof resourceOverview === "string") {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: resourceOverview,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: prompt + overviewGuidance,
          },
          {
            type: "text",
            text: `${overviewGuidance}\n Resource Overview (Use this for initial assessment):\n${JSON.stringify(
              resourceOverview,
              null,
              2
            )}`,
          },
        ],
      };
    }
  );
};

export default setupRiskCheckTools;
