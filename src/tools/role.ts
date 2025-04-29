import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import makeAPIRequest from "../request.js";
import {
  UpdateAssignedRolesForUserSchema,
  CreateRoleSchema,
  DeleteRoleSchema,
  GetRoleSchema,
} from "../types/role.js";
import { DASHBOARD_URL } from "../env.js";

const setupRoleTools = (server: McpServer) => {
  server.tool(
    "get_role",
    "Get role details by ID or list roles based on filters",
    GetRoleSchema.shape,
    async (args) => {
      const roleId = args.id;
      if (roleId) {
        return await makeAPIRequest({
          url: `/api/roles/${roleId}`,
          method: "GET",
        });
      } else {
        return await makeAPIRequest({
          url: `/api/roles`,
          method: "GET",
          params: {
            search: args.search,
          },
        });
      }
    }
  );

  server.tool(
    "create_role",
    "Create a role",
    CreateRoleSchema.shape,
    async (args) => {
      return await makeAPIRequest({
        url: `/api/roles`,
        method: "POST",
        data: args.role,
        options: {
          handler: (data) => {
            return {
              ...data,
              console_url: `${DASHBOARD_URL}/roles/${data.value.id}`,
            };
          },
        },
      });
    }
  );

  server.tool(
    "update_assigned_roles_for_user",
    "Update assigned roles for a user",
    UpdateAssignedRolesForUserSchema.shape,
    async (args) => {
      return await makeAPIRequest({
        url: `/api/users/${args.user_id}/assigned_roles`,
        method: "PUT",
        data: { roles: args.roles },
        options: {
          handler: (data) => {
            return {
              ...data,
              console_url: `${DASHBOARD_URL}/users/${args.user_id}`,
            };
          },
        },
      });
    }
  );

  server.tool(
    "delete_role",
    "Delete a role",
    DeleteRoleSchema.shape,
    async (args) => {
      return await makeAPIRequest({
        url: `/api/roles/${args.id}`,
        method: "DELETE",
      });
    }
  );
};

export default setupRoleTools;
