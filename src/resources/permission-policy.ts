import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import policyResourcesActions from "./policy-resources-actions.js";

const setupPermissionPolicyResources = (server: McpServer) => {
    server.resource(
        "All API7 resources permission policy actions and resources config in JSON format",
        "text://policy-resources-actions.json",
        () => {
            return {
                contents: [
                    {
                        uri: "text://policy-resources-actions.json",
                        text: JSON.stringify(policyResourcesActions, null, 2),
                        mimeType: "application/json",
                    },
                ],
            };
        }
    );
};

export default setupPermissionPolicyResources;
