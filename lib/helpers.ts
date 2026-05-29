import { INestApplication } from '@nestjs/common';
import {
  getSchemaPath,
  OpenAPIObject,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

/**
 * Build an inline `$ref` object from a model name string.
 *
 * Unlike the upstream `refs(...models: Function[])` which takes class
 * references, this accepts a plain string — useful when the model name is
 * not available as a constructor at the call site.
 *
 * @example
 *   refSchema('Cat')  // → { $ref: '#/components/schemas/Cat' }
 */
export function refSchema(modelName: string): { $ref: string } {
  return { $ref: getSchemaPath(modelName) };
}

/**
 * Convenience wrapper around `SwaggerModule.createDocument`.
 *
 * Lets consumers call `createDocument(app, config, options)` without having
 * to import `SwaggerModule` separately.
 */
export function createDocument(
  app: INestApplication,
  config: Omit<OpenAPIObject, 'paths'>,
  options?: SwaggerDocumentOptions,
): OpenAPIObject {
  return SwaggerModule.createDocument(app, config, options);
}
