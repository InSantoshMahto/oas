# oas

This repository contains a prototype extraction of OpenAPI generation logic (RFC) intended to become a focused core package for OpenAPI generation and complementary UI adapters.

Repository layout

- `src/` — the package source for `@insantoshmahto/oas` (minimal prototype + compat wrapper to prefer `@nestjs/swagger` when available).
- `examples/` — small example(s) demonstrating usage.
- `prompt.md` — RFC / design notes used to drive the extraction.
- `LICENSE` — project license (MIT).

Getting started (developer)

1. cd into the package: `cd src`
2. Install deps: `npm install`
3. Build: `npm run build`

Using the package

Import from `@insantoshmahto/oas` in your application or tooling. If you install `@nestjs/swagger` in the consuming project, this package will prefer it for spec generation and delegate to the upstream implementation for full feature parity.

Contributing

Please read `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` before opening issues or PRs.

