# @colspec/tanstack

Turns a [colspec](https://github.com/Om1938/colspec) contract into native
TanStack Table v9 column definitions and table options. Framework-independent:
use it with any TanStack Table adapter.

```sh
npm install @colspec/tanstack @colspec/core @tanstack/table-core
```

## Usage

Register the functions contracts may refer to, once:

```ts
import { createTableRegistry } from "@colspec/tanstack";

const registry = createTableRegistry<Contact>({
  accessorFns: { "crm.fullName": (row) => `${row.first} ${row.last}` },
  cells: { "crm.statusBadge": ({ getValue }) => renderBadge(getValue()) },
  formatters: {
    "crm.date": (value: string) => new Date(value).toLocaleDateString(),
  },
});
```

Then hydrate a validated contract:

```ts
import { hydrateContract } from "@colspec/tanstack";

const result = hydrateContract<typeof features, Contact>(contract, registry);

if (result.ok) {
  const { columns, options } = result.value;
  // columns: ColumnDef[]
  // options: { initialState, manualSorting, manualFiltering, manualPagination }
}
```

## How names resolve

| In the contract                        | Resolves to                               |
| -------------------------------------- | ----------------------------------------- |
| `"sortFn": "alphanumeric"`             | TanStack's built-in function of that name |
| `"sortFn": "auto"`                     | Passed through; TanStack chooses          |
| `"cell": { "ref": "crm.statusBadge" }` | Your registered function                  |
| `"header": "Name"`                     | Literal text                              |

A name that can't be found produces a `missing-reference` or `unknown-builtin`
diagnostic. colspec never substitutes a different function, and never executes
anything stored in a contract.

Results are memoized by contract and registry identity, so `columns` stays
stable between renders as long as you keep the same contract object.

## Registry categories

`sortFns`, `filterFns`, `aggregationFns`, `accessorFns`, `cells`, `headers`
(also used for footers), `formatters`, `actions`.

## Features

`defaultFeatures` is a ready-made TanStack feature set covering sorting,
filtering, pagination, visibility and sizing. Pass your own `tableFeatures()`
to add grouping or pinning, or to ship less.

Requires `@tanstack/table-core` 9.

[Documentation](https://github.com/Om1938/colspec/tree/main/apps/docs/guide) · MIT
