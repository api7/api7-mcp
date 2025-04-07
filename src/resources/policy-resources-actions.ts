export default {
  action_resource_description: [
    {
      a: "gateway:GetGatewayGroup",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "List/get gateway groups",
    },
    {
      a: "gateway:CreateGatewayGroup",
      r: "arn:api7:gateway:gatewaygroup/*",
      d: "Create gateway group",
    },
    {
      a: "gateway:UpdateGatewayGroup",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Update/generate admin key",
    },
    {
      a: "gateway:DeleteGatewayGroup",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Delete gateway group",
    },
    {
      a: "gateway:GetPublishedService",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>/publishedservice/<published_service_id or *>",
      d: "List/get published services",
    },
    {
      a: "gateway:CreatePublishedService",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>/publishedservice/<published_service_id or *>",
      d: "Create published service",
    },
    {
      a: "gateway:UpdatePublishedService",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>/publishedservice/<published_service_id or *>",
      d: "Update/patch published service",
    },
    {
      a: "gateway:DeletePublishedService",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>/publishedservice/<published_service_id or *>",
      d: "Delete published service",
    },
    {
      a: "gateway:PublishServices",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>/publishedservice/*",
      d: "Publish service template",
    },
    {
      a: "gateway:GetGatewayInstance",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "List gateway instances",
    },
    {
      a: "gateway:GetGatewayInstanceCore",
      r: "arn:api7:gateway:gatewaygroup/*",
      d: "List/export instance cores",
    },
    {
      a: "gateway:CreateGatewayInstance",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Create instance certs/scripts",
    },
    {
      a: "iam:GetPermissionPolicy",
      r: "arn:api7:iam:permissionpolicy/<permission_policy_id or *>",
      d: "List/get permission policies",
    },
    {
      a: "iam:CreatePermissionPolicy",
      r: "arn:api7:iam:permissionpolicy/*",
      d: "Create permission policy",
    },
    {
      a: "iam:UpdatePermissionPolicy",
      r: "arn:api7:iam:permissionpolicy/<permission_policy_id or *>",
      d: "Update permission policy",
    },
    {
      a: "iam:DeletePermissionPolicy",
      r: "arn:api7:iam:permissionpolicy/<permission_policy_id or *>",
      d: "Delete permission policy",
    },
    { a: "iam:GetRole", r: "arn:api7:iam:role/{role_id}", d: "List/get roles" },
    { a: "iam:CreateRole", r: "arn:api7:iam:role/*", d: "Create role" },
    {
      a: "iam:UpdateRole",
      r: "arn:api7:iam:role/<role_id or *>",
      d: "Update/attach/detach roles",
    },
    {
      a: "iam:DeleteCustomRole",
      r: "arn:api7:iam:role/<role_id or *>",
      d: "Delete role",
    },
    { a: "iam:GetUser", r: "arn:api7:iam:user/{user_id}", d: "List/get users" },
    { a: "iam:InviteUser", r: "arn:api7:iam:user/*", d: "Invite user" },
    {
      a: "iam:UpdateUserRole",
      r: "arn:api7:iam:user/<user_id or *>",
      d: "Update user roles",
    },
    {
      a: "iam:ResetPassword",
      r: "arn:api7:iam:user/<user_id or *>",
      d: "Reset password",
    },
    { a: "iam:DeleteUser", r: "arn:api7:iam:user/{user_id}", d: "Delete user" },
    {
      a: "gateway:GetCertificate",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "List/get SSL/CA certificates",
    },
    {
      a: "gateway:CreateCertificate",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Create SSL/CA certificate",
    },
    {
      a: "gateway:UpdateCertificate",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Update/patch certificates",
    },
    {
      a: "gateway:DeleteCertificate",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Delete certificate",
    },
    {
      a: "gateway:GetSNI",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "List/get SNIs",
    },
    {
      a: "gateway:CreateSNI",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Create SNI",
    },
    {
      a: "gateway:UpdateSNI",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Update/patch SNI",
    },
    {
      a: "gateway:DeleteSNI",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Delete SNI",
    },
    {
      a: "gateway:GetGlobalPluginRule",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "List/get global rules",
    },
    {
      a: "gateway:CreateGlobalPluginRule",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Create global rule",
    },
    {
      a: "gateway:UpdateGlobalPluginRule",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Update global rule",
    },
    {
      a: "gateway:DeleteGlobalPluginRule",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Delete global rule",
    },
    {
      a: "gateway:GetPluginMetadata",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "List/get plugin metadata",
    },
    {
      a: "gateway:UpdatePluginMetadata",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Update plugin metadata",
    },
    {
      a: "gateway:DeletePluginMetadata",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Delete plugin metadata",
    },
    {
      a: "gateway:GetConsumer",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>/consumer/<consumer_id or *>",
      d: "List/get consumers",
    },
    {
      a: "gateway:CreateConsumer",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>/consumer/*",
      d: "Create consumer",
    },
    {
      a: "gateway:UpdateConsumer",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>/consumer/<consumer_id or *>",
      d: "Update consumer",
    },
    {
      a: "gateway:DeleteConsumer",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>/consumer/<consumer_id or *>",
      d: "Delete consumer",
    },
    {
      a: "gateway:GetConsumerCredential",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>/consumer/<consumer_id or *>",
      d: "List consumer credentials",
    },
    {
      a: "gateway:CreateConsumerCredential",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>/consumer/<consumer_id or *>",
      d: "Create credential",
    },
    {
      a: "gateway:UpdateConsumerCredential",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>/consumer/<consumer_id or *>",
      d: "Update credential",
    },
    {
      a: "gateway:DeleteConsumerCredential",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>/consumer/<consumer_id or *>",
      d: "Delete credential",
    },
    {
      a: "gateway:GetSecretProvider",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "List/get secret providers",
    },
    {
      a: "gateway:PutSecretProvider",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Update secret",
    },
    {
      a: "gateway:DeleteSecretProvider",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Delete secret",
    },
    {
      a: "gateway:GetServiceRegistry",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "List/get service registries",
    },
    {
      a: "gateway:ConnectServiceRegistry",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Create registry connection",
    },
    {
      a: "gateway:UpdateServiceRegistry",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Update registry connection",
    },
    {
      a: "gateway:DisconnectServiceRegistry",
      r: "arn:api7:gateway:gatewaygroup/<gateway_group_id or *>",
      d: "Delete registry connection",
    },
    {
      a: "gateway:GetServiceTemplate",
      r: "arn:api7:gateway:servicetemplate/<service_template_id or *>",
      d: "List/get service templates",
    },
    {
      a: "gateway:CreateServiceTemplate",
      r: "arn:api7:gateway:servicetemplate/*",
      d: "Create/import template",
    },
    {
      a: "gateway:UpdateServiceTemplate",
      r: "arn:api7:gateway:servicetemplate/<service_template_id or *>",
      d: "Update/patch template",
    },
    {
      a: "gateway:DeleteServiceTemplate",
      r: "arn:api7:gateway:servicetemplate/<service_template_id or *>",
      d: "Delete template",
    },
    {
      a: "gateway:UpdateDeploymentSetting",
      r: "arn:api7:gateway:gatewaysetting/*",
      d: "Update deployment settings",
    },
    {
      a: "iam:UpdateSCIMProvisioning",
      r: "arn:api7:iam:organization/*",
      d: "Update SCIM/generate token",
    },
    {
      a: "iam:GetSCIMProvisioning",
      r: "arn:api7:iam:organization/*",
      d: "Get SCIM settings",
    },
    {
      a: "iam:GetContactPoint",
      r: "arn:api7:iam:contactpoint/<contact_point_id or *>",
      d: "List/get contact points",
    },
    {
      a: "iam:CreateContactPoint",
      r: "arn:api7:iam:contactpoint/*",
      d: "Create contact point",
    },
    {
      a: "iam:UpdateContactPoint",
      r: "arn:api7:iam:contactpoint/<contact_point_id or *>",
      d: "Update contact point",
    },
    {
      a: "iam:DeleteContactPoint",
      r: "arn:api7:iam:contactpoint/<contact_point_id or *>",
      d: "Delete contact point",
    },
    {
      a: "iam:GetLoginOption",
      r: "arn:api7:iam:organization/*",
      d: "Get login option",
    },
    {
      a: "iam:CreateLoginOption",
      r: "arn:api7:iam:organization/*",
      d: "Create login option",
    },
    {
      a: "iam:UpdateLoginOption",
      r: "arn:api7:iam:organization/*",
      d: "Update/patch login option",
    },
    {
      a: "iam:DeleteLoginOption",
      r: "arn:api7:iam:organization/*",
      d: "Delete login option",
    },
    {
      a: "gateway:GetCustomPlugin",
      r: "arn:api7:gateway:gatewaysetting/*",
      d: "List/get custom plugins",
    },
    {
      a: "gateway:CreateCustomPlugin",
      r: "arn:api7:gateway:gatewaysetting/*",
      d: "Create custom plugin",
    },
    {
      a: "gateway:UpdateCustomPlugin",
      r: "arn:api7:gateway:gatewaysetting/*",
      d: "Update custom plugin",
    },
    {
      a: "gateway:DeleteCustomPlugin",
      r: "arn:api7:gateway:gatewaysetting/*",
      d: "Delete custom plugin",
    },
    {
      a: "gateway:GetAlertPolicy",
      r: "arn:api7:gateway:alert/*",
      d: "List/get alert policies",
    },
    {
      a: "gateway:CreateAlertPolicy",
      r: "arn:api7:gateway:alert/*",
      d: "Create alert policy",
    },
    {
      a: "gateway:UpdateAlertPolicy",
      r: "arn:api7:gateway:alert/*",
      d: "Update/patch alert policy",
    },
    {
      a: "gateway:DeleteAlertPolicy",
      r: "arn:api7:gateway:alert/*",
      d: "Delete alert policy",
    },
    {
      a: "iam:UpdateLicense",
      r: "arn:api7:iam:organization/*",
      d: "Update API7 license",
    },
    {
      a: "iam:GetAudit",
      r: "arn:api7:iam:organization/*",
      d: "List audit logs",
    },
    {
      a: "iam:ExportAudits",
      r: "arn:api7:iam:organization/*",
      d: "Export audit logs",
    },
  ],
};
