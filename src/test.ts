import { DocumentBuilder, createDocument } from "./index";

async function run() {
  const builder = new DocumentBuilder();
  const config = builder.setTitle("Test API").setVersion("0.1.0").build();

  // Mock simple Express-like router stack for deepScanRoutes
  const mockApp: any = {
    getHttpAdapter: () => ({
      getInstance: () => ({
        _router: {
          stack: [
            { route: { path: "/hello", methods: { get: true } } },
            { route: { path: "/users", methods: { post: true, get: true } } },
          ],
        },
      }),
    }),
  };

  const doc = createDocument(mockApp, config, { deepScanRoutes: true });
  console.log("Generated document:");
  console.log(JSON.stringify(doc, null, 2));

  if (!doc || doc.openapi !== "3.0.0") {
    console.error("Test failed: invalid document");
    process.exitCode = 2;
    return;
  }

  // Check that paths are present
  if (!doc.paths["/hello"] || !doc.paths["/users"]) {
    console.error("Test failed: missing expected paths");
    process.exitCode = 2;
    return;
  }

  // Check that /hello has GET
  if (!doc.paths["/hello"].get) {
    console.error("Test failed: /hello GET missing");
    process.exitCode = 2;
    return;
  }

  // Check that /users has GET and POST
  if (!doc.paths["/users"].get || !doc.paths["/users"].post) {
    console.error("Test failed: /users GET or POST missing");
    process.exitCode = 2;
    return;
  }

  console.log("All tests passed");
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exitCode = 2;
});
