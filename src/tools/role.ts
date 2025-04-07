import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import makeAPIRequest from "../request.js";
import { UpdateAssignedRolesForUserSchema, CreateRoleSchema, DeleteRoleSchema, GetRoleSchema } from "../types/role.js";
import { CONTROL_PLANE_ADDRESS } from "../env.js";

const setupRoleTools = (server: McpServer) => {

  server.tool("get_role", "Get role details by ID or list roles based on filters", GetRoleSchema.shape, async (args) => {
    const roleId = args.id;
    if (roleId) {
      return await makeAPIRequest(`/roles/${roleId}`, "GET");
    } else {
      return await makeAPIRequest(`/roles?search=${args.search}`, "GET");
    }
  });


  server.tool("create_role", "Create a role", CreateRoleSchema.shape, async (args) => {
    return await makeAPIRequest(`/roles`, "POST", args.role, {
      handler: (data) => {
        return {
          ...data,
          console_url: `${CONTROL_PLANE_ADDRESS}/roles/${data.value.id}`,
        }
      }
    });
  });

  server.tool("update_assigned_roles_for_user", "Update assigned roles for a user", UpdateAssignedRolesForUserSchema.shape, async (args) => {
    return await makeAPIRequest(`/users/${args.user_id}/assigned_roles`, "PUT", { roles: args.roles }, {
      handler: (data) => {
        return {
          ...data,
          console_url: `${CONTROL_PLANE_ADDRESS}/users/${args.user_id}`,
        }
      }
    });
  });

  server.tool("delete_role", "Delete a role", DeleteRoleSchema.shape, async (args) => {
    return await makeAPIRequest(`/roles/${args.id}`, "DELETE");
  });

};

export default setupRoleTools;
