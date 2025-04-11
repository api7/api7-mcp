import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import makeAPIRequest from "../request.js";
import dayjs from "dayjs";
import { 
  prometheusMetricsSchema, 
  PrometheusMetricsArgs, 
  timeStepMapping,
  PrometheusValue,
  PrometheusResultItem
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

/**
 * Formats timestamp to readable date-time format (YYYY-MM-DD HH:MM:SS)
 */
const formatTimestamp = (timestamp: string | number): string => {
  return dayjs(Number(timestamp) * 1000).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Compress time series data by keeping only the start and end points of each value range
 */
const compressTimeSeriesData = (data: Record<string, number>): Record<string, number> => {
  if (!data || Object.keys(data).length <= 2) {
    return data;
  }
  
  const sortedTimes = Object.keys(data).sort();
  const compressedData: Record<string, number> = {};
  
  let currentValue = data[sortedTimes[0]];
  let startTime = sortedTimes[0];
  let lastTime = startTime;
  
  // Add the first time point
  compressedData[startTime] = currentValue;
  
  // Iterate and find change points
  for (let i = 1; i < sortedTimes.length; i++) {
    const time = sortedTimes[i];
    const value = data[time];
    
    if (value !== currentValue) {
      // Value changed, add the end time point of previous value (if not the start point)
      if (lastTime !== startTime) {
        compressedData[lastTime] = currentValue;
      }
      
      // Record the start time point of the new value
      compressedData[time] = value;
      currentValue = value;
      startTime = time;
    }
    
    lastTime = time;
  }
  
  // Add the last time point (if not equal to the start time)
  if (lastTime !== startTime) {
    compressedData[lastTime] = currentValue;
  }
  
  return compressedData;
};

/**
 * Process Prometheus metric data based on metric type
 */
const processMetricData = (metricType: string, data: Array<PrometheusResultItem>): Record<string, unknown> => {
  try {
    
    // Basic result structure
    const result: Record<string, unknown> = {};
    
    // Utility function: filter non-zero values and format timestamps
    const filterNonZeroAndFormatTimestamp = (values: PrometheusValue[]): Record<string, number> => {
      const filteredData: Record<string, number> = {};
      
      if (values && values.length > 0) {
        values.forEach((v: PrometheusValue) => {
          const value = Number(v[1]);
          if (!isNaN(value) && value !== 0) {  // Filter out data points with zero value
            const formattedTime = formatTimestamp(v[0]);
            filteredData[formattedTime] = value;
          }
        });
      }
      
      return compressTimeSeriesData(filteredData);
    };
    
    // Process data based on different metric types
    switch (metricType) {
      case 'api-status-dist': {
        // Status code distribution - keep only non-zero values
        const statusCounts: Record<string, Record<string, number>> = {};
        let totalRequests = 0;
        
        if (data && data.length > 0) {
          // First collect all status code counts and calculate the total
          data.forEach((item: PrometheusResultItem) => {
            if (item.metric?.code && item.value?.[1]) {
              const count = Number(item.value[1]);
              if (!isNaN(count) && count !== 0) {
                const code = item.metric.code;
                const timestamp = formatTimestamp(item.value[0]);
                
                if (!statusCounts[code]) {
                  statusCounts[code] = {};
                }
                
                // Round the count
                const roundedCount = Math.round(count);
                statusCounts[code][timestamp] = roundedCount;
                totalRequests += roundedCount;
              }
            }
          });
          
          // Compress time series data for each status code
          Object.keys(statusCounts).forEach(code => {
            statusCounts[code] = compressTimeSeriesData(statusCounts[code]);
          });
          
          // Calculate percentages and format results
          if (totalRequests > 0) {
            Object.keys(statusCounts).forEach(code => {
              // Calculate the percentage of this status code in total requests
              const codeCount = Object.values(statusCounts[code]).reduce((sum, count) => sum + count, 0);
              const percentage = (codeCount / totalRequests) * 100;
              
              result[code] = {
                count: statusCounts[code],
                percent: Math.round(percentage * 100) / 100 // Keep two decimal places
              };
            });
          }
        }
        
        // If no data, return explanation message
        if (Object.keys(result).length === 0) {
          result["no_data"] = true;
          result["message"] = "No request data in this period";
        }
        
        return result;
      }
      
      case 'api-failure-requests': {
        // Request count - keep only non-zero values
        if (data && data.length > 0) {
          const timeseriesData: Record<string, number> = {};
          
          data.forEach((item: PrometheusResultItem) => {
            if (item.value?.[1]) {
              const count = Number(item.value[1]);
              if (!isNaN(count) && count !== 0) {
                const timestamp = formatTimestamp(item.value[0]);
                timeseriesData[timestamp] = count;
              }
            }
          });
          
          // Compress time series data
          Object.assign(result, compressTimeSeriesData(timeseriesData));
        }
        
        // If no data, return explanation message
        if (Object.keys(result).length === 0) {
          result["no_data"] = true;
          result["message"] = "No failed requests in this period";
        }
        
        return result;
      }
      
      case 'api-requests': {
        // Request count - keep only non-zero values
        if (data && data.length > 0) {
          const timeseriesData: Record<string, number> = {};
          
          data.forEach((item: PrometheusResultItem) => {
            if (item.value?.[1]) {
              const count = Number(item.value[1]);
              if (!isNaN(count) && count !== 0) {
                const timestamp = formatTimestamp(item.value[0]);
                timeseriesData[timestamp] = count;
              }
            }
          });
          
          // Compress time series data
          Object.assign(result, compressTimeSeriesData(timeseriesData));
        }
        
        // If no data, return explanation message
        if (Object.keys(result).length === 0) {
          result["no_data"] = true;
          result["message"] = "No requests in this period";
        }
        
        return result;
      }
      
      case 'api-bandwidth': {
        // Bandwidth data - group by type and keep only non-zero values
        const bandwidthTypes: Record<string, Record<string, number>> = {};
        
        if (data && data.length > 0) {
          data.forEach((series: PrometheusResultItem) => {
            const type = series.metric?.type || 'unknown';
            
            if (series.values && series.values.length > 0) {
              const filteredData = filterNonZeroAndFormatTimestamp(series.values);
              
              if (Object.keys(filteredData).length > 0) {
                bandwidthTypes[type] = filteredData;
              }
            }
          });
        }
        
        // Only add bandwidth types with non-zero values
        for (const [type, data] of Object.entries(bandwidthTypes)) {
          if (Object.keys(data).length > 0) {
            result[type] = data;
          }
        }
        
        // If no data, return explanation message
        if (Object.keys(result).length === 0) {
          result["no_data"] = true;
          result["message"] = "No bandwidth usage in this period";
        }
        
        return result;
      }
      
      case 'api-latency': {
        // Latency data - keep only non-zero values
        if (data && data.length > 0) {
          const latencyData = filterNonZeroAndFormatTimestamp(data[0].values || []);
          
          if (Object.keys(latencyData).length > 0) {
            result["latency"] = latencyData;
          }
        }
        
        // If no data, return explanation message
        if (Object.keys(result).length === 0) {
          result["no_data"] = true;
          result["message"] = "No latency data in this period";
        }
        
        return result;
      }
      
      case 'api-connections': {
        // Connection data - group by state and keep only non-zero values
        if (data && data.length > 0) {
          data.forEach((series: PrometheusResultItem) => {
            const state = series.metric?.state || 'unknown';
            
            if (series.values && series.values.length > 0) {
              const filteredData = filterNonZeroAndFormatTimestamp(series.values);
              
              if (Object.keys(filteredData).length > 0) {
                result[state] = filteredData;
              }
            }
          });
        }
        
        // If no data, return explanation message
        if (Object.keys(result).length === 0) {
          result["no_data"] = true;
          result["message"] = "No connection data in this period";
        }
        
        return result;
      }
      
      case 'api-qps': {
        // QPS data - group by status code and keep only non-zero values
        if (data && data.length > 0) {
          data.forEach((series: PrometheusResultItem) => {
            const code = series.metric?.code || 'unknown';
            
            if (series.values && series.values.length > 0) {
              const filteredData = filterNonZeroAndFormatTimestamp(series.values);
              
              if (Object.keys(filteredData).length > 0) {
                result[`code_${code}`] = filteredData;
              }
            }
          });
        }
        
        // If no data, return explanation message
        if (Object.keys(result).length === 0) {
          result["no_data"] = true;
          result["message"] = "No QPS data in this period";
        }
        
        return result;
      }
      
      default:
        // By default, try to process any time series data, filtering zero values
        if (data && data.length > 0) {
          data.forEach((series: PrometheusResultItem, index: number) => {
            const metricName = Object.entries(series.metric || {})
              .map(([k, v]) => `${k}:${v}`)
              .join('_') || `series_${index}`;
            
            if (series.values && series.values.length > 0) {
              const filteredData = filterNonZeroAndFormatTimestamp(series.values);
              
              if (Object.keys(filteredData).length > 0) {
                result[metricName] = filteredData;
              }
            } else if (series.value) {
              const value = Number(series.value[1]);
              if (!isNaN(value) && value !== 0) {
                const timestamp = formatTimestamp(series.value[0]);
                if (!result[metricName]) {
                  result[metricName] = {};
                }
                (result[metricName] as Record<string, number>)[timestamp] = value;
              }
            }
          });
          
          // Compress time series data for each metric
          Object.keys(result).forEach(metricName => {
            if (typeof result[metricName] === 'object' && result[metricName] !== null) {
              result[metricName] = compressTimeSeriesData(result[metricName] as Record<string, number>);
            }
          });
        }
        
        // If no data, return explanation message
        if (Object.keys(result).length === 0) {
          result["no_data"] = true;
          result["message"] = `No ${metricType} data in this period`;
        }
        
        return result;
    }
  } catch (error) {
    console.error(`Error processing metric ${metricType}:`, error);
    return {
      error: `Error processing metric ${metricType}`,
      message: String(error)
    };
  }
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

      // Calculate time range if not provided by user
      const { start: calculated_start, end: calculated_end } = calculate_time_range(raw_time);
      const start = user_start || calculated_start;
      const end = user_end || calculated_end;

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
      const dStep = timeStepMapping[raw_time as keyof typeof timeStepMapping] || step || '15s';
      
      // Define query parameters for each metric type
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