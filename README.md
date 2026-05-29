<p align="center">
  <h1 align="center">@insantoshmahto/oas</h1>
</p>

<p align="center">
  A thin extension layer on top of <code>@nestjs/swagger</code> — re-exports
  everything from upstream and adds a small set of utilities not available there.
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
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API additions](#api-additions)
  - [refSchema](#refschema)
  - [createDocument](#createdocument)
- [Repository Layout](#repository-layout)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

`@insantoshmahto/oas` re-exports the full public API of `@nestjs/swagger` and
adds a small number of utilities that are not available in that package.
Nothing from upstream is reimplemented here.

```
@insantoshmahto/oas
  └── re-exports everything from @nestjs/swagger
      + refSchema(modelName: string)       ← novel: $ref by name string
      + createDocument(app, config, opts?) ← convenience top-level function
```

---

## Installation

```bash
npm install @insantoshmahto/oas @nestjs/swagger
```

`@nestjs/swagger` is a required peer dependency.

---

## Quick Start

Replace `@nestjs/swagger` imports with `@insantoshmahto/oas` — everything works
identically, and the additions are available alongside:

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
  createDocument,   // ← convenience wrapper from this package
  refSchema,        // ← added by this package
} from '@insantoshmahto/oas';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('My API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  // Either style works:
  const doc = createDocument(app, config);          // this package's convenience wrapper
  // const doc = SwaggerModule.createDocument(app, config); // upstream — identical result

  SwaggerModule.setup('docs', app, doc);
  await app.listen(3000);
}
bootstrap();
```

---

## API additions

Everything exported by `@nestjs/swagger` is re-exported unchanged. The
following are the only additions this package makes.

### `refSchema`

```typescript
import { refSchema } from '@insantoshmahto/oas';

refSchema('Cat')
// → { $ref: '#/components/schemas/Cat' }
```

Builds an inline `$ref` object from a **model name string**. This complements
the upstream `refs(...models: Function[])` utility, which requires class
references rather than strings — useful when the constructor is not available
at the call site.

```typescript
@ApiResponse({
  status: 200,
  schema: {
    properties: {
      data:  refSchema('Cat'),
      items: { type: 'array', items: refSchema('Cat') },
    },
  },
})
```

### `createDocument`

```typescript
import { createDocument } from '@insantoshmahto/oas';

const document = createDocument(app, config, options?);
```

A top-level convenience function that forwards directly to
`SwaggerModule.createDocument(app, config, options)`. Lets you skip the
`SwaggerModule` import when you only need to generate the document.

| Parameter | Type | Description |
|-----------|------|-------------|
| `app` | `INestApplication` | Running NestJS application instance |
| `config` | `Omit<OpenAPIObject, 'paths'>` | Config produced by `DocumentBuilder.build()` |
| `options` | `SwaggerDocumentOptions` | Passed as-is to the upstream function |

---

## Repository Layout

```
@insantoshmahto/oas
├── lib/
│   ├── index.ts      # Re-exports @nestjs/swagger + local additions
│   └── helpers.ts    # refSchema, createDocument
│
├── test/
│   └── test.ts       # Tests for the added utilities (ts-node, no framework)
│
├── examples/
│   ├── usage.ts      # Standalone usage script
│   └── nestjs-app/   # Full NestJS v11 example application
│
├── dist/             # Compiled output (git-ignored)
├── package.json
└── tsconfig.json
```

---

## Development

**Prerequisites:** Node.js ≥ 18, npm ≥ 9

```bash
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

### Adding a new utility

1. Check that the utility does not already exist in `@nestjs/swagger`
2. Add the implementation to `lib/helpers.ts` with full JSDoc
3. Re-export from `lib/index.ts`
4. Add tests to `test/test.ts`
5. Run `npm test` to verify

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
