import dayjs from "dayjs";
import { PrometheusResultItem, PrometheusValue, PrometheusMetric } from "../types/monitoring.js";
import { TIME_STEP_MAPPING } from "../types/monitoring.js";
export const calculateTimeStep = (rawTime: string): string => {

    if (rawTime in TIME_STEP_MAPPING) {
      return TIME_STEP_MAPPING[rawTime as keyof typeof TIME_STEP_MAPPING];
    }

    const match = rawTime.match(/^(\d+)([mhd])$/);
    if (!match) {
      return '15s';
    }

    const [, value, unit] = match;
    const numValue = parseInt(value, 10);
    
    let totalSeconds = 0;
    switch (unit) {
      case 'm':
        totalSeconds = numValue * 60;
        break;
      case 'h':
        totalSeconds = numValue * 60 * 60;
        break;
      case 'd':
        totalSeconds = numValue * 24 * 60 * 60;
        break;
      default:
        return '15s';
    }
    
    const MAX_DATA_POINTS = 5000;
    
    const minStepSeconds = Math.ceil(totalSeconds / MAX_DATA_POINTS);
    
    if (minStepSeconds <= 15) return '15s';
    if (minStepSeconds <= 30) return '30s';
    if (minStepSeconds <= 60) return '60s';
    if (minStepSeconds <= 2 * 60) return '2m';
    if (minStepSeconds <= 5 * 60) return '5m';
    if (minStepSeconds <= 10 * 60) return '10m';
    if (minStepSeconds <= 30 * 60) return '30m';
    if (minStepSeconds <= 60 * 60) return '1h';
    
    return Math.ceil(minStepSeconds / 3600) + 'h';
  }

