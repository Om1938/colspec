# @colspec/core

The contract at the center of [colspec](https://github.com/Om1938/colspec):
a JSON format for TanStack Table definitions, with validation and the registry
types that connect names in the JSON to functions in your code.

It has no dependency on React, TanStack Table or any database, so it runs in
the browser and on the server.

```sh
npm install @colspec/core
```

## Validate a contract

```ts
import { validateContract } from "@colspec/core";

const result = validateContract(json);

if (result.ok) {
  result.value; // a typed TableContract
} else {
  result.diagnostics; // [{ code, severity, path, message }]
}
```

A contract looks like this. Property names follow TanStack Table v9; anything
executable is a named reference.

```json
{
  "schemaVersion": "1.0",
  "tableId": "inventory.products",
  "revision": 4,
  "columns": [
    {
      "id": "name",
      "accessorKey": "name",
      "header": "Name",
      "sortFn": "alphanumeric"
    },
    {
      "id": "status",
      "accessorKey": "status",
      "cell": { "ref": "inventory.statusBadge" }
    }
  ],
  "defaults": { "pagination": { "pageSize": 25 } },
  "mode": { "sorting": "client", "filtering": "client", "pagination": "server" }
}
```

Validation covers structure, schema version, duplicate column ids, defaults
that name unknown columns, and execution modes that don't work together. Add
your own checks with `validateContract(json, { rules })`.

## Compose registries

```ts
import { composeRegistries } from "@colspec/core";

const registry = composeRegistries([inventoryRegistry, billingRegistry]);
```

A name registered twice throws unless you pass `{ onCollision: "override" }`.

## Send table state to your API

```ts
import { toServerQuery } from "@colspec/core";

toServerQuery(contract, { sorting, columnFilters, pagination });
// { sort: [{ key: "product.created_at", desc: true }], page: { index: 0, size: 25 } }
```

Only the operations the contract runs on the server are included.

## JSON Schema

```ts
import schema from "@colspec/core/contract.schema.json" with { type: "json" };
```

## Related packages

- [`@colspec/tanstack`](https://www.npmjs.com/package/@colspec/tanstack): turn a contract into column definitions
- [`@colspec/react`](https://www.npmjs.com/package/@colspec/react): React hooks
- [`@colspec/server`](https://www.npmjs.com/package/@colspec/server): store and serve contracts

[Documentation](https://github.com/Om1938/colspec/tree/main/apps/docs/guide) · MIT
