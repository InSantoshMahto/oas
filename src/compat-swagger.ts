/**
 * compat-swagger.ts
 * Wrapper that prefers `@nestjs/swagger` for spec generation when available.
 *
 * Behavior:
 * - If `@nestjs/swagger` can be required at runtime, delegate `DocumentBuilder`
 *   and `createDocument` to it (so you get the battle-tested generator).
 * - Otherwise, fall back to the local minimal implementations.
 *
 * This allows consumers to opt-in to the upstream generator by installing
 * `@nestjs/swagger`, while keeping this package usable without it.
 */

import { DocumentOptions, OpenAPIObject } from "./types";
import { DocumentBuilder as LocalDocumentBuilder } from "./document-builder";
import { createDocument as localCreateDocument } from "./create-document";

function tryRequire(name: string): any | null {
  try {
    // runtime require so consumers don't have to install @nestjs/swagger
    // unless they want to.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(name);
  } catch (err) {
    return null;
  }
}

const swaggerPkg = tryRequire("@nestjs/swagger");

/**
 * A thin proxy builder. Methods are proxied to the upstream DocumentBuilder
 * (if available) or to the local `DocumentBuilder` implementation.
 */
export class DocumentBuilder {
  private inner: any;

  constructor() {
    if (swaggerPkg && swaggerPkg.DocumentBuilder) {
      this.inner = new swaggerPkg.DocumentBuilder();
    } else {
      this.inner = new LocalDocumentBuilder();
    }
  }

  setTitle(title: string) {
    if (this.inner && typeof this.inner.setTitle === "function")
      this.inner.setTitle(title);
    return this;
  }

  setDescription(description: string) {
    if (this.inner && typeof this.inner.setDescription === "function")
      this.inner.setDescription(description);
    return this;
  }

  setVersion(version: string) {
    if (this.inner && typeof this.inner.setVersion === "function")
      this.inner.setVersion(version);
    return this;
  }

  setTermsOfService(tosUrl: string) {
    if (this.inner && typeof this.inner.setTermsOfService === "function")
      this.inner.setTermsOfService(tosUrl);
    return this;
  }

  setContact(name: string, url?: string, email?: string) {
    if (this.inner && typeof this.inner.setContact === "function")
      this.inner.setContact(name, url, email);
    return this;
  }

  setLicense(name: string, url?: string) {
    if (this.inner && typeof this.inner.setLicense === "function")
      this.inner.setLicense(name, url);
    return this;
  }

  addServer(url: string, description?: string) {
    if (this.inner && typeof this.inner.addServer === "function")
      this.inner.addServer(url, description);
    return this;
  }

  addTag(tag: any) {
    if (this.inner && typeof this.inner.addTag === "function")
      this.inner.addTag(tag);
    return this;
  }

  build() {
    if (this.inner && typeof this.inner.build === "function")
      return this.inner.build();
    return {};
  }
}

/**
 * createDocument wrapper: prefer upstream `SwaggerModule.createDocument` when
 * available, otherwise use the local `createDocument` implementation.
 */
export function createDocument(
  app: any,
  config: DocumentOptions | any,
  options?: any,
): OpenAPIObject {
  if (
    swaggerPkg &&
    swaggerPkg.SwaggerModule &&
    typeof swaggerPkg.SwaggerModule.createDocument === "function"
  ) {
    try {
      // Forward all options (deepScanRoutes, ignoreGlobalPrefix, extraModels, etc.)
      // to the upstream createDocument as-is.
      return swaggerPkg.SwaggerModule.createDocument(app, config, options);
    } catch (err) {
      // If upstream fails for some reason, fall back to local generator.
      return localCreateDocument(app, config, options);
    }
  }

  return localCreateDocument(app, config, options);
}
