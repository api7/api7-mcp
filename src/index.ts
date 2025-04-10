#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import setupPermissionPolicyTools from "./tools/permission-policy.js";
import setupRoleTools from "./tools/role.js";
import setupUserTools from "./tools/user.js";
import setupPermissionPolicyResources from "./resources/permission-policy.js";
import setupCommonTools from "./tools/common.js";

const server = new McpServer({
  name: "api7-mcp",
  version: "0.0.1",
});

setupPermissionPolicyResources(server);
setupPermissionPolicyTools(server);
setupRoleTools(server);
setupUserTools(server);
setupCommonTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("IAM Policy MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
