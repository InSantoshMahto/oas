/**
 * examples/usage.ts
 *
 * Demonstrates how to integrate @insantoshmahto/oas with a NestJS v11 app.
 * Run this file as a standalone script (after building) to see the generated
 * OpenAPI document printed to stdout.
 *
 *   npm run build && node dist/examples/usage.js
 */

import {
  DocumentBuilder,
  createDocument,
  getSchemaPath,
  refSchema,
} from "@insantoshmahto/oas";

// ─── 1. Build the document config ───────────────────────────────────────────

const config = new DocumentBuilder()
  // Core metadata
  .setTitle("Cats API")
  .setDescription("A production-ready NestJS v11 REST API example")
  .setVersion("1.0.0")
  .setTermsOfService("https://example.com/tos")
  .setContact("Maintainer", "https://example.com", "api@example.com")
  .setLicense("MIT", "https://opensource.org/licenses/MIT")
  .setExternalDoc("OpenAPI Specification", "https://swagger.io/specification/")

  // Servers
  .addServer("http://localhost:3000", "Local development")
  .addServer("https://staging-api.example.com", "Staging")
  .addServer("https://api.example.com", "Production")

  // Tags (match @ApiTags() decorators on controllers)
  .addTag("cats", "Cat management endpoints", {
    url: "https://docs.example.com/cats",
  })
  .addTag("auth", "Authentication endpoints")
  .addTag("health", "Health & readiness checks")

  // Security schemes
  .addBearerAuth(
    { bearerFormat: "JWT", description: "Enter a valid JWT token" },
    "jwt", // scheme name — matches @ApiBearerAuth('jwt') on controllers
  )
  .addApiKey(
    { in: "header", name: "X-API-KEY", description: "Partner API key" },
    "apiKey",
  )
  .addCookieAuth("session_id", {}, "cookieAuth")
  .addOAuth2(
    {
      authorizationCode: {
        authorizationUrl: "https://example.com/oauth/authorize",
        tokenUrl: "https://example.com/oauth/token",
        scopes: {
          "cats:read": "Read cat data",
          "cats:write": "Create and update cats",
        },
      },
    },
    { description: "OAuth2 Authorization Code flow" },
    "oauth2",
  )

  // Global security requirement: every endpoint requires JWT unless overridden
  .addSecurityRequirements("jwt")

  .build();

// ─── 2. Create the document (mock Nest app for this standalone example) ──────

/**
 * In a real NestJS app (main.ts) this would be:
 *
 *   const app = await NestFactory.create(AppModule);
 *   const document = createDocument(app, config, { deepScanRoutes: true });
 *   SwaggerModule.setup('api', app, document, {
 *     jsonDocumentUrl: 'api/json',
 *     yamlDocumentUrl: 'api/yaml',
 *     swaggerOptions: { persistAuthorization: true },
 *   });
 */
const mockApp = {
  getHttpAdapter: () => ({
    getInstance: () => ({
      _router: {
        stack: [
          // GET /health
          { route: { path: "/health", methods: { get: true } } },
          // POST /auth/login
          { route: { path: "/auth/login", methods: { post: true } } },
          // GET /cats  +  POST /cats
          { route: { path: "/cats", methods: { get: true, post: true } } },
          // GET /cats/:id  +  PATCH /cats/:id  +  DELETE /cats/:id
          {
            route: {
              path: "/cats/:id",
              methods: { get: true, patch: true, delete: true },
            },
          },
        ],
      },
    }),
  }),
};

const document = createDocument(mockApp, config, { deepScanRoutes: true });

// ─── 3. Show helper utilities ────────────────────────────────────────────────

console.log("── Helper utilities ────────────────────────────────────────");
console.log("getSchemaPath('Cat')  →", getSchemaPath("Cat"));
// Output: #/components/schemas/Cat

console.log("refSchema('Cat')      →", JSON.stringify(refSchema("Cat")));
// Output: {"$ref":"#/components/schemas/Cat"}

// ─── 4. Print the generated document ────────────────────────────────────────

