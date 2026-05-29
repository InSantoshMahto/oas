/**
 * Tests for the utilities added by @insantoshmahto/oas on top of @nestjs/swagger.
 *
 * Run with:  npm test  (uses ts-node from the repo root)
 *
 * Suite 1 → refSchema
 * Suite 2 → createDocument (convenience wrapper around SwaggerModule.createDocument)
 * Suite 3 → re-exports from @nestjs/swagger are accessible
 */

import 'reflect-metadata';
import { refSchema, createDocument, DocumentBuilder, getSchemaPath, SwaggerModule } from '../lib/index';

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

// ─── Tests ───────────────────────────────────────────────────────────────────

async function run() {
  // ── Suite 1: refSchema ─────────────────────────────────────────────────
  suite('refSchema', () => {
    const ref = refSchema('Cat');
    assert(typeof ref === 'object', 'returns an object');
    assert(ref.$ref === '#/components/schemas/Cat', 'produces correct $ref for a model name string');
    assert(refSchema('PaginatedList').$ref === '#/components/schemas/PaginatedList', 'works for any model name');
  });

  // ── Suite 2: createDocument (convenience wrapper) ──────────────────────
  suite('createDocument – convenience wrapper', () => {
    assert(typeof createDocument === 'function', 'createDocument is exported as a function');

    // Verify it delegates to SwaggerModule.createDocument by replacing it
    // temporarily with a spy — no real NestJS app required.
    const original = SwaggerModule.createDocument;
    let called = false;
    let receivedConfig: any;
    (SwaggerModule as any).createDocument = (app: any, cfg: any, opts: any) => {
      called = true;
      receivedConfig = cfg;
      return { openapi: '3.0.0', info: cfg, paths: {} };
    };

    const config = new DocumentBuilder().setTitle('Test API').setVersion('1.0.0').build();
    const doc = createDocument({} as any, config);

    (SwaggerModule as any).createDocument = original; // restore

    assert(called, 'delegates to SwaggerModule.createDocument');
    assert(doc.openapi === '3.0.0', 'returns the document produced by SwaggerModule');
    assert(receivedConfig === config, 'forwards config unchanged');
  });

  // ── Suite 3: @nestjs/swagger re-exports ────────────────────────────────
  suite('@nestjs/swagger re-exports are accessible', () => {
    assert(typeof DocumentBuilder === 'function', 'DocumentBuilder is exported');
    assert(typeof getSchemaPath === 'function', 'getSchemaPath is exported');
    assert(getSchemaPath('Dog') === '#/components/schemas/Dog', 'getSchemaPath works correctly');
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
