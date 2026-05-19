import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DocumentBuilder, createDocument } from '@insantoshmahto/oas';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ── Global prefix & URI versioning ────────────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  // ── Global validation ─────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // strip unknown properties
      forbidNonWhitelisted: true, // 400 on unknown properties
      transform: true,            // auto-cast primitives
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global exception filter ───────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Global response envelope interceptor ─────────────────────────────
  app.useGlobalInterceptors(new TransformInterceptor());

  // ── CORS ──────────────────────────────────────────────────────────────
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY'],
    credentials: true,
  });

  // ── OpenAPI / Swagger ─────────────────────────────────────────────────
  // DocumentBuilder comes from @insantoshmahto/oas — when @nestjs/swagger is
  // installed (as it is here) it delegates to the upstream builder automatically.
  const config = new DocumentBuilder()
    .setTitle('Cats API')
    .setDescription(
      'A production-ready **NestJS v11** REST API built with `@insantoshmahto/oas`.\n\n' +
        '**Quick start:**\n' +
        '1. `POST /api/v1/auth/login` with `{"username":"admin","password":"secret"}`\n' +
        '2. Copy the `accessToken` and click **Authorize** 🔒\n' +
        '3. Use `X-API-KEY: demo-key-123` as an alternative.',
    )
    .setVersion('1.0.0')
    .setTermsOfService('https://example.com/tos')
    .setContact('Santosh', 'https://github.com/insantoshmahto', 'hello@example.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .setExternalDoc('NestJS Documentation', 'https://docs.nestjs.com')
    // Servers
    .addServer('http://localhost:3001', 'Local development')
    .addServer('https://staging-api.example.com', 'Staging')
    // Tags — order is reflected in Swagger UI
    .addTag('auth',   'Authentication — obtain and revoke tokens')
    .addTag('cats',   'Cats — full CRUD resource')
    .addTag('health', 'Health — liveness and readiness checks')
    // Security schemes
    .addBearerAuth(
      { bearerFormat: 'JWT', description: 'JWT returned by POST /api/v1/auth/login' },
      'jwt',
    )
    .addApiKey(
      { in: 'header', name: 'X-API-KEY', description: 'Long-lived partner API key' },
      'apiKey',
    )
    // Require JWT on every operation globally; public endpoints override with @Public()
    .addSecurityRequirements('jwt')
    .build();

  const document = createDocument(app, config, { deepScanRoutes: true });

  SwaggerModule.setup('docs', app, document as any, {
    jsonDocumentUrl: 'docs/json',
    yamlDocumentUrl: 'docs/yaml',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Cats API – Swagger UI',
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  logger.log(`App listening on   → http://localhost:${port}/api`);
  logger.log(`Swagger UI         → http://localhost:${port}/docs`);
  logger.log(`OpenAPI JSON spec  → http://localhost:${port}/docs/json`);
  logger.log(`OpenAPI YAML spec  → http://localhost:${port}/docs/yaml`);
}

bootstrap();
