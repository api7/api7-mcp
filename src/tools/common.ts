import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GetResourceSchema } from "../types/common.js";
import makeAPIRequest from "../request.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const setupCommonTools = (server: McpServer) => {
  server.tool(
    "get_resource",
    "Get resource details by ID or list resources based on filters, pass in the input object of the corresponding resource to get the data of the corresponding resource",
    GetResourceSchema.shape,
    async (args) => {
      const result: CallToolResult = {
        content: [],
      };
      const keys = Object.keys(args);
      if(keys.length === 0){
        return {
          isError:true,
          content: [
            {
              type: "text",
              text: "No resource parameters passed in",
            },
          ],
        };
      }

      const results: CallToolResult[] = [];
      for (const key of keys) {
        switch(key){
          case "publishedService":  
            if( args?.publishedService && "service_id" in args.publishedService){
              results.push(await makeAPIRequest({url: `/apisix/admin/services/${args.publishedService.service_id}`, method: "GET"}));
            }
            else{
              results.push(await makeAPIRequest({url: "/apisix/admin/services", method: "GET", params: args.publishedService}));
            }
            break;
          case "upstream":
            if(args.upstream?.upstream_id){
              results.push(await makeAPIRequest({url: `${args.upstream.service_id}/upstreams/${args.upstream.upstream_id}`, method: "GET",params:{
                ...args.upstream,
                gateway_group_id: args.upstream.gateway_group_id
              }}));
            }
            else{
              results.push(await makeAPIRequest({url: `${args.upstream?.service_id}/upstreams`, method: "GET", params: args.upstream}));
            }
            break;
          case "serviceTemplate":
            if( args?.serviceTemplate && "service_template_id" in args.serviceTemplate){
              results.push(await makeAPIRequest({url: `/api/services/template/${args.serviceTemplate.service_template_id}`, method: "GET"}));
            }
            else{
              results.push(await makeAPIRequest({url: "/api/services/template", method: "GET", data: args.serviceTemplate}));
            }
            break;
          case "route":
            if( args?.route && "route_id" in args.route){
              results.push(await makeAPIRequest({url: `/apisix/admin/routes/${args.route.route_id}`, method: "GET",params:{
                gateway_group_id: args.route.gateway_group_id
              }}));
            }
            else{
              results.push(await makeAPIRequest({url: "/apisix/admin/routes", method: "GET", params: args.route}));
            }
            break;
          case "stream_route":
            if( args?.stream_route && "route_id" in args.stream_route){
              results.push(await makeAPIRequest({url: `/apisix/admin/stream_routes/${args.stream_route.route_id}`, method: "GET",params:{
                gateway_group_id: args.stream_route.gateway_group_id
              }}));
            }
            else{
              results.push(await makeAPIRequest({url: "/apisix/admin/stream_routes", method: "GET", data: args.stream_route,params:{
                gateway_group_id: args.stream_route?.gateway_group_id
              }}));
            }
            break;
          case "secretProvider":
            if( args?.secretProvider && "secret_provider_id" in args.secretProvider){
              results.push(await makeAPIRequest({url: `/apisix/admin/secret_providers/${args.secretProvider.secret_provider_id}`, method: "GET",params:{
                gateway_group_id: args.secretProvider.gateway_group_id
              }}));
            }
            else{
              results.push(await makeAPIRequest({url: "/apisix/admin/secret_providers", method: "GET", data: args.secretProvider,params:{
                gateway_group_id: args.secretProvider?.gateway_group_id
              }}));
            }
            break;
          case "certificate":
            if( args?.certificate && "certificate_id" in args.certificate){
              results.push(await makeAPIRequest({url: `/apisix/admin/certificates/${args.certificate.certificate_id}`, method: "GET",params:{
                gateway_group_id: args.certificate.gateway_group_id
              }}));  
            }
            else{
              results.push(await makeAPIRequest({url: "/apisix/admin/certificates", method: "GET", data: args.certificate,params:{
                gateway_group_id: args.certificate?.gateway_group_id
              }}));
            }
            break;
          case "consumer":
            if( args?.consumer && "username" in args.consumer){
              results.push(await makeAPIRequest({url: `/apisix/admin/consumers/${args.consumer.username}`, method: "GET",params:{
                gateway_group_id: args.consumer.gateway_group_id
              }}));
            }
            else{
              results.push(await makeAPIRequest({url: "/apisix/admin/consumers", method: "GET",params:{
                ...args.consumer,
                gateway_group_id: args.consumer?.gateway_group_id
              }}));
            }
            break;
          case "credential":
            if( args?.credential && "credential_id" in args.credential){
                results.push(await makeAPIRequest({url: `/apisix/admin/consumers/${args.credential.username}/credentials/${args.credential.credential_id}`, method: "GET",params:{
                gateway_group_id: args.credential.gateway_group_id
              }}));
            }
            else{
              results.push(await makeAPIRequest({url: `/apisix/admin/consumers/${args.credential?.username}/credentials`, method: "GET", data: args.credential,params:{
                gateway_group_id: args.credential?.gateway_group_id
              }}));
            }
            break;
          case "gatewayGroup":
            if( args?.gatewayGroup && "gateway_group_id" in args.gatewayGroup){
              results.push(await makeAPIRequest({url: `/api/gateway_groups/${args.gatewayGroup.gateway_group_id}`, method: "GET"}));
            }
            else{
              results.push(await makeAPIRequest({url: "/api/gateway_groups", method: "GET", params: args.gatewayGroup}));
            }
            break;
          case "caCertificate":
            if( args?.caCertificate && "ca_certificate_id" in args.caCertificate){
              results.push(await makeAPIRequest({url: `/apisix/admin/ca_certificates/${args.caCertificate.ca_certificate_id}`, method: "GET",params:{
                gateway_group_id: args.caCertificate.gateway_group_id
              }}));
            }
            else{
              results.push(await makeAPIRequest({url: "/apisix/admin/ca_certificates", method: "GET", params: args.caCertificate}));
            }
            break;
          case "sni":
            if( args?.sni && "sni_id" in args.sni){
              results.push(await makeAPIRequest({url: `/apisix/admin/snis/${args.sni.sni_id}`, method: "GET",params:{
                gateway_group_id: args.sni.gateway_group_id
              }}));
            }
            else{
              results.push(await makeAPIRequest({url: "/apisix/admin/snis", method: "GET", params: args.sni}));
            }
            break;
          case "globalRules":
            if( args?.globalRules && "rule_id" in args.globalRules){
              results.push(await makeAPIRequest({url: `/apisix/admin/global_rules/${args.globalRules.rule_id}`, method: "GET",params:{
                gateway_group_id: args.globalRules.gateway_group_id
              }}));
            }
            else{
              results.push(await makeAPIRequest({url: "/apisix/admin/global_rules", method: "GET", params: args.globalRules}));
            }
            break;
          case "pluginMetadata":
            if( args?.pluginMetadata && "plugin_name" in args.pluginMetadata){
              results.push(await makeAPIRequest({url: `/apisix/admin/plugin_metadata/${args.pluginMetadata.plugin_name}`, method: "GET",params:{
                gateway_group_id: args.pluginMetadata.gateway_group_id
              }}));
            }
            else{
              results.push(await makeAPIRequest({url: "/apisix/admin/plugin_metadata", method: "GET", params: args.pluginMetadata}));
            }
            break;
          case "gatewayInstance":
            if( args?.gatewayInstance && "gateway_group_id" in args.gatewayInstance){
              results.push(await makeAPIRequest({url: `/api/gateway_groups/${args.gatewayInstance.gateway_group_id}/instances`, method: "GET"}));
            }
            else{
              results.push(await makeAPIRequest({url: "/api/instances", method: "GET", params: args.gatewayInstance}));
            }
            break;
          case "serviceRegistry":
            if( args?.serviceRegistry && "service_registry_id" in args.serviceRegistry){
              results.push(await makeAPIRequest({url: `/api/gateway_groups/${args.serviceRegistry.gateway_group_id}/service_registries/${args.serviceRegistry.service_registry_id}`, method: "GET"}));
            }
            else{
              results.push(await makeAPIRequest({url: `/api/gateway_groups/${args.serviceRegistry?.gateway_group_id}/service_registries`, method: "GET", params: args.serviceRegistry}));
            }
            break;
          case "customPlugin":
            if( args?.customPlugin && "custom_plugin_id" in args.customPlugin){
              results.push(await makeAPIRequest({url: `/api/custom_plugins/${args.customPlugin.custom_plugin_id}`, method: "GET",params:{
                gateway_group_id: args.customPlugin.gateway_group_id
              }}));
            }
            else{
              results.push(await makeAPIRequest({url: "/api/custom_plugins", method: "GET", params: args.customPlugin}));
            }
            break;
        }
      }

      for (const res of results) {
        if (res.isError) {
          return res; 
        }
        
        if (Array.isArray(res.content)) {
          res.content.forEach(item => {
            result.content.push(item);
          });
        }
      }

      return result;
    }
  );
};

export default setupCommonTools;