# API7 MCP Server

## Supported Operations

### Permission Management

- `get_permission_policy`: Get permission policy details by ID or list permission policies
- `create_permission_policy`: Create a permission policy
- `update_permission_policy`: Update a permission policy
- `attach_permission_policy_to_role`: Attach a permission policy to a role
- `detach_permission_policy_from_role`: Detach a permission policy from a role
- `get_permission_policy_by_role`: Get permission policies attached to a role

### Role Management

- `get_role`: Get role details by ID or list roles
- `create_role`: Create a role
- `delete_role`: Delete a role
- `update_assigned_roles_for_user`: Update assigned roles for a user

### User Management

- `get_role_by_user_id`: Get role details by user ID
- `get_userId_by_username`: Get user ID by username

## Configuration in AI Client

### Prerequisite

Ensure you have API7 Enterprise Edition properly installed and configured.

### Using Source Code

Clone the repository:

```bash
git clone https://github.com/api7/api7-mcp.git
cd api7-mcp
```

Install dependencies and build the project:

```bash
pnpm install
pnpm build
```

Configure your AI client (Cursor, Claude, Copilot, etc.) with following settings:

```json
{
  "mcpServers": {
    "api7-mcp": {
      "command": "node",
      "args": [
        "your-project-path/dist/index.js"
      ],
      "env": {
        "CONTROL_PLANE_HOST": "your-api7ee-control-plane-host",
        "TOKEN": "your-api7ee-token"
      }
    }
  }
}
```

## Environment Variables

| Variable                  | Description                          |
| ------------------------- | ------------------------------------ |
| `CONTROL_PLANE_ADDRESS`   | API7ee control plane server host           |
| `TOKEN`                   | API7ee Token |

## Conversation Examples

- "Adjust xiaolin's permissions to only view the default gateway group"
- "Modify xiaolin's permissions to prevent viewing and editing consumer credential resources in any gateway group"
- "Update xiaolin's permissions to only view gateway groups with tags team: R&D and region: shenzhen"
- "What permissions does xiaolin currently have?"

