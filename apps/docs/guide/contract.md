# The contract

The contract is the only format stored in your backend. Property names match
TanStack Table v9 wherever the value is JSON-compatible; anything executable
is a named reference instead.

```json
{
  "schemaVersion": "1.0",
  "tableId": "crm.contacts",
  "revision": 4,
  "columns": [
    {
      "id": "name",
      "accessorKey": "name",
      "header": "Contact Name",
      "sortFn": "alphanumeric",
      "filterFn": "includesString",
      "size": 240
    },
    {
      "id": "status",
      "accessorKey": "status",
      "cell": { "ref": "crm.statusBadge" },
      "filterFn": "equalsString"
    },
    {
      "id": "fullName",
      "header": "Full Name",
      "accessorFn": { "ref": "crm.fullName" }
    }
  ],
  "defaults": {
    "sorting": [{ "id": "name", "desc": false }],
    "pagination": { "pageSize": 25 }
  },
  "mode": { "sorting": "client", "filtering": "client", "pagination": "server" }
}
```

::: tip Coming from TanStack Table v8?
v9 renamed `sortingFn` to `sortFn`. The contract follows v9.
:::

## Names and references

| Value                          | Meaning                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| `"alphanumeric"`               | A TanStack built-in, for `sortFn`, `filterFn` and `aggregationFn`. |
| `"auto"`                       | Let TanStack choose from the column's data.                        |
| `{ "ref": "crm.statusBadge" }` | A function your application registered.                            |

`header` and `footer` accept literal text or a reference. `cell`, `accessorFn`
and `formatter` accept references only.

## Column fields

- **Identity and data:** `id` (required), `accessorKey` or `accessorFn`.
- **Rendering:** `header`, `footer`, `cell`, `formatter` (applied to the value
  when there is no `cell`), `actions` (references exposed to your renderers as
  `column.columnDef.meta.actions`).
- **Behavior:** `sortFn`, `filterFn`, `aggregationFn`, `enableSorting`,
  `enableMultiSort`, `invertSorting`, `sortDescFirst`, `sortUndefined`,
  `enableColumnFilter`, `enableGlobalFilter`, `enableHiding`, `enableGrouping`,
  `enablePinning`, `enableResizing`.
- **Sizing:** `size`, `minSize`, `maxSize`.
- **Server keys:** `server.sortKey`, `server.filterKey` (see
  [modes](./modes)).
- **`meta`:** any JSON, passed through to the column's `meta`.

Unknown fields are rejected, so a typo surfaces as a diagnostic instead of
being ignored. Grouped (nested) columns are not part of schema 1.0.

## Validation

```ts
const result = validateContract(json);
// { ok: true, value, diagnostics } | { ok: false, diagnostics }
```

Each diagnostic has a `code`, `severity`, `path` and `message`.

| Code                         | Severity | Cause                                               |
| ---------------------------- | -------- | --------------------------------------------------- |
| `invalid-structure`          | error    | The JSON does not match the schema.                 |
| `unsupported-schema-version` | error    | A different major schema version.                   |
| `duplicate-column-id`        | error    | Two columns share an id.                            |
| `conflicting-accessors`      | error    | A column sets `accessorKey` and `accessorFn`.       |
| `unknown-column`             | error    | `defaults` mention a column that is not defined.    |
| `mode-mismatch`              | warning  | Client sorting or filtering with server pagination. |

Add your own checks with `validateContract(json, { rules: [...] })`, and
upgrade old definitions with `{ migrate }`.

## Three versions

| Version        | Example | Changes when                    |
| -------------- | ------- | ------------------------------- |
| Schema version | `1.0`   | The contract format changes.    |
| Revision       | `4`     | One table's definition changes. |
| SDK version    | `0.1.0` | A package is released.          |

## JSON Schema

A JSON Schema for non-TypeScript tooling ships with the core package:

```ts
import schema from "@colspec/core/contract.schema.json" with { type: "json" };
```

It covers structure only; the semantic rules above run in `validateContract`.
