import {
  DocumentOptions,
  ExternalDocumentationObject,
  TagObject,
  SecuritySchemeObject,
  SecurityRequirementObject,
  HttpSecurityScheme,
  ApiKeySecurityScheme,
  OAuth2SecurityScheme,
  OAuthFlowsObject,
} from "./types";

export class DocumentBuilder {
  private options: DocumentOptions = {};

  // ─── Core metadata ───────────────────────────────────────────────────────

  setTitle(title: string) {
    this.options.title = title;
    return this;
  }

  setDescription(description: string) {
    this.options.description = description;
    return this;
  }

  setVersion(version: string) {
    this.options.version = version;
    return this;
  }

  setTermsOfService(tosUrl: string) {
    this.options.termsOfService = tosUrl;
    return this;
  }

  setContact(name: string, url?: string, email?: string) {
    this.options.contact = { name, url, email };
    return this;
  }

  setLicense(name: string, url?: string) {
    this.options.license = { name, url };
    return this;
  }

  setExternalDoc(description: string, url: string) {
    this.options.externalDocs = { description, url };
    return this;
  }

  // ─── Servers & tags ──────────────────────────────────────────────────────

  addServer(url: string, description?: string) {
    if (!this.options.servers) this.options.servers = [];
    this.options.servers.push({ url, description });
    return this;
  }

  /**
   * Add an OpenAPI tag.
   * @param name         Tag name (used in @ApiTags on controllers)
   * @param description  Optional human-readable description
   * @param externalDocs Optional link to external documentation
   */
  addTag(
    name: string,
    description?: string,
    externalDocs?: ExternalDocumentationObject,
  ) {
    if (!this.options.tags) this.options.tags = [];
    const tag: TagObject = { name };
    if (description !== undefined) tag.description = description;
    if (externalDocs !== undefined) tag.externalDocs = externalDocs;
    this.options.tags.push(tag);
    return this;
  }

  // ─── Security schemes ────────────────────────────────────────────────────

  private addSecurityScheme(name: string, scheme: SecuritySchemeObject) {
    if (!this.options.securitySchemes) this.options.securitySchemes = {};
    this.options.securitySchemes[name] = scheme;
    return this;
  }

  /**
   * Add a Bearer (JWT) HTTP security scheme.
   *
   * @example
   *   builder.addBearerAuth()
   *   // → securitySchemes: { bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }
   *
   * @param options  Partial overrides for the scheme object
   * @param name     The key used in `securitySchemes` (default: `'bearer'`)
   */
  addBearerAuth(options: Partial<HttpSecurityScheme> = {}, name = "bearer") {
    return this.addSecurityScheme(name, {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Enter JWT Bearer token",
      ...options,
    });
  }

  /**
   * Add a Basic HTTP authentication security scheme.
   *
   * @param options  Partial overrides
   * @param name     The key used in `securitySchemes` (default: `'basic'`)
   */
  addBasicAuth(options: Partial<HttpSecurityScheme> = {}, name = "basic") {
    return this.addSecurityScheme(name, {
      type: "http",
      scheme: "basic",
      description: "HTTP Basic authentication",
      ...options,
    });
  }

  /**
   * Add an API Key security scheme (header, query, or cookie).
   *
   * @example
   *   builder.addApiKey({ in: 'header', name: 'X-API-KEY' }, 'ApiKey')
   *
   * @param options  Partial overrides; defaults to `X-API-KEY` in header
   * @param name     The key used in `securitySchemes` (default: `'api_key'`)
   */
  addApiKey(options: Partial<ApiKeySecurityScheme> = {}, name = "api_key") {
    return this.addSecurityScheme(name, {
      type: "apiKey",
      in: "header",
      name: "X-API-KEY",
      description: "API key authentication",
      ...options,
    });
  }

  /**
   * Add a Cookie-based security scheme (modelled as an `apiKey` in `cookie`).
   *
   * @example
   *   builder.addCookieAuth('session_id')
   *
   * @param cookieName  Name of the cookie (default: `'access_token'`)
   * @param options     Partial overrides
   * @param name        The key used in `securitySchemes` (default: `'cookie'`)
   */
  addCookieAuth(
    cookieName = "access_token",
    options: Partial<ApiKeySecurityScheme> = {},
    name = "cookie",
  ) {
    return this.addSecurityScheme(name, {
      type: "apiKey",
      in: "cookie",
      name: cookieName,
      description: "Cookie-based authentication",
      ...options,
    });
  }

  /**
   * Add an OAuth2 security scheme.
   *
   * @example
   *   builder.addOAuth2({
   *     authorizationCode: {
   *       authorizationUrl: 'https://example.com/oauth/authorize',
   *       tokenUrl: 'https://example.com/oauth/token',
   *       scopes: { read: 'Read access', write: 'Write access' },
   *     },
   *   })
   *
   * @param flows   OAuth2 flow definitions
   * @param options Partial overrides for the scheme object
   * @param name    The key used in `securitySchemes` (default: `'oauth2'`)
   */
  addOAuth2(
    flows: OAuthFlowsObject = {},
    options: Partial<OAuth2SecurityScheme> = {},
    name = "oauth2",
  ) {
    return this.addSecurityScheme(name, {
      type: "oauth2",
      flows,
      ...options,
    });
  }

  /**
   * Add a global security requirement that applies to every operation unless
   * overridden at the operation level.
   *
   * @example
   *   // Require bearer auth globally
   *   builder.addBearerAuth().addSecurityRequirements('bearer')
   *
   *   // Require OAuth2 scopes globally
   *   builder.addOAuth2(...).addSecurityRequirements('oauth2', ['read', 'write'])
   *
   * @param securityName  Name of a security scheme defined in this builder,
   *                      or a full `SecurityRequirementObject` map.
   * @param scopes        Required scopes (relevant for OAuth2 / OpenIdConnect)
   */
  addSecurityRequirements(
    securityName: string | SecurityRequirementObject,
    scopes: string[] = [],
  ) {
    if (!this.options.security) this.options.security = [];
    const requirement: SecurityRequirementObject =
      typeof securityName === "string"
        ? { [securityName]: scopes }
        : securityName;
    this.options.security.push(requirement);
    return this;
  }

  // ─── Build ───────────────────────────────────────────────────────────────

  build(): DocumentOptions {
    if (!this.options.title) this.options.title = "API";
    if (!this.options.version) this.options.version = "1.0.0";
    return { ...this.options };
  }
}
