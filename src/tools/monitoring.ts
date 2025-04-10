import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import makeAPIRequest from "../request.js";
import dayjs from "dayjs";
import { 
  prometheusMetricsSchema, 
  PrometheusMetricsArgs, 
  timeStepMapping
} from "../types/monitoring.js";

const calculate_time_range = (raw_time: string) => {
  const now = dayjs();
  const end = now.toISOString();
  
  const match = raw_time.match(/^(\d+)([mhd])$/);
  if (!match) {
    return { start: undefined, end: undefined };
  }
  
  const [, value, unit] = match;
  const numValue = parseInt(value, 10);
  
  let start;
  switch (unit) {
    case 'm':
      start = now.subtract(numValue, 'minute');
      break;
    case 'h':
      start = now.subtract(numValue, 'hour');
      break;
    case 'd':
      start = now.subtract(numValue, 'day');
      break;
    default:
      return { start: undefined, end: undefined };
  }
  
  return { start: start.toISOString(), end };
};

const setupMonitoringTools = (server: McpServer) => {
  server.tool(
    "get_prometheus_metrics", 
    "Get Prometheus metrics from API7 Gateway, including status code distribution, request failures, total requests, bandwidth usage, latency, connections, and QPS",
    prometheusMetricsSchema,
    async (args) => {
      const { 
        type, 
        start: user_start, 
        end: user_end, 
        step, 
        route_id, 
        raw_time = '15m', 
        service_id, 
        instance_id, 
        gateway_group_id 
      } = args as PrometheusMetricsArgs;

      const { start: calculated_start, end: calculated_end } = calculate_time_range(raw_time);
      const start = user_start || calculated_start;
      const end = user_end || calculated_end;

      const condition = Object.entries({
        service_id,
        route_id,
        instance_id,
        gateway_group_id,
      })
        .filter(([, v]) => v !== undefined)
        .filter(([, v]) => !!v)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');

      const connections_conditions = Object.entries({
        instance_id,
        gateway_group_id,
      })
        .filter(([, v]) => v !== undefined)
        .filter(([, v]) => !!v)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');

      const dStep = timeStepMapping[raw_time as keyof typeof timeStepMapping] || step || '15s';
      
      const requestData = {
        'api-status-dist': {
          params: {
            query: `sum(increase(apisix_http_status{${condition}}[${raw_time}])) by (code) != 0`,
          },
          url: `/api/v1/query`,
        },
        'api-failure-requests': {
          params: {
            query: `sum(increase(apisix_http_status{code=~"^[4-5]\\\\d\\\\d",${condition}}[${raw_time}]))`,
          },
          url: `/api/v1/query`,
        },
        'api-requests': {
          params: {
            query: `sum(increase(apisix_http_status{${condition}}[${raw_time}]))`,
          },
          url: `/api/v1/query`,
        },
        'api-bandwidth': {
          params: {
            query: `sum by(type)(rate(apisix_bandwidth{${condition}}[1m]))`,
            start,
            end,
            step: dStep,
          },
          url: `/api/v1/query_range`,
        },
        'api-latency': {
          params: {
            query: `sum(rate(apisix_http_latency_sum{type='request',${condition}}[1m])/(1 + rate(apisix_http_latency_count{type='request',${condition}}[1m])))`,
            start,
            end,
            step: dStep,
          },
          url: `/api/v1/query_range`,
        },
        'api-connections': {
          params: {
            query: `sum(apisix_nginx_http_current_connections{${connections_conditions}}) by (state)`,
            start,
            end,
            step: dStep,
          },
          url: `/api/v1/query_range`,
        },
        'api-qps': {
          params: {
            query: `sum by (code) (rate(apisix_http_status{${condition}}[1m])) != 0`,
            start,
            end,
            step: dStep,
          },
          url: `/api/v1/query_range`,
        },
      };

      const metricTypesToFetch = Array.isArray(type) ? type : [type];
      
      const results = await Promise.all(
        metricTypesToFetch.map(async (metricType) => {
          const result = await makeAPIRequest({
            url: `/api/control_plane/prometheus${requestData[metricType].url}`,
            params: requestData[metricType].params,
          });
          
          return {
            metricType,
            data: result.content[0].text as string
          };
        })
      );
      
      if (metricTypesToFetch.length === 1) {
        return {
          content: [
            {
              type: "text",
              text: results[0].data,
            },
          ],
        };
      }
      
      const metricsData: Record<string, unknown> = {};
      
      results.forEach(({ metricType, data }) => {
        metricsData[metricType] = data;
      });
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(metricsData, null, 2),
          },
        ],
      };
    }
  );
};

export default setupMonitoringTools; 