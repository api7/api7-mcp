// Resource type definitions
export type Node = {
  id: number | string;
  name: string;
}

export type Route = {
  id: number | string;
  name: string;
  path: string;
  method: string;
  plugins: string[];
}

export type Upstream = {
  name: string;
  checks?:{
    active?: boolean;
    passive?: boolean;
  }
}

export type Service = {
  id: number | string;
  name?: string;
  routes: Route[];
  upstream: Upstream;
}

export type GlobalRule = {
  id: number | string;
  name: string;
  plugins: string[];
}

export type SSL = {
  id: number | string;
  name: string;
  common_name: string;
  exptime: string;
}

export type Consumer = {
  id: number | string;
  name: string;
  plugins: string[];
}

export type GatewayGroup = {
  id: number | string;
  name: string;
  publishedServices: Service[];
  globalRules: GlobalRule[];
  ssl: SSL[];
  consumer: Consumer[];
}

export type ResourceOverview = {
  gatewayGroups: GatewayGroup[];
  customPlugins: string[];
}

export type CustomPlugin = {
  id: number | string;
  name: string;
}
