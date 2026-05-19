# @insantoshmahto/oas — NestJS v11 Example App

A fully-wired **NestJS v11** REST API that demonstrates every feature of
`@insantoshmahto/oas` in a realistic project.

## Features

| Layer | What's shown |
|---|---|
| **DocumentBuilder** | `addBearerAuth`, `addApiKey`, `addTag`, `addServer`, `setExternalDoc`, `addSecurityRequirements` |
| **Controllers** | URI versioning, `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`, `@ApiSecurity` |
| **DTOs** | `@ApiProperty` + `class-validator` decorators, `PartialType` for updates |
| **Guards** | Global `AuthGuard` (JWT Bearer + API-Key), `@Public()` opt-out decorator |
| **Filters** | Global `HttpExceptionFilter` — consistent error envelope |
| **Interceptors** | Global `TransformInterceptor` — wraps every response in `{ data, statusCode, timestamp }` |
| **Pagination** | `CatQueryDto` with `page` / `limit` / filter params |

## Quick Start

```bash
# 1. Build the parent @insantoshmahto/oas package first
cd ../../src && npm install && npm run build && cd ../examples/nestjs-app

# 2. Install dependencies
npm install

# 3. Start the dev server (requires ts-node)
npm run start:dev
```

The app starts on **http://localhost:3001**.

| URL | Description |
|---|---|
| `http://localhost:3001/docs` | Swagger UI |
| `http://localhost:3001/docs/json` | OpenAPI JSON spec |
| `http://localhost:3001/docs/yaml` | OpenAPI YAML spec |

## Demo credentials

| Method | Credentials |
|---|---|
| JWT Bearer | `POST /api/v1/auth/login` → `{"username":"admin","password":"secret"}` |
| API Key | `X-API-KEY: demo-key-123` on any request header |

## Project structure

```
src/
├── main.ts                          # Bootstrap, Swagger setup
├── app.module.ts                    # Root module + global AuthGuard
├── common/
│   ├── decorators/
│   │   ├── public.decorator.ts      # @Public() — skip auth
│   │   └── current-user.decorator.ts# @CurrentUser() — inject user from request
│   ├── filters/
│   │   └── http-exception.filter.ts # Global error envelope
│   ├── guards/
│   │   └── auth.guard.ts            # JWT Bearer + API-Key guard
│   └── interceptors/
│       └── transform.interceptor.ts # Response envelope { data, statusCode, timestamp }
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts           # POST /login, POST /logout
│   ├── auth.service.ts
│   └── dto/
│       ├── login.dto.ts
│       └── auth-response.dto.ts
├── cats/
│   ├── cats.module.ts
│   ├── cats.controller.ts           # GET/POST/PATCH/DELETE /cats
│   ├── cats.service.ts              # In-memory store
│   ├── dto/
│   │   ├── create-cat.dto.ts
│   │   ├── update-cat.dto.ts
│   │   └── cat-query.dto.ts
│   └── entities/
│       └── cat.entity.ts
└── health/
    ├── health.module.ts
    └── health.controller.ts         # GET /health, GET /health/info
```
