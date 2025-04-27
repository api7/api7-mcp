# API7 MCP Server

## Supported Operations

### Common Operations

- `get_resource`: Get resource details by ID or list resources based on filters
- `send_request_to_gateway`: Send a request or multiple requests to the API7ee gateway instance

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

### Monitoring

- `get_prometheus_metrics`: Get Prometheus metrics from API7 Gateway, including status code distribution, request failures, total requests, bandwidth usage, latency, connections, and QPS

### Risk Management

- `check_risk`: Scan API7 resources configurations for security, performance, and compliance risks, then generates a structured report with actionable fixes

## Configuration in AI Client

### Prerequisite

Ensure you have API7 Enterprise Edition properly installed and configured.

### Using NPM

Configure your AI client (Cursor, Claude, Copilot, etc.) with following settings:

```json
{
  "mcpServers": {
    "api7-mcp": {
      "command": "npx",
      "args": ["-y","api7-mcp"],
      "env": {
        "CONTROL_PLANE_URL": "your-api7ee-control-plane-url",
        "GATEWAY_SERVER_URL":"your-api7ee-gateway-server-url",
        "TOKEN": "your-api7ee-token"
      }
    }
  }
}
```

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
      "args": ["your-project-path/dist/index.js"],
      "env": {
        "CONTROL_PLANE_URL": "your-api7ee-control-plane-url",
        "GATEWAY_SERVER_URL":"your-api7ee-gateway-server-url",
        "TOKEN": "your-api7ee-token"
      }
    }
  }
}
```

## Environment Variables

| Variable             | Description                     |
| -------------------- | ------------------------------- |
| `CONTROL_PLANE_URL`  | API7ee control plane server url |
| `GATEWAY_SERVER_URL` | API7ee gateway server url       |
| `TOKEN`              | API7ee Token                    |

## Conversation Examples

### Common Operations

- "Show me the details of the service with ID 'svc123'."
- "List all routes in the 'prod' gateway group."
- "Send a GET request to '/status' on the gateway."

### Permission Management

- "Adjust xiaolin's permissions to only view the default gateway group."
- "Modify xiaolin's permissions to prevent viewing and editing consumer credential resources in any gateway group."
- "Update xiaolin's permissions to only view gateway groups with labels team: R&D and region: shenzhen."
- "What permissions does xiaolin currently have?"
- "Create a new permission policy named 'ReadOnlyConsumers' that only allows viewing consumers."
- "Attach the 'ReadOnlyConsumers' policy to the 'Auditor' role."
- "Remove the 'AdminAccess' policy from the 'Intern' role."

### Role Management

- "List all available roles."
- "Create a new role called 'DevOps'."
- "Delete the 'TemporaryAccess' role."
- "Assign the 'DevOps' and 'Monitoring' roles to the user 'johndoe'."

### User Management

- "What roles does the user with ID 'user456' have?"
- "Find the user ID for the username 'alice'."

### Monitoring

- "Show me the current QPS for the gateway."
- "Get the latency metrics for the past hour."

### Risk Management

- "Check my API configurations for any security risks."
- "Generate a risk report for the 'staging' environment."
