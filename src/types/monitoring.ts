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
  '5m': 15,
  '30m': 15,
  '1h': 15,
  '6h': 84,
  '12h': 168,
  '24h': 504,
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


export type PrometheusValue = [string, string];

// Metric with basic properties
export type PrometheusMetric =  {
  [key: string]: string;
}

// Prometheus result item structure
export type PrometheusResultItem = {
  metric: PrometheusMetric;
  value?: PrometheusValue;
  values?: PrometheusValue[];
}

// Prometheus response data structure
export type PrometheusData = {
  resultType: string;
  result: PrometheusResultItem[];
}

// Complete Prometheus API response
export type PrometheusResponse = {
  status: string;
  data: PrometheusData;
}

// Formatted metric data structures for different metric types
export type FormattedStatusDistData = {
  [key: string]: string;
}

export type FormattedSingleValueData = {
  [key: string]: string | number;
}

export type FormattedTimeSeriesData = {
  labels: string[];
  values: number[];
  summary: {
    [key: string]: string;
  };
}

export type FormattedBandwidthData = {
  labels: string[];
  incoming: number[];
  outgoing: number[];
  summary: {
    [key: string]: string;
  };
}

export type FormattedMultiSeriesData = {
  labels: string[];
  series: Record<string, number[]>;
  summary: Record<string, string>;
}

// Processed metric response types
export type BaseProcessedMetric = {
  type: string;
  title?: string;
  raw: PrometheusResponse;
}

export type FormattedMetric = BaseProcessedMetric & {
  type: "formatted";
  data: FormattedStatusDistData | FormattedSingleValueData | FormattedTimeSeriesData | FormattedBandwidthData | FormattedMultiSeriesData;
}

export type RawMetric = BaseProcessedMetric & {
  type: "raw";
  data: Record<string, unknown>;
}

export type ErrorMetric = {
  type: "error";
  error: string;
  data: string;
}

export type ProcessedMetric = FormattedMetric | RawMetric | ErrorMetric; 