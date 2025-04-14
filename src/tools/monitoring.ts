import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import makeAPIRequest from "../request.js";
import { 
  prometheusMetricsSchema, 
  PrometheusMetricsArgs, 
} from "../types/monitoring.js";
import { calculateTimeRange, calculateTimeStep, processMetricData } from "../utils/monitoring.js";

const setupMonitoringTools = (server: McpServer) => {
  server.tool(
    "get_prometheus_metrics", 
    "Get Prometheus metrics from API7 Gateway, including status code distribution, request failures, total requests, bandwidth usage, latency, connections, and QPS.\n When providing a resource ID, verify that the resource exists.",
    prometheusMetricsSchema.shape,
    async (args) => {
      const { 
        type, 
        step, 
        route_id, 
        raw_time = '15m', 
        service_id, 
        instance_id, 
        gateway_group_id,
        group_by = ['gateway_group_id']
      } = args as PrometheusMetricsArgs;
      
      const groupByClause = group_by ? group_by.join(',') : ''; 
      // Calculate time range if not provided by user
      const { start, end } = calculateTimeRange(raw_time);

      // Build filter conditions for metrics queries
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

      // Special condition for connections metrics
      const connections_conditions = Object.entries({
        instance_id,
        gateway_group_id,
      })
        .filter(([, v]) => v !== undefined)
        .filter(([, v]) => !!v)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');

      // Determine step size for time series data
      const dStep = step || calculateTimeStep(raw_time);
      
      // Define query parameters for each metric type
      const requestData = {
        'api-status-dist': {
          params: {
            query: `sum${groupByClause ? ` by (${groupByClause},code)` : ' by (code)'}(increase(apisix_http_status{${condition}}[${raw_time}])) != 0`,
          },
          url: `/api/v1/query`,
        },
        'api-failure-requests': {
          params: {
            query: `sum${groupByClause ? ` by (${groupByClause})` : ''}(increase(apisix_http_status{code=~"^[4-5]\\\\d\\\\d",${condition}}[${raw_time}]))`,
          },
          url: `/api/v1/query`,
        },
        'api-requests': {
          params: {
            query: `sum${groupByClause ? ` by (${groupByClause})` : ''}(increase(apisix_http_status{${condition}}[${raw_time}]))`,
          },
          url: `/api/v1/query`,
        },
        'api-bandwidth': {
          params: {
            query: `sum by(${groupByClause ? `${groupByClause},` : ''}type)(rate(apisix_bandwidth{${condition}}[1m]))`,
            start,
            end,
            step: dStep,
          },
          url: `/api/v1/query_range`,
        },
        'api-latency': {
          params: {
            query: `sum${groupByClause ? ` by (${groupByClause})` : ''}(rate(apisix_http_latency_sum{type='request',${condition}}[1m])/(1 + rate(apisix_http_latency_count{type='request',${condition}}[1m])))`,
            start,
            end,
            step: dStep,
          },
          url: `/api/v1/query_range`,
        },
        'api-connections': {
          params: {
            query: `sum${groupByClause ? ` by (${groupByClause},state)` : ' by (state)'}(apisix_nginx_http_current_connections{${connections_conditions}})`,
            start,
            end,
            step: dStep,
          },
          url: `/api/v1/query_range`,
        },
        'api-qps': {
          params: {
            query: `sum by (${groupByClause ? `${groupByClause},` : ''}code) (rate(apisix_http_status{${condition}}[1m])) != 0`,
            start,
            end,
            step: dStep,
          },
          url: `/api/v1/query_range`,
        },
      };

      // Handle both single and multiple metric types
      const metricTypesToFetch = Array.isArray(type) ? type : [type];
      
      // Fetch and process all requested metrics
      const results = await Promise.all(
        metricTypesToFetch.map(async (metricType) => {
          const result = await makeAPIRequest({
            url: `/api/control_plane/prometheus${requestData[metricType].url}`,
            params: requestData[metricType].params,
            raw: true
          });
          
          return {
            metricType,
            data: processMetricData(metricType, result.value.data.result),
          };
        })
      );
      
      if (metricTypesToFetch.length === 1) {
        // Return processed result for single metric type without nesting
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results[0], null, 2),
            },
          ],
        };
      }
      
      // Return multiple metrics in simplified format
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