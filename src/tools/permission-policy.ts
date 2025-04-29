import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import makeAPIRequest from "../request.js";
import {
  GetPermissionPolicySchema,
  CreatePermissionPolicySchema,
  UpdatePermissionPolicySchema,
  DeletePermissionPolicySchema,
  GetPermissionPolicyByRoleSchema,
  AttachPermissionPolicyToRoleSchema,
  DetachPermissionPolicyFromRoleSchema,
} from "../types/permission-policy.js";
import { DASHBOARD_URL } from "../env.js";

const setupPermissionPolicyTools = (server: McpServer) => {
  server.tool(
    "get_permission_policy",
    "Get permission policy details by ID or list permission policies based on filters",
    GetPermissionPolicySchema.shape,
    async (args) => {
      const policyId = args.id;
      if (policyId) {
        return await makeAPIRequest({
          url: `/api/permission_policies/${policyId}`,
          method: "GET",
        });
      } else {
        return await makeAPIRequest({
          url: `/api/permission_policies`,
          method: "GET",
          params: {
            search: args.search,
          },
        });
      }
    }
  );

  const notes = [
    "1. Please read the mcp resource text://policy-resources-actions.json before using this tool",
    "2. Condition resource is only used for label matching, other field matching is not supported",
    "3. Supports using regular expressions in angle brackets. For example:`gateway:<.*>CustomPlugin<.*>` represents all operations related to custom plugins.`<.*>Get<.*>· matches all actions containing 'Get'.",
  ];

  server.tool(
    "create_permission_policy",
    `Create a permission policy\n${JSON.stringify(notes, null, 2)}`,
    CreatePermissionPolicySchema.shape,
    async (args) => {
      if (!args.alreadyReadPermissionPolicyConfig) {
        return {
          content: [
            {
              type: "text",
              text: "Please read the mcp resource text://policy-resources-actions.json before using this tool",
            },
          ],
        };
      }
      return await makeAPIRequest({
        url: "/api/permission_policies",
        method: "POST",
        data: args.permissionPolicy,
        options: {
          handler: (data) => {
            return {
              ...data,
              console_url: `${DASHBOARD_URL}/policies/${data.value.id}`,
            };
          },
        },
      });
    }
  );

  server.tool(
    "update_permission_policy",
    `Update a permission policy\n${JSON.stringify(notes, null, 2)}`,
    UpdatePermissionPolicySchema.shape,
    async (args) => {
      if (!args.alreadyReadPermissionPolicyConfig) {
        return {
          content: [
            {
              type: "text",
              text: "Please read the mcp resource text://policy-resources-actions.json before using this tool",
            },
          ],
        };
      }
      return await makeAPIRequest({
        url: `/api/permission_policies/${args.id}`,
        method: "PUT",
        data: args.permissionPolicy,
        options: {
          handler: (data) => {
            return {
              ...data,
              console_url: `${DASHBOARD_URL}/policies/${data.value.id}`,
            };
          },
        },
      });
    }
  );

  server.tool(
    "delete_permission_policy",
    "Delete a permission policy",
    DeletePermissionPolicySchema.shape,
    async (args) => {
      return await makeAPIRequest({
        url: `/api/permission_policies/${args.id}`,
        method: "DELETE",
      });
    }
  );

  server.tool(
    "get_permission_policy_by_role",
    "Get permission policy details by role id",
    GetPermissionPolicyByRoleSchema.shape,
    async (args) => {
      return await makeAPIRequest({
        url: `/api/roles/${args.id}/permission_policies`,
        method: "GET",
      });
    }
  );

  server.tool(
    "attach_permission_policy_to_role",
    "Attach permission policy to role",
    AttachPermissionPolicyToRoleSchema.shape,
    async (args) => {
      return await makeAPIRequest({
        url: `/api/roles/${args.id}/attach_permission_policies`,
        method: "POST",
        data: args.permissionPolicyId,
        options: {
          handler: (data) => {
            return {
              ...data,
              console_url: `${DASHBOARD_URL}/roles/${args.id}/detail`,
            };
          },
        },
      });
    }
  );

  server.tool(
    "detach_permission_policy_from_role",
    "Detach permission policy from role",
    DetachPermissionPolicyFromRoleSchema.shape,
    async (args) => {
      return await makeAPIRequest({
        url: `/api/roles/${args.id}/detach_permission_policies`,
        method: "POST",
        data: args.permissionPolicyId,
        options: {
          handler: (data) => {
            return {
              ...data,
              console_url: `${DASHBOARD_URL}/roles/${args.id}/detail`,
            };
          },
        },
      });
    }
  );
};

export default setupPermissionPolicyTools;
