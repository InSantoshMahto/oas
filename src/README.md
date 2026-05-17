# @insantoshmahto/oas (prototype)

Lightweight OpenAPI 3.x generator extracted as a focused core from `@nestjs/swagger` (prototype).

This package provides a minimal public API to build an OpenAPI document programmatically and create a basic OpenAPI object from an application instance. It is intentionally small and designed to be expanded iteratively.

Quick example

```ts
import { DocumentBuilder, createDocument } from '@insantoshmahto/oas';

const config = new DocumentBuilder().setTitle('API').setVersion('1.0.0').build();
const document = createDocument(app, config, { deepScanRoutes: false });
```

Compatibility with `@nestjs/swagger`

This package includes a runtime wrapper that will prefer the upstream `@nestjs/swagger` package for spec generation when it's available. That means:

- If you install `@nestjs/swagger` in your project, `DocumentBuilder` and `createDocument` exported by this package will delegate to the upstream implementations, giving you the fully-featured generator.
- If `@nestjs/swagger` is not installed, the package falls back to the local, lightweight implementations included here.

To force using the upstream generator, install `@nestjs/swagger` in your application:

```bash
npm install @nestjs/swagger
```

Notes

- The current implementation is a prototype and provides a small, safe surface for iteration. The upstream package remains the source of truth for complete feature parity.
- UI/adapters are intentionally not included here — the RFC proposes a separate `openapi-ui` package.

