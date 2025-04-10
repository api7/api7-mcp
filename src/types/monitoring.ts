import { z } from "zod";

export const metricTypes = [
  'api-status-dist',
  'api-failure-requests',
  'api-requests',
  'api-bandwidth',
  'api-latency',
  'api-connections',
  'api-qps',
] as const;

export const timeStepMapping = {
  '1m': '10s',
  '5m': '10s',
  '15m': '15s',
  '30m': '30s',
  '1h': '60s',
  '4h': '4m',
  '12h': '12m',
  '1d': '24m',
  '7d': '2h',
  '15d': '4h',
  '30d': '8h',
} as const;

const metricTypeEnum = z.enum(metricTypes);

export const prometheusMetricsSchema = {
  type: z.union([
    metricTypeEnum,
    z.array(metricTypeEnum)
  ]).describe("Metric type, options: api-status-dist(status code distribution), api-failure-requests(failed requests), api-requests(total requests), api-bandwidth(bandwidth), api-latency(latency), api-connections(connections), api-qps(queries per second)"),
  start: z.string().optional().describe("Start time in ISO format, e.g.: 2025-04-10T02:34:00.878Z"),
  end: z.string().optional().describe("End time in ISO format, e.g.: 2025-04-10T03:04:00.878Z"),
  step: z.string().optional().describe("Step interval, e.g.: 15s, 1m"),
  raw_time: z.string().optional().describe("Time range, e.g.: 1m, 5m, 15m, 30m, 1h, 4h, 12h, 1d, 7d, 15d, 30d"),
  route_id: z.string().optional().describe("Route ID"),
  service_id: z.string().optional().describe("Service ID"),
  instance_id: z.string().optional().describe("Instance ID"),
  gateway_group_id: z.string().optional().describe("Gateway Group ID"),
};

export const prometheusMetricsSchemaObject = z.object(prometheusMetricsSchema);
export type PrometheusMetricsArgs = z.infer<typeof prometheusMetricsSchemaObject>;
export type MetricType = typeof metricTypes[number];
export type TimeStep = keyof typeof timeStepMapping;
