/**
 * Helpers used by the generator
 */

export function getSchemaPath(modelName: string) {
  return `#/components/schemas/${modelName}`;
}

export function refSchema(modelName: string) {
  return { $ref: getSchemaPath(modelName) };
}
