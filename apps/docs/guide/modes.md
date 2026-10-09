# Client and server modes

A contract states where each operation runs.

```json
{
  "mode": { "sorting": "server", "filtering": "server", "pagination": "server" }
}
```

Each defaults to `"client"`. A `"server"` operation sets TanStack's matching
`manualSorting`, `manualFiltering` or `manualPagination`, so the table shows
rows as your API returned them.

Sorting, filtering and pagination must work on the same dataset. If the server
paginates while the browser sorts, only the current page is sorted.
`validateContract` reports that combination as a `mode-mismatch` warning.

## Sending table state to your API

colspec does not fetch data. It translates table state into a query for the
operations that run on the server.

```ts
import { toServerQuery } from "@colspec/core";

const query = toServerQuery(contract, table.state);
// { sort: [{ key: "product.created_at", desc: true }], page: { index: 0, size: 25 } }
```

Keys come from each column's `server.sortKey` or `server.filterKey`, falling
back to the column id.

```json
{
  "id": "createdAt",
  "accessorKey": "createdAt",
  "server": { "sortKey": "product.created_at" }
}
```

## Resolving keys on the backend

A key is an identifier chosen by the backend, not a column name to trust. Map
every key through a list you control before it reaches a query.

```ts
import { resolveServerQuery } from "@colspec/server";

const result = resolveServerQuery(query, {
  "product.created_at": "products.created_at",
  status: "products.status",
});

if (!result.ok) return badRequest(result.diagnostics); // unapproved-key
const { sort, filters, page } = result.value; // fields from your list only
```

Values in the map can be anything your query layer needs: column names, query
builder fragments or functions.

A contract describes presentation and behavior. It is not an access-control
policy: your data endpoints still enforce permissions on their own.
