# colspec

[![CI](https://github.com/Om1938/colspec/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Om1938/colspec/actions/workflows/ci.yml)
[![Coverage](https://raw.githubusercontent.com/Om1938/colspec/badges/coverage.svg)](https://github.com/Om1938/colspec/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@colspec/core?label=npm)](https://www.npmjs.com/org/colspec)
[![Downloads](https://img.shields.io/npm/dm/@colspec/core)](https://www.npmjs.com/package/@colspec/core)
[![License: MIT](https://img.shields.io/npm/l/@colspec/core)](LICENSE)
[![TypeScript](https://img.shields.io/badge/types-included-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Define TanStack Table columns as JSON in your backend and hydrate them into
native `ColumnDef`s in your frontend. Functions stay in your code and are
referenced by name; nothing from the database is executed.

Targets TanStack Table v9.

| Package                                  | Version                                                                                                          | Purpose                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [`@colspec/core`](packages/core)         | [![npm](https://img.shields.io/npm/v/@colspec/core?label=)](https://www.npmjs.com/package/@colspec/core)         | Contract schema, validation, registries. No framework dependencies. |
| [`@colspec/tanstack`](packages/tanstack) | [![npm](https://img.shields.io/npm/v/@colspec/tanstack?label=)](https://www.npmjs.com/package/@colspec/tanstack) | Contract to TanStack column definitions and table options.          |
| [`@colspec/react`](packages/react)       | [![npm](https://img.shields.io/npm/v/@colspec/react?label=)](https://www.npmjs.com/package/@colspec/react)       | `ColspecProvider`, `useContractTable`, `useHydratedContract`.       |
| [`@colspec/server`](packages/server)     | [![npm](https://img.shields.io/npm/v/@colspec/server?label=)](https://www.npmjs.com/package/@colspec/server)     | Storage interface, draft/publish lifecycle, HTTP helper.            |

```tsx
const registry = createTableRegistry<Product>({
  cells: {
    "inventory.statusBadge": ({ getValue }) => (
      <StatusBadge status={getValue()} />
    ),
  },
});

const result = validateContract(
  await (await fetch("/api/table-definitions/inventory.products")).json(),
);

// inside <ColspecProvider registry={registry}>
const table = useContractTable<Product>({ contract: result.value, data });
```

Documentation lives in [`apps/docs`](apps/docs/guide/getting-started.md).

## Development

```sh
pnpm install
pnpm build         # turbo run build
pnpm test          # turbo run test
pnpm test:coverage # package tests with a coverage report
pnpm lint
pnpm check-types
pnpm --filter docs dev
```

Dependencies point one way: `core` ← `tanstack` ← `react`, and `core` ← `server`.

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

Releases use [Changesets](.changeset/README.md): run `pnpm changeset` with
your change, and the release workflow opens a version PR and publishes on merge.

## License

[MIT](LICENSE)
