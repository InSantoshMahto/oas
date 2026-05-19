// ─── Metadata ──────────────────────────────────────────────────────────────

export interface ContactObject {
  name?: string;
  url?: string;
  email?: string;
}

export interface LicenseObject {
  name: string;
  url?: string;
}

export interface ServerVariableObject {
  enum?: string[];
  default: string;
  description?: string;
}

export interface ServerObject {
  url: string;
  description?: string;
  variables?: Record<string, ServerVariableObject>;
}

export interface InfoObject {
  title: string;
  description?: string;
  version: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
}

export interface ExternalDocumentationObject {
  description?: string;
  url: string;
}

export interface TagObject {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
}

// ─── Schema / Reference ────────────────────────────────────────────────────

export interface ReferenceObject {
  $ref: string;
}

export interface SchemaObject {
  type?: string;
  format?: string;
  title?: string;
  description?: string;
  default?: any;
  example?: any;
  enum?: any[];
  nullable?: boolean;
  required?: string[];
  properties?: Record<string, SchemaObject | ReferenceObject>;
  additionalProperties?: boolean | SchemaObject | ReferenceObject;
  items?: SchemaObject | ReferenceObject;
  allOf?: (SchemaObject | ReferenceObject)[];
  oneOf?: (SchemaObject | ReferenceObject)[];
  anyOf?: (SchemaObject | ReferenceObject)[];
  not?: SchemaObject | ReferenceObject;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  [key: string]: any;
}

// ─── Examples ──────────────────────────────────────────────────────────────

export interface ExampleObject {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}

// ─── Parameters ────────────────────────────────────────────────────────────

export type ParameterLocation = "query" | "header" | "path" | "cookie";

export interface ParameterObject {
  name: string;
  in: ParameterLocation;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  schema?: SchemaObject | ReferenceObject;
  example?: any;
  examples?: Record<string, ExampleObject | ReferenceObject>;
}

// ─── Request / Response bodies ─────────────────────────────────────────────

export interface MediaTypeObject {
  schema?: SchemaObject | ReferenceObject;
  example?: any;
  examples?: Record<string, ExampleObject | ReferenceObject>;
  encoding?: Record<string, any>;
}

export interface RequestBodyObject {
  description?: string;
  content: Record<string, MediaTypeObject>;
  required?: boolean;
}

export interface ResponseObject {
  description: string;
  headers?: Record<string, any>;
  content?: Record<string, MediaTypeObject>;
  links?: Record<string, any>;
}

// ─── Operations ────────────────────────────────────────────────────────────

export type HttpMethod =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch"
  | "trace";

export interface OperationObject {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
  operationId?: string;
  parameters?: (ParameterObject | ReferenceObject)[];
  requestBody?: RequestBodyObject | ReferenceObject;
  responses: Record<string, ResponseObject | ReferenceObject>;
  callbacks?: Record<string, any>;
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
  servers?: ServerObject[];
}

export type PathItemObject = {
  summary?: string;
  description?: string;
  servers?: ServerObject[];
  parameters?: (ParameterObject | ReferenceObject)[];
} & Partial<Record<HttpMethod, OperationObject>>;

// ─── Security schemes ──────────────────────────────────────────────────────

export interface HttpSecurityScheme {
  type: "http";
  scheme: string; // e.g. "bearer" | "basic"
  bearerFormat?: string; // e.g. "JWT"
  description?: string;
}

export interface ApiKeySecurityScheme {
  type: "apiKey";
  name: string;
  in: "query" | "header" | "cookie";
  description?: string;
}

export interface OAuthFlowObject {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface OAuthFlowsObject {
  implicit?: OAuthFlowObject;
  password?: OAuthFlowObject;
  clientCredentials?: OAuthFlowObject;
  authorizationCode?: OAuthFlowObject;
}

export interface OAuth2SecurityScheme {
  type: "oauth2";
  flows: OAuthFlowsObject;
  description?: string;
}

export interface OpenIdConnectSecurityScheme {
  type: "openIdConnect";
  openIdConnectUrl: string;
  description?: string;
}

export type SecuritySchemeObject =
  | HttpSecurityScheme
  | ApiKeySecurityScheme
  | OAuth2SecurityScheme
  | OpenIdConnectSecurityScheme;

/** Maps scheme name → list of required scopes (empty array for non-OAuth2). */
export type SecurityRequirementObject = Record<string, string[]>;

// ─── Components ────────────────────────────────────────────────────────────

export interface ComponentsObject {
  schemas?: Record<string, SchemaObject | ReferenceObject>;
  responses?: Record<string, ResponseObject | ReferenceObject>;
  parameters?: Record<string, ParameterObject | ReferenceObject>;
  examples?: Record<string, ExampleObject | ReferenceObject>;
  requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;
  headers?: Record<string, any>;
  securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>;
  links?: Record<string, any>;
  callbacks?: Record<string, any>;
}

// ─── Root document ─────────────────────────────────────────────────────────

export interface OpenAPIObject {
  openapi: string;
  info: InfoObject;
  servers?: ServerObject[];
  paths: Record<string, PathItemObject>;
  components?: ComponentsObject;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
}

// ─── Builder options ───────────────────────────────────────────────────────

export interface DocumentOptions {
  title?: string;
  description?: string;
  version?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  servers?: ServerObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
  security?: SecurityRequirementObject[];
  /** Populated internally by addBearerAuth / addApiKey / addOAuth2 etc. */
  securitySchemes?: Record<string, SecuritySchemeObject>;
}
