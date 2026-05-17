import { DocumentBuilder, createDocument } from '@insantoshmahto/oas';

// Example usage in a Nest application (main.ts or a test harness):
async function generate(app: any) {
  const config = new DocumentBuilder().setTitle('API').setVersion('1.0.0').build();
  // If @nestjs/swagger is installed in the consuming project, createDocument
  // will delegate to it. Otherwise it will use the local fallback.
  const doc = createDocument(app, config, { deepScanRoutes: true });
  console.log(JSON.stringify(doc, null, 2));
}

export default generate;