export const calculateTimeRange = (rawTime: string) => {
    const now = dayjs();
    const end = now.toISOString();
    
    const match = rawTime.match(/^(\d+)([mhd])$/);
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
    compressedData[startTime] = roundToTwoDecimals(currentValue);
    
    // Iterate and find change points
    for (let i = 1; i < sortedTimes.length; i++) {
      const time = sortedTimes[i];
      const value = data[time];
      
      if (value !== currentValue) {
        // Value changed, add the end time point of previous value (if not the start point)
        if (lastTime !== startTime) {
          compressedData[lastTime] = roundToTwoDecimals(currentValue);
        }
        
        // Record the start time point of the new value
        compressedData[time] = roundToTwoDecimals(value);
        currentValue = value;
        startTime = time;
      }
      
      lastTime = time;
    }
    
    // Add the last time point (if not equal to the start time)
    if (lastTime !== startTime) {
      compressedData[lastTime] = roundToTwoDecimals(currentValue);
    }
    
    return compressedData;
  };
  
  /**
   * Round number to two decimal places
   */
  const roundToTwoDecimals = (num: number): number => {
    return Math.round(num * 100) / 100;
  };
  
  /**
   * Process Prometheus metric data based on metric type
   */
 export const processMetricData = (metricType: string, data: Array<PrometheusResultItem>): Record<string, unknown> => {
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
              filteredData[formattedTime] = roundToTwoDecimals(value);
            }
          });
        }
        
        return compressTimeSeriesData(filteredData);
      };
  
      // Helper function to get group dimension key
      const getGroupDimensionKey = (metric: PrometheusMetric): string => {
        const dimensions = [];
        if (metric.service_id) dimensions.push(`service:${metric.service_id}`);
        if (metric.route_id) dimensions.push(`route:${metric.route_id}`);
        if (metric.instance_id) dimensions.push(`instance:${metric.instance_id}`);
        if (metric.gateway_group_id) dimensions.push(`gateway_group:${metric.gateway_group_id}`);
        return dimensions.length > 0 ? dimensions.join(' ') : 'all-resources';
      };
      
      // Process data based on different metric types
      switch (metricType) {
        case 'api-status-dist': {
          // Status code distribution - keep only non-zero values and group by dimensions
          const groupedStatusCounts: Record<string, Record<string, Record<string, number>>> = {};
          
          if (data && data.length > 0) {
            // First collect all status code counts grouped by dimensions
            data.forEach((item: PrometheusResultItem) => {
              if (item.metric?.code && item.value?.[1]) {
                const count = Number(item.value[1]);
                if (!isNaN(count) && count !== 0) {
                  const code = item.metric.code;
                  const timestamp = formatTimestamp(item.value[0]);
                  const groupKey = getGroupDimensionKey(item.metric);
                  
                  if (!groupedStatusCounts[groupKey]) {
                    groupedStatusCounts[groupKey] = {};
                  }
                  
                  if (!groupedStatusCounts[groupKey][code]) {
                    groupedStatusCounts[groupKey][code] = {};
                  }
                  
                  // Round the count
                  const roundedCount = Math.round(count);
                  groupedStatusCounts[groupKey][code][timestamp] = roundedCount;
                }
              }
            });
            
            // Process each group
            for (const [groupKey, statusCounts] of Object.entries(groupedStatusCounts)) {
              let totalRequests = 0;
              
              // Compress time series data for each status code and calculate total
              Object.keys(statusCounts).forEach(code => {
                statusCounts[code] = compressTimeSeriesData(statusCounts[code]);
                totalRequests += Object.values(statusCounts[code]).reduce((sum, count) => sum + count, 0);
              });
              
              // Calculate percentages and format results
              if (totalRequests > 0) {
                const groupResults: Record<string, unknown> = {};
                
                Object.keys(statusCounts).forEach(code => {
                  // Calculate the percentage of this status code in total requests
                  const codeCount = Object.values(statusCounts[code]).reduce((sum, count) => sum + count, 0);
                  const percentage = (codeCount / totalRequests) * 100;
                  
                  groupResults[code] = {
                    count: statusCounts[code],
                    percent: roundToTwoDecimals(percentage) // Keep two decimal places
                  };
                });
                
                result[groupKey] = groupResults;
              }
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
          // Request count - keep only non-zero values, grouped by dimensions
          if (data && data.length > 0) {
            const groupedData: Record<string, Record<string, number>> = {};
            
            data.forEach((item: PrometheusResultItem) => {
              if (item.value?.[1]) {
                const count = Math.round(Number(item.value[1]));
                if (!isNaN(count) && count !== 0) {
                  const timestamp = formatTimestamp(item.value[0]);
                  const groupKey = getGroupDimensionKey(item.metric);
                  
                  if (!groupedData[groupKey]) {
                    groupedData[groupKey] = {};
                  }
                  
                  groupedData[groupKey][timestamp] = roundToTwoDecimals(count);
                }
              }
            });
            
            // Compress time series data for each group
            for (const [groupKey, timeseriesData] of Object.entries(groupedData)) {
              result[groupKey] = compressTimeSeriesData(timeseriesData);
            }
          }
          
          // If no data, return explanation message
          if (Object.keys(result).length === 0) {
            result["no_data"] = true;
            result["message"] = "No failed requests in this period";
          }
          
          return result;
        }
        
        case 'api-requests': {
          // Request count - keep only non-zero values, grouped by dimensions
          if (data && data.length > 0) {
            const groupedData: Record<string, Record<string, number>> = {};
            
            data.forEach((item: PrometheusResultItem) => {
              if (item.value?.[1]) {
                const count = Number(item.value[1]);
                if (!isNaN(count) && count !== 0) {
                  const timestamp = formatTimestamp(item.value[0]);
                  const groupKey = getGroupDimensionKey(item.metric);
                  
                  if (!groupedData[groupKey]) {
                    groupedData[groupKey] = {};
                  }
                  
                  groupedData[groupKey][timestamp] = roundToTwoDecimals(count);
                }
              }
            });
            
            // Compress time series data for each group
            for (const [groupKey, timeseriesData] of Object.entries(groupedData)) {
              result[groupKey] = compressTimeSeriesData(timeseriesData);
            }
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
          const bandwidthTypes: Record<string, Record<string, Record<string, number>>> = {};
          
          if (data && data.length > 0) {
            data.forEach((series: PrometheusResultItem) => {
              const type = series.metric?.type || 'unknown';
              const groupKey = getGroupDimensionKey(series.metric);
              
              if (!bandwidthTypes[groupKey]) {
                bandwidthTypes[groupKey] = {};
              }
              
              if (!bandwidthTypes[groupKey][type]) {
                bandwidthTypes[groupKey][type] = {};
              }
              
              if (series.values && series.values.length > 0) {
                const filteredData = filterNonZeroAndFormatTimestamp(series.values);
                
                if (Object.keys(filteredData).length > 0) {
                  bandwidthTypes[groupKey][type] = filteredData;
                }
              }
            });
          }
          
          // Only add bandwidth types with non-zero values
          for (const [groupKey, typeData] of Object.entries(bandwidthTypes)) {
            if (Object.keys(typeData).length > 0) {
              result[groupKey] = typeData;
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
          // Latency data - keep only non-zero values, grouped by dimensions
          const groupedLatency: Record<string, Record<string, number>> = {};
          
          if (data && data.length > 0) {
            data.forEach((series: PrometheusResultItem) => {
              const groupKey = getGroupDimensionKey(series.metric);
              
              if (series.values && series.values.length > 0) {
                const filteredData = filterNonZeroAndFormatTimestamp(series.values);
                
                if (Object.keys(filteredData).length > 0) {
                  groupedLatency[groupKey] = filteredData;
                }
              }
            });
          }
          
          // Process the grouped latency data
          for (const [groupKey, latencyData] of Object.entries(groupedLatency)) {
            if (Object.keys(latencyData).length > 0) {
              if (!result[groupKey]) {
                result[groupKey] = {};
              }
              (result[groupKey] as Record<string, unknown>)["latency"] = latencyData;
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
          // Connection data - group by state and dimensions
          const groupedConnections: Record<string, Record<string, Record<string, number>>> = {};
          
          if (data && data.length > 0) {
            data.forEach((series: PrometheusResultItem) => {
              const state = series.metric?.state || 'unknown';
              const groupKey = getGroupDimensionKey(series.metric);
              
              if (!groupedConnections[groupKey]) {
                groupedConnections[groupKey] = {};
              }
              
              if (series.values && series.values.length > 0) {
                const filteredData = filterNonZeroAndFormatTimestamp(series.values);
                
                if (Object.keys(filteredData).length > 0) {
                  groupedConnections[groupKey][state] = filteredData;
                }
              }
            });
          }
          
          // Process the grouped connections data
          for (const [groupKey, stateData] of Object.entries(groupedConnections)) {
            if (Object.keys(stateData).length > 0) {
              result[groupKey] = stateData;
            }
          }
          
          // If no data, return explanation message
          if (Object.keys(result).length === 0) {
            result["no_data"] = true;
            result["message"] = "No connection data in this period";
          }
          
          return result;
        }
        
        case 'api-qps': {
          // QPS data - group by status code and dimensions
          const groupedQps: Record<string, Record<string, Record<string, number>>> = {};
          
          if (data && data.length > 0) {
            data.forEach((series: PrometheusResultItem) => {
              const code = series.metric?.code || 'unknown';
              const groupKey = getGroupDimensionKey(series.metric);
              
              if (!groupedQps[groupKey]) {
                groupedQps[groupKey] = {};
              }
              
              if (series.values && series.values.length > 0) {
                const filteredData = filterNonZeroAndFormatTimestamp(series.values);
                
                if (Object.keys(filteredData).length > 0) {
                  groupedQps[groupKey][`code_${code}`] = filteredData;
                }
              }
            });
          }
          
          // Process the grouped QPS data
          for (const [groupKey, codeData] of Object.entries(groupedQps)) {
            if (Object.keys(codeData).length > 0) {
              result[groupKey] = codeData;
            }
          }
          
          // If no data, return explanation message
          if (Object.keys(result).length === 0) {
            result["no_data"] = true;
            result["message"] = "No QPS data in this period";
          }
          
          return result;
        }
        
        default: {
          // By default, try to process any time series data, filtering zero values
          const groupedMetrics: Record<string, Record<string, Record<string, number>>> = {};
          
          if (data && data.length > 0) {
            data.forEach((series: PrometheusResultItem, index: number) => {
              const metricName = Object.entries(series.metric || {})
                .map(([k, v]) => `${k}:${v}`)
                .join('_') || `series_${index}`;
              
              const groupKey = getGroupDimensionKey(series.metric);
              
              if (!groupedMetrics[groupKey]) {
                groupedMetrics[groupKey] = {};
              }
              
              if (series.values && series.values.length > 0) {
                const filteredData = filterNonZeroAndFormatTimestamp(series.values);
                
                if (Object.keys(filteredData).length > 0) {
                  groupedMetrics[groupKey][metricName] = filteredData;
                }
              } else if (series.value) {
                const value = Number(series.value[1]);
                if (!isNaN(value) && value !== 0) {
                  const timestamp = formatTimestamp(series.value[0]);
                  
                  if (!groupedMetrics[groupKey][metricName]) {
                    groupedMetrics[groupKey][metricName] = {};
                  }
                  
                  groupedMetrics[groupKey][metricName][timestamp] = roundToTwoDecimals(value);
                }
              }
            });
            
            // Compress time series data for each metric in each group
            for (const [groupKey, metrics] of Object.entries(groupedMetrics)) {
              const groupResult: Record<string, unknown> = {};
              
              for (const [metricName, data] of Object.entries(metrics)) {
                groupResult[metricName] = compressTimeSeriesData(data);
              }
              
              if (Object.keys(groupResult).length > 0) {
                result[groupKey] = groupResult;
              }
            }
          }
          
          // If no data, return explanation message
          if (Object.keys(result).length === 0) {
            result["no_data"] = true;
            result["message"] = `No ${metricType} data in this period`;
          }
          
          return result;
        }
      }
    } catch (error) {
      console.error(`Error processing metric ${metricType}:`, error);
      return {
        error: `Error processing metric ${metricType}`,
        message: String(error)
      };
    }
  };