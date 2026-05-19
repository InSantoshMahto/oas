<p align="center">
  <h1 align="center">@insantoshmahto/oas</h1>
</p>

<p align="center">
  Lightweight <strong>OpenAPI 3.x</strong> document generator for NestJS —<br/>
  delegates to <code>@nestjs/swagger</code> when installed, falls back to a
  built-in implementation when it isn't.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@insantoshmahto/oas">
    <img src="https://img.shields.io/npm/v/@insantoshmahto/oas.svg?style=flat-square" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@insantoshmahto/oas">
    <img src="https://img.shields.io/npm/dm/@insantoshmahto/oas.svg?style=flat-square" alt="npm downloads" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License: MIT" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=flat-square" alt="TypeScript" />
  </a>
  <a href="https://nestjs.com/">
    <img src="https://img.shields.io/badge/NestJS-v11-E0234E.svg?style=flat-square" alt="NestJS v11" />
  </a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [DocumentBuilder](#documentbuilder)
  - [createDocument](#createdocument)
  - [Helpers](#helpers)
  - [Plugin system](#plugin-system)
- [Full NestJS v11 Example](#full-nestjs-v11-example)
- [Repository Layout](#repository-layout)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

`@insantoshmahto/oas` is a focused OpenAPI 3.x document-generation package extracted from `@nestjs/swagger`. It ships its own `DocumentBuilder` and `createDocument` implementation, but **prefers the upstream `@nestjs/swagger` package** when it is installed in the consuming project — giving you full feature parity at zero extra cost.

```
Consumer project
  ├── @nestjs/swagger installed?  → delegates every call to it  ✓ full Swagger feature set
  └── @nestjs/swagger absent?     → uses built-in implementation ✓ no hard dependency
```

The compat layer is powered by a **JavaScript `Proxy`** that forwards every method call — including new methods added in future `@nestjs/swagger` releases — without needing to be updated.

---

## Features

- 🔄 **Auto-delegation** — transparently wraps `@nestjs/swagger` when available; falls back to the built-in generator otherwise
- 🔒 **Full security-scheme API** — `addBearerAuth`, `addApiKey`, `addBasicAuth`, `addCookieAuth`, `addOAuth2`, `addSecurityRequirements`
- 🏷️ **Typed tags** — `addTag(name, description?, externalDocs?)` matching the OpenAPI 3.0 spec exactly
- 🌐 **Server & external-doc support** — `addServer`, `setExternalDoc`
- 🧹 **Clean JSON output** — `undefined` fields are stripped from the serialised spec automatically
- 🔌 **Plugin registry** — `loadPluginMetadata` / `getLoadedPluginMetadata` for compile-time schema injection
- 📐 **Fully typed** — complete OpenAPI 3.0 TypeScript interfaces (`PathItemObject`, `OperationObject`, `SchemaObject`, `SecuritySchemeObject`, …)
- 📦 **Zero runtime dependencies**

---

## Installation

```bash
npm install @insantoshmahto/oas
```

> **Peer dependency (optional)**
> Install `@nestjs/swagger` alongside this package to unlock the full upstream
> feature set (CLI plugin, `@ApiProperty` decorator inference, Swagger UI, …).
>
> ```bash
> npm install @nestjs/swagger
> ```

---

## Quick Start

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder, createDocument } from '@insantoshmahto/oas';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('REST API documentation')
    .setVersion('1.0.0')
    .addBearerAuth()                          // JWT Bearer
    .addApiKey({ name: 'X-API-KEY' }, 'apiKey') // API Key header
    .addSecurityRequirements('bearer')        // require JWT globally
    .addTag('cats', 'Cat management')
    .addServer('http://localhost:3000', 'Local')
    .build();

  const document = createDocument(app, config, { deepScanRoutes: true });

  // Mount Swagger UI (requires @nestjs/swagger)
  SwaggerModule.setup('docs', app, document as any, {
    jsonDocumentUrl: 'docs/json',
    yamlDocumentUrl: 'docs/yaml',
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(3000);
  // Swagger UI  → http://localhost:3000/docs
  // OpenAPI JSON → http://localhost:3000/docs/json
}
bootstrap();
```

---

## API Reference

### `DocumentBuilder`

Fluent builder that constructs a `DocumentOptions` config object.  
When `@nestjs/swagger` is installed, every call is forwarded to the upstream
`DocumentBuilder` via a `Proxy` — including methods not listed here.

#### Core metadata

| Method | Description |
|--------|-------------|
| `.setTitle(title)` | API title (required) |
| `.setDescription(description)` | Markdown-enabled description |
| `.setVersion(version)` | API version string |
| `.setTermsOfService(url)` | Terms of service URL |
| `.setContact(name, url?, email?)` | Contact information |
| `.setLicense(name, url?)` | License name and URL |
| `.setExternalDoc(description, url)` | Link to external documentation |

#### Servers & tags

| Method | Description |
|--------|-------------|
| `.addServer(url, description?)` | Add a server entry |
| `.addTag(name, description?, externalDocs?)` | Group endpoints under a named tag |

#### Security schemes

| Method | Default scheme name | Description |
|--------|----|----|
| `.addBearerAuth(options?, name?)` | `'bearer'` | HTTP Bearer / JWT |
| `.addBasicAuth(options?, name?)` | `'basic'` | HTTP Basic auth |
| `.addApiKey(options?, name?)` | `'api_key'` | API key in header / query / cookie |
| `.addCookieAuth(cookieName?, options?, name?)` | `'cookie'` | Cookie-based auth |
| `.addOAuth2(flows?, options?, name?)` | `'oauth2'` | OAuth 2.0 with any flow |
| `.addSecurityRequirements(name, scopes?)` | — | Global security requirement |

#### Build

```typescript
const config = builder.build(); // returns DocumentOptions
```

---

### `createDocument`

```typescript
import { createDocument } from '@insantoshmahto/oas';

const document = createDocument(app, config, options?);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `app` | `INestApplication` | Running NestJS application instance |
| `config` | `DocumentOptions` | Config produced by `DocumentBuilder.build()` |
| `options.deepScanRoutes` | `boolean` | Scan Express router stack for routes |

**Delegation behaviour:**

1. If `@nestjs/swagger` is installed → calls `SwaggerModule.createDocument(app, config, options)` 
2. If upstream throws or is absent → falls back to the built-in scanner

---

### Helpers

```typescript
import { getSchemaPath, refSchema } from '@insantoshmahto/oas';

// Resolve a schema name to its $ref path
getSchemaPath('Cat')
// → '#/components/schemas/Cat'

// Build a $ref object inline
refSchema('Cat')
// → { $ref: '#/components/schemas/Cat' }
```

Useful with `@ApiResponse` schema objects:

```typescript
@ApiResponse({
  status: 200,
  schema: {
    properties: {
      data:  refSchema('Cat'),
      items: { type: 'array', items: { $ref: getSchemaPath('Cat') } },
    },
  },
})
```

---

### Plugin system

```typescript
import { loadPluginMetadata, getLoadedPluginMetadata } from '@insantoshmahto/oas';

// Register compile-time metadata (e.g. from a custom CLI plugin)
loadPluginMetadata(() => ({
  schemas: { MyDto: { type: 'object', properties: { id: { type: 'integer' } } } },
}));

// Retrieve all registered metadata (consumed internally by createDocument)
const meta = getLoadedPluginMetadata();
```

Registered `schemas` and `securitySchemes` are automatically merged into the
`components` block of the generated document.

---

## Full NestJS v11 Example

A complete, runnable NestJS v11 application is in [`examples/nestjs-app/`](./examples/nestjs-app/).

It demonstrates:

| Feature | Where |
|---------|-------|
| `DocumentBuilder` with all security methods | [`src/main.ts`](./examples/nestjs-app/src/main.ts) |
| Full CRUD controller with `@ApiTags`, `@ApiOperation`, `@ApiResponse` | [`src/cats/cats.controller.ts`](./examples/nestjs-app/src/cats/cats.controller.ts) |
| DTO validation with `@ApiProperty` + `class-validator` | [`src/cats/dto/`](./examples/nestjs-app/src/cats/dto/) |
| Global `AuthGuard` — JWT Bearer + API-Key, `@Public()` bypass | [`src/common/guards/auth.guard.ts`](./examples/nestjs-app/src/common/guards/auth.guard.ts) |
| Global `HttpExceptionFilter` — consistent error envelope | [`src/common/filters/http-exception.filter.ts`](./examples/nestjs-app/src/common/filters/http-exception.filter.ts) |
| Global `TransformInterceptor` — success envelope | [`src/common/interceptors/transform.interceptor.ts`](./examples/nestjs-app/src/common/interceptors/transform.interceptor.ts) |
| Paginated list endpoint with query filters | [`src/cats/cats.service.ts`](./examples/nestjs-app/src/cats/cats.service.ts) |
| Health / liveness probes | [`src/health/health.controller.ts`](./examples/nestjs-app/src/health/health.controller.ts) |

**Run the example:**

```bash
# 1. Install and build the library
npm install && npm run build

# 2. Start the example app
cd examples/nestjs-app
npm install && npm run start:dev
```

| URL | Description |
|-----|-------------|
| `http://localhost:3001/docs` | Swagger UI |
| `http://localhost:3001/docs/json` | OpenAPI JSON spec |
| `http://localhost:3001/docs/yaml` | OpenAPI YAML spec |

**Demo credentials:**

```
POST /api/v1/auth/login   { "username": "admin",    "password": "secret"   }
POST /api/v1/auth/login   { "username": "readonly", "password": "pass1234" }

X-API-KEY: demo-key-123   (read-only)
X-API-KEY: admin-key-456  (admin)
```

---

## Repository Layout

```
@insantoshmahto/oas
├── lib/                       # TypeScript source (published as dist/)
│   ├── index.ts               # Public entry point — re-exports everything
│   ├── types.ts               # Full OpenAPI 3.0 TypeScript interfaces
│   ├── document-builder.ts    # LocalDocumentBuilder with all security methods
│   ├── create-document.ts     # Built-in OpenAPI document generator
│   ├── compat-swagger.ts      # Proxy wrapper — prefers @nestjs/swagger
│   ├── helpers.ts             # getSchemaPath / refSchema utilities
│   └── plugin.ts              # Plugin metadata registry
│
├── test/
│   └── test.ts                # 67-assertion test suite (ts-node, no framework)
│
├── examples/
│   ├── usage.ts               # Standalone DocumentBuilder usage script
│   └── nestjs-app/            # Full NestJS v11 example application
│       └── src/
│           ├── main.ts
│           ├── app.module.ts
│           ├── common/        # Guards, filters, interceptors, decorators
│           ├── cats/          # Full CRUD module
│           ├── auth/          # Login / logout
│           └── health/        # Liveness probes
│
├── dist/                      # Compiled output (git-ignored)
├── package.json
└── tsconfig.json
```

---

## Development

**Prerequisites:** Node.js ≥ 18, npm ≥ 9

```bash
# Clone
git clone https://github.com/insantoshmahto/oas.git
cd oas

# Install dependencies
npm install

# Build (lib/ → dist/)
npm run build

# Run tests (ts-node, no compile step needed)
npm test

# Clean compiled output
npm run clean
```

### Project scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile `lib/` → `dist/` via `tsc` |
| `npm test` | Run the test suite with `ts-node test/test.ts` |
| `npm run clean` | Remove `dist/` |
| `npm run prepublishOnly` | Runs `build` before every `npm publish` |

### Adding a new `DocumentBuilder` method

1. Add the method to `lib/document-builder.ts` with full JSDoc
2. Add the corresponding type(s) to `lib/types.ts` if needed
3. Add a test suite to `test/test.ts`
4. Run `npm test` to verify

The compat layer in `lib/compat-swagger.ts` does **not** need to be updated — the `Proxy` forwards all method calls automatically.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before opening issues or pull requests.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes and add tests
4. Ensure `npm test` passes
5. Open a pull request against `main`

For major changes, please open an issue first to discuss what you'd like to change.

---

## License

[MIT](./LICENSE) © [insantoshmahto](https://github.com/insantoshmahto)
