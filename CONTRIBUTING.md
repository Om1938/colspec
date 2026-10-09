# Contributing to colspec

Thanks for helping. By taking part you agree to the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Setup

You need Node.js 24 or later and pnpm.

```sh
pnpm install
pnpm turbo run lint check-types test build
```

The example API's end-to-end tests need MongoDB and run separately; see
[`examples/README.md`](examples/README.md).

## Layout

| Path | Contents |
| --- | --- |
| `packages/core` | Contract schema, validation, registries. No framework dependencies. |
| `packages/tanstack` | Contract to TanStack Table column definitions. |
| `packages/react` | React provider and hooks. |
| `packages/server` | Storage interface, publishing lifecycle, HTTP helper. |
| `apps/docs` | VitePress documentation. |
| `examples` | NestJS + MongoDB + React sample. |

Dependencies point one way: `core` ← `tanstack` ← `react`, and `core` ←
`server`. `core` must not import React, TanStack or a database driver.

## Making a change

1. Open an issue first for anything beyond a small fix, so the approach can
   be agreed before you write it.
2. Branch from `main` and keep the pull request to one change.
3. Add or update tests. Bug fixes should include a test that fails without
   the fix.
4. Run `pnpm changeset` if you changed a published package, and describe the
   change for users.
5. Update `apps/docs` if behavior or the contract changed.

## Changing the contract format

Stored contracts outlive SDK releases, so the format is held to a stricter
standard than the code:

- Within schema version `1.x`, changes must be additive and optional. A
  contract that validates today must keep validating and behave the same.
- Field names follow TanStack Table wherever the value is JSON.
- Anything executable is a `{ "ref": "name" }` resolved from a registry.
  colspec never evaluates code from a contract.

## Scope

colspec defines, distributes and hydrates TanStack Table definitions. UI
components, data fetching, authorization and support for other table engines
are out of scope.

## Reporting security issues

Do not open a public issue. See [SECURITY.md](SECURITY.md).
