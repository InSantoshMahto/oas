import { DocumentBuilder, createDocument } from './index';

async function run() {
  const builder = new DocumentBuilder();
  const config = builder.setTitle('Test API').setVersion('0.1.0').build();

  // Mock simple Express-like router stack for deepScanRoutes
  const mockApp: any = {
    getHttpAdapter: () => ({
      getInstance: () => ({
        _router: {
          stack: [
            { route: { path: '/hello', methods: { get: true } } },
            { route: { path: '/users', methods: { post: true, get: true } } },
          ],
        },
      }),
    }),
  };

  const doc = createDocument(mockApp, config, { deepScanRoutes: true });
  console.log('Generated document:');
  console.log(JSON.stringify(doc, null, 2));

  if (!doc || doc.openapi !== '3.0.0') {
    console.error('Test failed: invalid document');
    process.exitCode = 2;
  } else {
    console.log('Test passed');
  }
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exitCode = 2;
});
