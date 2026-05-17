import { OpenAPIObject, DocumentOptions } from "./types";

/**
 * Create a minimal OpenAPI document from a Nest application and builder config.
 *
 * This is intentionally small — the goal is to provide the surface and a
 * simple implementation that can be expanded to fully replicate the behaviour
 * of @nestjs/swagger's generator.
 */
export function createDocument(
  app: any,
  config: DocumentOptions,
  options?: { deepScanRoutes?: boolean },
): OpenAPIObject {
  const info = {
    title: config.title || "API",
    description: config.description,
    version: config.version || "1.0.0",
    termsOfService: config.termsOfService,
    contact: config.contact,
    license: config.license,
  } as any;

  const doc: OpenAPIObject = {
    openapi: "3.0.0",
    info,
    servers: config.servers || [],
    paths: {},
    components: {
      schemas: {},
    },
    tags: config.tags || [],
  };

  // Basic, non-invasive attempt to collect route metadata from a running Nest app.
  // Real extraction will need to replicate the scanner/explorer logic from
  // @nestjs/swagger. Here we provide a safe, optional deep scan that tries to
  // detect the underlying HTTP framework and read routes when `deepScanRoutes`
  // is true.
  if (app && options && options.deepScanRoutes) {
    try {
      // Try to read Express-style routes (this is best-effort and won't cover all cases)
      // Nest apps expose the underlying adapter on `app.getHttpAdapter()` in many versions.
      const adapter =
        typeof app.getHttpAdapter === "function"
          ? app.getHttpAdapter()
          : undefined;
      const instance =
        adapter && typeof adapter.getInstance === "function"
          ? adapter.getInstance()
          : undefined;

      if (instance && instance._router && instance._router.stack) {
        // Express internal stack parsing (best-effort) — do not rely on this shape in prod.
        const stack = instance._router.stack;
        stack.forEach((layer: any) => {
          if (layer.route && layer.route.path) {
            const path = layer.route.path;
            const methods = Object.keys(layer.route.methods || {});
            methods.forEach((m: string) => {
              const method = m.toLowerCase();
              if (!doc.paths[path]) doc.paths[path] = {};
              doc.paths[path][method] = {
                responses: {
                  "200": {
                    description: "Default response",
                  },
                },
              };
            });
          }
        });
      }
    } catch (err) {
      // swallow — the behaviour is best-effort in this prototype
    }
  }

  return doc;
}
