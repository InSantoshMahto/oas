/**
 * Unit tests for the local implementations (document-builder + create-document)
 * plus a compat-layer smoke test.
 *
 * Run with:   npm test          (uses ts-node from the repo root)
 *
 * Suites 1-4  → LocalDocumentBuilder unit tests (deterministic, no peer dep needed)
 * Suites 5-12 → localCreateDocument unit tests
 * Suite  13   → getSchemaPath / refSchema helpers
 * Suites 14-15→ compat proxy smoke tests
 */

import { DocumentBuilder as LocalDocumentBuilder } from '../lib/document-builder';
import { createDocument as localCreateDocument } from '../lib/create-document';
import { DocumentBuilder, createDocument } from '../lib/index';

// ─── Test harness ────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function suite(name: string, fn: () => void) {
  console.log(`\n${name}`);
  fn();
}

// ─── Mock helpers ────────────────────────────────────────────────────────────

function makeApp(routes: { path: string; methods: Record<string, boolean> }[]) {
  return {
    getHttpAdapter: () => ({
      getInstance: () => ({
        _router: { stack: routes.map((r) => ({ route: r })) },
      }),
    }),
  };
}

const adapterNoRouterApp = { getHttpAdapter: () => ({ getInstance: () => ({}) }) };
const bareApp = {};

// ─── Tests ───────────────────────────────────────────────────────────────────

