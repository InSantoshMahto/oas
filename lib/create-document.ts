import { OpenAPIObject, DocumentOptions, ComponentsObject } from "./types";
import { getLoadedPluginMetadata } from "./plugin";

/**
 * Return a shallow copy of `obj` with all `undefined`-valued keys removed.
 * This keeps the serialised JSON clean and OpenAPI-validator-friendly.
 */
function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

/**
 * Create a minimal OpenAPI 3.0 document from a Nest application and a
 * builder config produced by `DocumentBuilder`.
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
  // ── Info block (no undefined keys in the JSON output) ───────────────────
  const info = stripUndefined({
    title: config.title || "API",
    description: config.description,
    version: config.version || "1.0.0",
    termsOfService: config.termsOfService,
    contact: config.contact,
    license: config.license,
  }) as OpenAPIObject["info"];

  // ── Components: start from builder-supplied security schemes ────────────
  const components: ComponentsObject = {
    schemas: {},
    ...(config.securitySchemes
      ? { securitySchemes: { ...config.securitySchemes } }
      : {}),
  };

  // ── Merge plugin-registered metadata (schemas, securitySchemes, …) ──────
  for (const meta of getLoadedPluginMetadata()) {
    if (!meta) continue;
    if (meta.schemas) {
      Object.assign(components.schemas!, meta.schemas);
    }
    if (meta.securitySchemes) {
      components.securitySchemes = {
        ...components.securitySchemes,
        ...meta.securitySchemes,
      };
    }
    // Future plugin keys (responses, parameters, …) can be merged here.
  }

  // ── Assemble document skeleton ───────────────────────────────────────────
  const doc: OpenAPIObject = {
    openapi: "3.0.0",
    info,
    servers: config.servers || [],
    paths: {},
    components,
    tags: config.tags || [],
    ...(config.security ? { security: config.security } : {}),
    ...(config.externalDocs ? { externalDocs: config.externalDocs } : {}),
  };

  // ── Best-effort Express route scanning ───────────────────────────────────
  // Real extraction needs to replicate the scanner/explorer logic from
  // @nestjs/swagger (reflection over decorator metadata).  Here we provide a
  // safe, optional deep-scan that reads Express's internal router stack.
  if (app && options?.deepScanRoutes) {
    try {
      const adapter =
        typeof app.getHttpAdapter === "function"
          ? app.getHttpAdapter()
          : undefined;
      const instance =
        adapter && typeof adapter.getInstance === "function"
          ? adapter.getInstance()
          : undefined;

      const stack = instance?._router?.stack;
      if (Array.isArray(stack)) {
        for (const layer of stack) {
          if (!layer?.route?.path) continue;

          const path: string = layer.route.path;
          const methods = Object.keys(layer.route.methods ?? {});

          for (const m of methods) {
            const method = m.toLowerCase() as keyof (typeof doc.paths)[string];
            if (!doc.paths[path]) doc.paths[path] = {};
            (doc.paths[path] as any)[method] = {
              responses: {
                "200": { description: "Default response" },
              },
            };
          }
        }
      }
    } catch (_err) {
      // Swallow — the behaviour is best-effort in this prototype.
    }
  }

  return doc;
}
