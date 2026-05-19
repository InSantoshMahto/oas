import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  private readonly startTime = new Date();

  /**
   * GET /api/v1/health
   *
   * Kubernetes liveness probe endpoint.
   * Returns 200 when the process is alive and accepting requests.
   */
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Liveness check',
    description: 'Returns 200 when the service is alive. Safe to use as a Kubernetes liveness probe.',
  })
  @ApiOkResponse({
    description: 'Service is healthy',
    schema: {
      properties: {
        status:    { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-06-01T12:00:00.000Z' },
      },
    },
  })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * GET /api/v1/health/info
   *
   * Returns runtime metadata: version, uptime, environment.
   * Public — no authentication required.
   */
  @Get('info')
  @Public()
  @ApiOperation({
    summary: 'App info',
    description: 'Returns runtime metadata including version, uptime, and environment.',
  })
  @ApiOkResponse({
    description: 'Runtime information',
    schema: {
      properties: {
        name:        { type: 'string',  example: '@insantoshmahto/oas-example-nestjs' },
        version:     { type: 'string',  example: '1.0.0' },
        environment: { type: 'string',  example: 'development' },
        uptime:      { type: 'number',  example: 42.5,   description: 'Uptime in seconds' },
        startedAt:   { type: 'string',  example: '2024-06-01T12:00:00.000Z' },
        node:        { type: 'string',  example: 'v22.0.0' },
      },
    },
  })
  info() {
    return {
      name:        '@insantoshmahto/oas-example-nestjs',
      version:     '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
      uptime:      Math.floor(process.uptime()),
      startedAt:   this.startTime.toISOString(),
      node:        process.version,
    };
  }
}
