import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchResourceOverview } from "../utils/risk-check.js";

const prompt = `Here's the translated prompt for invoking the API7-MCP tool to generate a risk assessment report:
---

### Call the tools in API7-MCP to inspect the following risk items and output a final risk report.

**Risk Item List:**  
#### **Security & Authentication**  
1. **Security Plugin Configuration**  
   - Data source: Configurations of get_resource routes/services/global rules.  
   - Analysis: Examine all routes (especially those with POST/PUT/DELETE methods or sensitive paths) and services to check if necessary auth plugins (e.g., key-auth, jwt-auth, ldap-auth, openid-connect) are configured. Identify APIs without any authentication.  

2. **Weak Authentication Plugin Configurations**  
   - Data source: Consumer/auth credential plugin configurations.  
   - AI analysis: Evaluate the security level of configured auth plugins (e.g., key-auth, jwt-auth, openid-connect, ldap-auth).  

#### **Data Transmission**  
1. **HTTPS Enforcement for APIs**  
   - Data source: scheme field in service/upstream configurations, SSL settings.  
   - AI analysis: Verify that all public-facing routes/services enforce SSL, disallow plain HTTP, and check ports (80/443).  

2. **SSL Certificate Security**  
   - Data source: SSL certificate configurations.  
   - AI analysis: Check for expired/near-expiry certificates, encryption algorithms (e.g., TLS 1.2+), key length, unused SNIs, or orphaned certificates.  

3. **Gateway Instance Version Incompatibility**  
   - Data source: Gateway instance data.  
   - AI analysis: Detect incompatible gateway versions.  

#### **API Access & Rate Limiting Risks**  
1. **Sensitive API Rate Limiting (Optional)**  
   - Data source: Rate-limiting plugins (e.g., limit-req, limit-count, limit-conn) on routes/services.  
   - AI analysis: Assess if sensitive APIs have rate-limiting enabled with reasonable thresholds.  

2. **Global Protection Mechanisms (Optional)**  
   - Data source: Global rule configurations (e.g., IP whitelist/blacklist, block rules).  
   - AI analysis: Check for foundational protections (e.g., ip-restriction, user-agent-restriction).  

3. **Route Conflict Detection**  
   - Data source: All route data.  
   - AI analysis: Identify overlaps/conflicts in Host + Path Prefix + Route Path.  

4. **Health Check Configuration & Node Status**  
   - Data source: Upstream and node data.  
   - AI analysis: Verify health checks for multi-node upstreams and assess node health.  

#### **Plugin Management**  
1. **Duplicate Plugins**  
   - Data source: Plugin configurations for routes/services/consumers/global rules.  
   - AI analysis: Detect redundant/conflicting plugins.  

2. **Custom Plugin Risks**  
   - Data source: Custom plugins or serverless-pre/post-function code snippets.  
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
   - Data source: Use get_prometheus_metrics to get real-time/historical metrics (bandwidth, QPS, concurrent requests).  
   - AI analysis: Identify spikes/drops (e.g., DoS, crawlers) or sustained high resource usage.  

2. **Request Anomalies & Error Trends**  
   - Data source: Access logs, status codes (2xx/4xx/5xx).  
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
│    └── ...`;

// Guidance for AI analysis
const overviewGuidance = `
IMPORTANT INSTRUCTION:
1. First, analyze the resource overview to identify potential risk areas and problematic resources.
2. Then use the get_resource tool selectively to fetch detailed information ONLY for resources that need further investigation.
3. Don't fetch all resources at once - this will cause token limits and reduce analysis quality.
4. If the resource has a large amount of resource overview, ask the user if they want to get a detailed report or just an abbreviated report.
`;

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
