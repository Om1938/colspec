# @colspec/react

React bindings for [colspec](https://github.com/Om1938/colspec): build a
TanStack Table from a JSON contract your backend serves.

```sh
npm install @colspec/react @colspec/tanstack @colspec/core @tanstack/react-table
```

## Usage

```tsx
import { validateContract } from "@colspec/core";
import { ColspecProvider, useContractTable } from "@colspec/react";
import { createTableRegistry } from "@colspec/tanstack";

// 1. Register the functions contracts may refer to. Do this once.
const registry = createTableRegistry<Contact>({
  cells: { "crm.statusBadge": ({ getValue }) => <Badge status={getValue()} /> },
});

// 2. Provide the registry.
export function App() {
  return (
    <ColspecProvider registry={registry}>
      <Contacts />
    </ColspecProvider>
  );
}

// 3. Build the table from a validated contract.
function Contacts({
  contract,
  data,
}: {
  contract: TableContract;
  data: Contact[];
}) {
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

Fetch and validate the contract however you like (`validateContract` from
`@colspec/core`), and keep the validated object in state or your query cache.

## API

| Export                          | Purpose                                                                                                                                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ColspecProvider`               | Makes a registry available to the tables below it.                                                                                                                                                         |
| `useContractTable(options)`     | Returns a TanStack table. Takes `contract` plus any TanStack table option; your options override what the contract sets. Throws a `ContractError` if the contract references something the registry lacks. |
| `useHydratedContract(contract)` | Returns `{ ok, value, diagnostics }` without throwing, so you can render a fallback.                                                                                                                       |
| `useRegistry()`                 | The registry from the nearest provider.                                                                                                                                                                    |

`useContractTable` returns the ordinary TanStack table instance. Markup,
styling and data fetching stay yours.

Requires React 19 and `@tanstack/react-table` 9.

[Documentation](https://github.com/Om1938/colspec/tree/main/apps/docs/guide) ·
[NestJS + MongoDB + React example](https://github.com/Om1938/colspec/tree/main/examples) · MIT
