export type Node = {
  id: string;
  name: string;
}

export type Route = {
  id: string;
  name: string;
  paths: string[];
  methods: string[];
  plugins?: string[];
}

export type Upstream = {
  name: string;
  checks?:{
    active?: boolean;
    passive?: boolean;
  }
}

export type Service = {
  id:   string;
  name?: string;
  path_prefix?: string;
  hosts?: string[];
  plugins?: string[];
  routes?: Route[];
  upstream: Upstream;
}

export type GlobalRule = {
  id:   string;
  name: string;
  plugins?: string[];
}

export type SSL = {
  id:   string;
  name: string;
  common_name: string;
  exptime: string;
}

export type Credential = {
  id: string;
  name: string;
  plugin: string;
}

export type Consumer = {
  id:   string;
  name: string;
  plugins?: string[];
  credentials?: Credential[];
}

export type GatewayGroup = {
  id:   string;
  name: string;
  publishedServices?: Service[];
  globalRules?: GlobalRule[];
  ssl?: SSL[];
  consumer?: Consumer[];
  caCertificate?: SSL[];
}

export type ResourceOverview = {
  gatewayGroups?: GatewayGroup[];
  customPlugins?: CustomPlugin[];
}

export type CustomPlugin = {
  id:   string;
  name: string;
}