async function run() {
  // ── Suite 1: LocalDocumentBuilder – core metadata ──────────────────────
  suite('LocalDocumentBuilder – core metadata', () => {
    const config = new LocalDocumentBuilder()
      .setTitle('Test API')
      .setDescription('A test description')
      .setVersion('2.0.0')
      .setTermsOfService('https://example.com/tos')
      .setContact('Maintainer', 'https://example.com', 'hello@example.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addServer('http://localhost:3000', 'Local dev')
      .addServer('https://api.example.com', 'Production')
      .setExternalDoc('More docs', 'https://docs.example.com')
      .build();

    assert(config.title === 'Test API', 'title is set');
    assert(config.description === 'A test description', 'description is set');
    assert(config.version === '2.0.0', 'version is set');
    assert(config.termsOfService === 'https://example.com/tos', 'termsOfService is set');
    assert(config.contact?.name === 'Maintainer', 'contact.name is set');
    assert(config.contact?.email === 'hello@example.com', 'contact.email is set');
    assert(config.license?.name === 'MIT', 'license.name is set');
    assert(config.servers?.length === 2, 'two servers added');
    assert(config.servers?.[0].url === 'http://localhost:3000', 'first server URL');
    assert(config.externalDocs?.url === 'https://docs.example.com', 'externalDocs URL');
  });

  // ── Suite 2: LocalDocumentBuilder – defaults ───────────────────────────
  suite('LocalDocumentBuilder – defaults', () => {
    const config = new LocalDocumentBuilder().build();
    assert(config.title === 'API', "default title is 'API'");
    assert(config.version === '1.0.0', "default version is '1.0.0'");
    assert(config.description === undefined, 'description absent when not set');
  });

  // ── Suite 3: LocalDocumentBuilder – addTag fixed signature ─────────────
  suite('LocalDocumentBuilder – addTag (fixed signature)', () => {
    const config = new LocalDocumentBuilder()
      .addTag('cats', 'Cat management', { url: 'https://docs.example.com/cats' })
      .addTag('dogs')
      .build();

    assert(config.tags?.length === 2, 'two tags added');
    assert(config.tags?.[0].name === 'cats', 'first tag name');
    assert(config.tags?.[0].description === 'Cat management', 'first tag description');
    assert(config.tags?.[0].externalDocs?.url === 'https://docs.example.com/cats', 'first tag externalDocs');
    assert(config.tags?.[1].name === 'dogs', 'second tag name');
    assert(config.tags?.[1].description === undefined, 'second tag has no description');
  });

  // ── Suite 4: LocalDocumentBuilder – security schemes ──────────────────
  suite('LocalDocumentBuilder – security schemes', () => {
    const config = new LocalDocumentBuilder()
      .addBearerAuth()
      .addBearerAuth({ bearerFormat: 'JWT', description: 'Admin JWT' }, 'adminJwt')
      .addBasicAuth()
      .addApiKey({ name: 'X-API-KEY', in: 'header' }, 'ApiKey')
      .addCookieAuth('session_id', {}, 'sessionCookie')
      .addOAuth2(
        {
          authorizationCode: {
            authorizationUrl: 'https://example.com/oauth/authorize',
            tokenUrl: 'https://example.com/oauth/token',
            scopes: { read: 'Read access', write: 'Write access' },
          },
        },
        {},
        'oauth2',
      )
      .addSecurityRequirements('bearer')
      .addSecurityRequirements('oauth2', ['read'])
      .build();

    const ss = config.securitySchemes!;
    assert(ss['bearer']?.type === 'http', 'bearer scheme type');
    assert((ss['bearer'] as any).scheme === 'bearer', 'bearer scheme.scheme');
    assert((ss['bearer'] as any).bearerFormat === 'JWT', 'bearer bearerFormat default');
    assert(ss['adminJwt']?.type === 'http', 'custom-named bearer exists');
    assert((ss['adminJwt'] as any).description === 'Admin JWT', 'custom bearer description override');
    assert(ss['basic']?.type === 'http', 'basic scheme type');
    assert((ss['basic'] as any).scheme === 'basic', 'basic scheme.scheme');
    assert(ss['ApiKey']?.type === 'apiKey', 'apiKey scheme type');
    assert((ss['ApiKey'] as any).in === 'header', 'apiKey scheme in header');
    assert(ss['sessionCookie']?.type === 'apiKey', 'cookie scheme type');
    assert((ss['sessionCookie'] as any).in === 'cookie', 'cookie scheme in cookie');
    assert((ss['sessionCookie'] as any).name === 'session_id', 'cookie scheme name');
    assert(ss['oauth2']?.type === 'oauth2', 'oauth2 scheme type');
    assert((ss['oauth2'] as any).flows?.authorizationCode !== undefined, 'oauth2 authorizationCode flow');
    assert(config.security?.length === 2, 'two global security requirements');
    assert(config.security?.[0]['bearer'] !== undefined, 'bearer global requirement present');
    assert((config.security?.[1]['oauth2'] as string[])?.includes('read'), 'oauth2 scope in global requirement');
  });

  // ── Suite 5: localCreateDocument – happy path ──────────────────────────
  suite('localCreateDocument – happy path (deepScanRoutes: true)', () => {
    const config = new LocalDocumentBuilder().setTitle('Happy Path API').setVersion('0.1.0').build();
    const app = makeApp([
      { path: '/hello', methods: { get: true } },
      { path: '/users', methods: { post: true, get: true } },
    ]);
    const doc = localCreateDocument(app, config, { deepScanRoutes: true });

    assert(doc.openapi === '3.0.0', 'openapi version');
    assert(doc.info.title === 'Happy Path API', 'doc title');
    assert(doc.info.version === '0.1.0', 'doc version');
    assert(doc.paths['/hello'] !== undefined, '/hello path exists');
    assert(doc.paths['/hello'].get !== undefined, '/hello GET exists');
    assert(doc.paths['/users'] !== undefined, '/users path exists');
    assert(doc.paths['/users'].get !== undefined, '/users GET exists');
    assert(doc.paths['/users'].post !== undefined, '/users POST exists');
  });

  // ── Suite 6: localCreateDocument – deepScanRoutes disabled ────────────
  suite('localCreateDocument – deepScanRoutes: false', () => {
    const config = new LocalDocumentBuilder().setTitle('No Scan').build();
    const doc = localCreateDocument(
      makeApp([{ path: '/should-not-appear', methods: { get: true } }]),
      config,
      { deepScanRoutes: false },
    );
    assert(Object.keys(doc.paths).length === 0, 'no paths when deepScanRoutes is false');
  });

  // ── Suite 7: localCreateDocument – no options ─────────────────────────
  suite('localCreateDocument – no options object', () => {
    const doc = localCreateDocument(
      makeApp([{ path: '/x', methods: { get: true } }]),
      new LocalDocumentBuilder().build(),
    );
    assert(Object.keys(doc.paths).length === 0, 'no paths when options omitted');
    assert(doc.openapi === '3.0.0', 'still a valid document');
  });

  // ── Suite 8: localCreateDocument – no getHttpAdapter ──────────────────
  suite('localCreateDocument – app without getHttpAdapter', () => {
    const doc = localCreateDocument(bareApp, new LocalDocumentBuilder().build(), { deepScanRoutes: true });
    assert(doc.openapi === '3.0.0', 'document generated without adapter');
    assert(Object.keys(doc.paths).length === 0, 'no paths when adapter is absent');
  });

  // ── Suite 9: localCreateDocument – no router stack ────────────────────
  suite('localCreateDocument – adapter present but no _router.stack', () => {
    const doc = localCreateDocument(adapterNoRouterApp, new LocalDocumentBuilder().build(), { deepScanRoutes: true });
    assert(doc.openapi === '3.0.0', 'document generated without router stack');
    assert(Object.keys(doc.paths).length === 0, 'no paths when router stack is absent');
  });

  // ── Suite 10: localCreateDocument – stripUndefined cleans info ─────────
  suite('localCreateDocument – stripUndefined cleans info object', () => {
    const doc = localCreateDocument(
      {},
      new LocalDocumentBuilder().setTitle('Clean Info').setVersion('1.0.0').build(),
    );
    const infoKeys = Object.keys(doc.info);
    assert(!infoKeys.includes('description'), 'description key absent');
    assert(!infoKeys.includes('contact'), 'contact key absent');
    assert(!infoKeys.includes('license'), 'license key absent');
    assert(infoKeys.includes('title'), 'title key present');
    assert(infoKeys.includes('version'), 'version key present');
  });

  // ── Suite 11: localCreateDocument – security schemes in components ──────
  suite('localCreateDocument – security schemes in components', () => {
    const doc = localCreateDocument(
      {},
      new LocalDocumentBuilder().addBearerAuth().addApiKey({}, 'myKey').build(),
    );
    assert(doc.components?.securitySchemes?.['bearer'] !== undefined, 'bearer scheme in components');
    assert(doc.components?.securitySchemes?.['myKey'] !== undefined, 'api_key under custom name in components');
  });

  // ── Suite 12: localCreateDocument – global security requirement ─────────
  suite('localCreateDocument – global security requirement', () => {
    const doc = localCreateDocument(
      {},
      new LocalDocumentBuilder().addBearerAuth().addSecurityRequirements('bearer').build(),
    );
    assert(Array.isArray(doc.security) && doc.security.length === 1, 'one global security requirement');
    assert(doc.security?.[0]['bearer'] !== undefined, 'bearer in global security');
  });

  // ── Suite 13: helpers ──────────────────────────────────────────────────
  suite('helpers – getSchemaPath / refSchema', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getSchemaPath, refSchema } = require('../lib/index');
    assert(getSchemaPath('Cat') === '#/components/schemas/Cat', 'getSchemaPath correct');
    assert(refSchema('Cat').$ref === '#/components/schemas/Cat', 'refSchema correct');
  });

  // ── Suite 14: compat DocumentBuilder – proxy smoke test ────────────────
  suite('compat DocumentBuilder – proxy smoke test', () => {
    let threw = false;
    let result: any;
    try {
      result = new DocumentBuilder()
        .setTitle('Compat API')
        .setVersion('1.0.0')
        .addTag('cats')
        .addBearerAuth()
        .addApiKey({}, 'key')
        .addOAuth2({ implicit: { authorizationUrl: 'https://x.com/auth', scopes: {} } })
        .addSecurityRequirements('bearer')
        .build();
    } catch (e) {
      threw = true;
    }
    assert(!threw, 'compat builder does not throw');
    assert(result !== null && result !== undefined, 'build() returns a value');
  });

  // ── Suite 15: compat createDocument – smoke test ───────────────────────
  suite('compat createDocument – smoke test', () => {
    let threw = false;
    let doc: any;
    try {
      doc = createDocument(
        makeApp([{ path: '/smoke', methods: { get: true } }]),
        { title: 'Smoke', version: '0.0.1' },
        { deepScanRoutes: true },
      );
    } catch (e) {
      threw = true;
    }
    assert(!threw, 'compat createDocument does not throw');
    assert(doc != null, 'compat createDocument returns a value');
    assert(typeof doc === 'object' && doc.openapi, 'result has an openapi field');
  });

  // ── Summary ────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.error(`\n${failed} test(s) failed.`);
    process.exitCode = 2;
  } else {
    console.log('\nAll tests passed ✓');
  }
}

run().catch((err) => {
  console.error('Unexpected test error:', err);
  process.exitCode = 2;
});
