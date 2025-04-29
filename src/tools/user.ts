import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import makeAPIRequest from "../request.js";
import {
  GetRoleByUserIdSchema,
  GetUserIdByUsernameSchema,
} from "../types/user.js";

const setupUserTools = (server: McpServer) => {
  server.tool(
    "get_role_by_user_id",
    "Get role details by user id",
    GetRoleByUserIdSchema.shape,
    async (args) => {
      return await makeAPIRequest({
        url: `/api/users/${args.id}`,
        options: {
          pick: "value.roles",
        },
      });
    }
  );

  server.tool(
    "get_userId_by_username",
    "Get user id by username",
    GetUserIdByUsernameSchema.shape,
    async (args) => {
      return await makeAPIRequest({
        url: `/api/users`,
        params: {
          search: args.username,
        },
        options: {
          handler: (data) => {
            if (data.list) {
              return data.list.map(
                (item: { id: string; name: string; username: string }) => ({
                  id: item.id,
                  name: item.name,
                  username: item.username,
                })
              );
            }
          },
        },
      });
    }
  );
};

export default setupUserTools;
