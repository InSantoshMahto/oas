/**
 * compat-swagger.ts
 *
 * Wrapper that prefers `@nestjs/swagger` for spec generation when available.
 *
 * Behaviour:
 *   - If `@nestjs/swagger` can be required at runtime, ALL calls on
 *     `DocumentBuilder` and `createDocument` are delegated to it so you get
 *     the battle-tested generator — including any new methods introduced in
 *     future versions of the package.
 *   - Otherwise the local minimal implementations are used as a fallback.
 *
 * The previous hand-maintained proxy approach required every new upstream
 * method to be listed explicitly; unknown methods silently became no-ops.
 * This version uses a JS `Proxy` to forward *every* method call dynamically,
 * eliminating that class of bugs.
 */

import { DocumentOptions, OpenAPIObject } from "./types";
import { DocumentBuilder as LocalDocumentBuilder } from "./document-builder";
import { createDocument as localCreateDocument } from "./create-document";

function tryRequire(name: string): any | null {
  try {
    // Runtime require so consumers don't need @nestjs/swagger unless they want it.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(name);
  } catch {
    return null;
  }
}

const swaggerPkg = tryRequire("@nestjs/swagger");

// ─── DocumentBuilder ────────────────────────────────────────────────────────

/**
 * A transparent proxy builder.
 *
 * Extends `LocalDocumentBuilder` so TypeScript knows the full method surface.
 * At runtime the constructor replaces `this` with a JS Proxy wrapping the
 * upstream `@nestjs/swagger` DocumentBuilder (or the local one), so every
 * call — including methods introduced in future upstream releases — is
 * forwarded automatically.
 *
 * Fluent chains (`return this`) are preserved, so:
 *
 *   new DocumentBuilder()
 *     .setTitle('My API')
 *     .addBearerAuth()   // upstream-only method: forwarded transparently
 *     .build()
 *
 * works exactly as expected regardless of which backend is active.
 */
export class DocumentBuilder extends LocalDocumentBuilder {
  constructor() {
    super(); // satisfy TypeScript; replaced by the proxy return below

    const inner: any = swaggerPkg?.DocumentBuilder
      ? new swaggerPkg.DocumentBuilder()
      : new LocalDocumentBuilder();

    // Build the proxy first so we can reference it in the `get` trap.
    // The trap intercepts every property access on `inner`:
    //   • Functions  → wrapped so that returning `inner` (fluent chaining)
    //                  is replaced with returning `proxy` instead.
    //   • Non-functions → returned as-is.
    const proxy: any = new Proxy(inner, {
      get(target: any, prop: string | symbol, _receiver: any) {
        const val = Reflect.get(target, prop, target);
        if (typeof val !== "function") return val;

        return (...args: any[]) => {
          const result = val.apply(target, args);
          // Maintain fluent chain: swap the inner's `this` for our proxy.
          return result === target ? proxy : result;
        };
      },
    });

    // Returning a non-undefined object from a constructor replaces the
    // normal `this`. The cast keeps TypeScript happy while still giving
    // callers a properly typed reference.
    return proxy as unknown as this;
  }
}

// ─── createDocument ─────────────────────────────────────────────────────────

/**
 * Prefer upstream `SwaggerModule.createDocument` when `@nestjs/swagger` is
 * installed; fall back to the local implementation otherwise.
 */
export function createDocument(
  app: any,
  config: DocumentOptions | any,
  options?: any,
): OpenAPIObject {
  if (
    swaggerPkg?.SwaggerModule &&
    typeof swaggerPkg.SwaggerModule.createDocument === "function"
  ) {
    try {
      // Forward all options (deepScanRoutes, ignoreGlobalPrefix, extraModels…)
      // to the upstream as-is.
      return swaggerPkg.SwaggerModule.createDocument(app, config, options);
    } catch {
      // Upstream failed for some reason — fall through to local generator.
    }
  }

  return localCreateDocument(app, config, options);
}
