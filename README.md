# colspec

Define TanStack Table columns as JSON in your backend and hydrate them into
native `ColumnDef`s in your frontend. Functions stay in your code and are
referenced by name; nothing from the database is executed.

Targets TanStack Table v9.

| Package                                  | Purpose                                                             |
| ---------------------------------------- | ------------------------------------------------------------------- |
| [`@colspec/core`](packages/core)         | Contract schema, validation, registries. No framework dependencies. |
| [`@colspec/tanstack`](packages/tanstack) | Contract to TanStack column definitions and table options.          |
| [`@colspec/react`](packages/react)       | `ColspecProvider`, `useContractTable`, `useHydratedContract`.       |
| [`@colspec/server`](packages/server)     | Storage interface, draft/publish lifecycle, HTTP helper.            |

```tsx
const registry = createTableRegistry<Contact>({
  cells: {
    "crm.statusBadge": ({ getValue }) => <StatusBadge status={getValue()} />,
  },
});

const result = validateContract(
  await (await fetch("/api/table-definitions/crm.contacts")).json(),
);

// inside <ColspecProvider registry={registry}>
const table = useContractTable<Contact>({ contract: result.value, data });
```

Documentation lives in [`apps/docs`](apps/docs/guide/getting-started.md).

## Development

```sh
pnpm install
pnpm build         # turbo run build
pnpm test          # turbo run test
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
