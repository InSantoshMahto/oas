export interface ContactObject {
  name?: string;
  url?: string;
  email?: string;
}

export interface LicenseObject {
  name: string;
  url?: string;
}

export interface ServerObject {
  url: string;
  description?: string;
  variables?: Record<string, any>;
}

export interface InfoObject {
  title: string;
  description?: string;
  version: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
}

export interface OpenAPIObject {
  openapi: string;
  info: InfoObject;
  servers?: ServerObject[];
  paths: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
    [key: string]: any;
  };
  tags?: any[];
  externalDocs?: any;
}

export interface DocumentOptions {
  title?: string;
  description?: string;
  version?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  servers?: ServerObject[];
  tags?: any[];
  externalDocs?: any;
}