console.log("\n── Generated OpenAPI document ──────────────────────────────");
console.log(JSON.stringify(document, null, 2));

export default document;

/**
 * ─── NestJS v11 Real-App Wiring ─────────────────────────────────────────────
 *
 * cats/dto/create-cat.dto.ts
 * ──────────────────────────
 *   import { ApiProperty } from '@nestjs/swagger';
 *   import { IsString, IsInt, Min, Max } from 'class-validator';
 *
 *   export class CreateCatDto {
 *     @ApiProperty({ example: 'Whiskers', description: 'Name of the cat' })
 *     @IsString()
 *     name: string;
 *
 *     @ApiProperty({ example: 3, minimum: 0, maximum: 30 })
 *     @IsInt() @Min(0) @Max(30)
 *     age: number;
 *
 *     @ApiProperty({ example: 'Siamese', required: false })
 *     @IsString()
 *     breed?: string;
 *   }
 *
 * cats/cats.controller.ts
 * ───────────────────────
 *   import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
 *   import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
 *
 *   @ApiTags('cats')
 *   @ApiBearerAuth('jwt')              // matches addBearerAuth(…, 'jwt') above
 *   @Controller('cats')
 *   export class CatsController {
 *     constructor(private readonly catsService: CatsService) {}
 *
 *     @Post()
 *     @ApiOperation({ summary: 'Create a cat' })
 *     @ApiResponse({ status: 201, description: 'Cat created.', type: Cat })
 *     @ApiResponse({ status: 400, description: 'Validation failed.' })
 *     create(@Body() dto: CreateCatDto) { return this.catsService.create(dto); }
 *
 *     @Get()
 *     @ApiOperation({ summary: 'List all cats' })
 *     @ApiResponse({ status: 200, description: 'Returns array of cats.', type: [Cat] })
 *     findAll() { return this.catsService.findAll(); }
 *
 *     @Get(':id')
 *     @ApiOperation({ summary: 'Get cat by ID' })
 *     @ApiParam({ name: 'id', type: Number })
 *     @ApiResponse({ status: 200, type: Cat })
 *     @ApiResponse({ status: 404, description: 'Not found.' })
 *     findOne(@Param('id') id: string) { return this.catsService.findOne(+id); }
 *
 *     @Patch(':id')
 *     @ApiOperation({ summary: 'Update a cat' })
 *     @ApiParam({ name: 'id', type: Number })
 *     update(@Param('id') id: string, @Body() dto: UpdateCatDto) {
 *       return this.catsService.update(+id, dto);
 *     }
 *
 *     @Delete(':id')
 *     @ApiOperation({ summary: 'Delete a cat' })
 *     @ApiParam({ name: 'id', type: Number })
 *     remove(@Param('id') id: string) { return this.catsService.remove(+id); }
 *   }
 *
 * main.ts
 * ───────
 *   import { NestFactory } from '@nestjs/core';
 *   import { ValidationPipe } from '@nestjs/common';
 *   import { SwaggerModule } from '@nestjs/swagger';
 *   import { AppModule } from './app.module';
 *   import { DocumentBuilder, createDocument } from '@insantoshmahto/oas';
 *
 *   async function bootstrap() {
 *     const app = await NestFactory.create(AppModule);
 *     app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
 *
 *     const config = new DocumentBuilder()
 *       .setTitle('Cats API')
 *       .setVersion('1.0.0')
 *       .addBearerAuth({}, 'jwt')
 *       .addSecurityRequirements('jwt')
 *       .addTag('cats', 'Cat management')
 *       .build();
 *
 *     const document = createDocument(app, config, { deepScanRoutes: true });
 *
 *     SwaggerModule.setup('api', app, document, {
 *       jsonDocumentUrl: 'api/json',
 *       yamlDocumentUrl: 'api/yaml',
 *       swaggerOptions: { persistAuthorization: true },
 *     });
 *
 *     await app.listen(3000);
 *     console.log('Swagger UI → http://localhost:3000/api');
 *   }
 *   bootstrap();
 */
