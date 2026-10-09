# Getting started

colspec targets **TanStack Table v9**. It is a contract compiler, not a table
library: rendering, data fetching and authorization stay in your application.

| Package             | Use it for                                                                     |
| ------------------- | ------------------------------------------------------------------------------ |
| `@colspec/core`     | The contract schema, validation and registry types. No framework dependencies. |
| `@colspec/tanstack` | Turning a contract into TanStack column definitions and table options.         |
| `@colspec/react`    | A provider and hooks for React.                                                |
| `@colspec/server`   | Storing, publishing and serving contracts from your backend.                   |

## Install

```sh
pnpm add @colspec/core @colspec/tanstack @colspec/react @tanstack/react-table
```

## 1. Register your functions

Contracts refer to functions by name. Register them once, at start-up.

```tsx
import { createTableRegistry } from "@colspec/tanstack";
import { ColspecProvider } from "@colspec/react";

const registry = createTableRegistry<Contact>({
  accessorFns: { "crm.fullName": (row) => `${row.first} ${row.last}` },
  cells: {
    "crm.statusBadge": ({ getValue }) => <StatusBadge status={getValue()} />,
  },
});

export function App() {
  return (
    <ColspecProvider registry={registry}>
      <Contacts />
    </ColspecProvider>
  );
}
```

## 2. Validate the contract you fetched

Fetching is yours. Validate whatever arrives before using it.

```ts
import { validateContract } from "@colspec/core";

const response = await fetch("/api/table-definitions/crm.contacts");
const result = validateContract(await response.json());
if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
const contract = result.value;
```

Keep the validated `contract` object around (in state or your query cache).
Hydration is memoized on its identity.

## 3. Build the table

```tsx
import { useContractTable } from "@colspec/react";

function Contacts() {
  const table = useContractTable<Contact>({ contract, data });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id}>
                <table.FlexRender header={header} />
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <td key={cell.id}>
                <table.FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

`useContractTable` returns the ordinary TanStack table instance. Any other
table option (`state`, `onSortingChange`, `features`, ...) can be passed
alongside `contract` and takes precedence over what the contract sets.

It throws a `ContractError` if the contract references a function the registry
does not have. To render a fallback instead, call `useHydratedContract` and
check `result.ok`.

## Without React

```ts
import { hydrateContract } from "@colspec/tanstack";

const result = hydrateContract(contract, registry);
if (result.ok) {
  const { columns, options } = result.value; // pass to any TanStack adapter
}
```
