import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GetResourceSchema } from "../types/common.js";
import makeAPIRequest from "../request.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const setupCommonTools = (server: McpServer) => {
  server.tool(
    "get_resource",
    "Get resource details by ID or list resources based on filters",
    GetResourceSchema.shape,
    async (args) => {
      let result: CallToolResult = {
        content: [],
      };
      Object.keys(args).forEach(async (key) => {
        switch(key){
          case "publishedService":  
            if( args?.publishedService && "service_id" in args.publishedService){
              result = await makeAPIRequest({url: `/services/${args.publishedService.service_id}`, method: "GET"});
            }
            else{
              result = await makeAPIRequest({url: "/services", method: "GET", params: args.publishedService});
            }
            break;
          case "upstream":
            if(args.upstream?.upstream_id){
              result = await makeAPIRequest({url: `${args.upstream.service_id}/upstreams/${args.upstream.upstream_id}`, method: "GET",params:{
                ...args.upstream,
                gateway_group_id: args.upstream.gateway_group_id
              }});
            }
            else{
              result = await makeAPIRequest({url: `${args.upstream?.service_id}/upstreams`, method: "GET", params: args.upstream});
            }
            break;
          case "serviceTemplate":
            if( args?.serviceTemplate && "service_template_id" in args.serviceTemplate){
              result = await makeAPIRequest({url: `/service_templates/${args.serviceTemplate.service_template_id}`, method: "GET"});
            }
            else{
              result = await makeAPIRequest({url: "/service_templates", method: "GET", data: args.serviceTemplate});
            }
            break;
          case "route":
            if( args?.route && "route_id" in args.route){
              result = await makeAPIRequest({url: `/routes/${args.route.route_id}`, method: "GET",params:{
                gateway_group_id: args.route.gateway_group_id
              }});
            }
            else{
              result = await makeAPIRequest({url: "/routes", method: "GET", params: args.route});
            }
            break;
          case "stream_route":
            if( args?.stream_route && "route_id" in args.stream_route){
              result = await makeAPIRequest({url: `/stream_routes/${args.stream_route.route_id}`, method: "GET",params:{
                gateway_group_id: args.stream_route.gateway_group_id
              }});
            }
            else{
              result = await makeAPIRequest({url: "/stream_routes", method: "GET", data: args.stream_route,params:{
                gateway_group_id: args.stream_route?.gateway_group_id
              }});
            }
            break;
          case "secretProvider":
            if( args?.secretProvider && "secret_provider_id" in args.secretProvider){
              result = await makeAPIRequest({url: `/secret_providers/${args.secretProvider.secret_provider_id}`, method: "GET",params:{
                gateway_group_id: args.secretProvider.gateway_group_id
              }});
            }
            else{
              result = await makeAPIRequest({url: "/secret_providers", method: "GET", data: args.secretProvider,params:{
                gateway_group_id: args.secretProvider?.gateway_group_id
              }});
            }
            break;
          case "certificate":
            if( args?.certificate && "certificate_id" in args.certificate){
              result = await makeAPIRequest({url: `/certificates/${args.certificate.certificate_id}`, method: "GET",params:{
                gateway_group_id: args.certificate.gateway_group_id
              }});  
            }
            else{
              result = await makeAPIRequest({url: "/certificates", method: "GET", data: args.certificate,params:{
                gateway_group_id: args.certificate?.gateway_group_id
              }});
            }
            break;
          case "consumer":
            if( args?.consumer && "username" in args.consumer){
              result = await makeAPIRequest({url: `/consumers/${args.consumer.username}`, method: "GET",params:{
                gateway_group_id: args.consumer.gateway_group_id
              }});
            }
            else{
              result = await makeAPIRequest({url: "/consumers", method: "GET",params:{
                ...args.consumer,
                gateway_group_id: args.consumer?.gateway_group_id
              }});
            }
            break;
          case "credential":
            if( args?.credential && "credential_id" in args.credential){
                result = await makeAPIRequest({url: `consumers/${args.credential.username}/credentials/${args.credential.credential_id}`, method: "GET",params:{
                gateway_group_id: args.credential.gateway_group_id
              }});
            }
            else{
              result = await makeAPIRequest({url: `consumers/${args.credential?.username}/credentials`, method: "GET", data: args.credential,params:{
                gateway_group_id: args.credential?.gateway_group_id
              }});
            }
            break;
          case "gatewayGroup":
            if( args?.gatewayGroup && "gateway_group_id" in args.gatewayGroup){
              result = await makeAPIRequest({url: `/gateway_groups/${args.gatewayGroup.gateway_group_id}`, method: "GET"});
            }
            else{
              result = await makeAPIRequest({url: "/gateway_groups", method: "GET", params: args.gatewayGroup});
            }
        }
      })
      return result;
    }
  );
};
