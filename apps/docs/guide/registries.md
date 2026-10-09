# Registries

A registry holds the functions contracts may refer to. Nothing stored in the
database is ever executed: a contract can only name a function your deployed
frontend already contains.

| Category         | Referenced by      | Type                          |
| ---------------- | ------------------ | ----------------------------- |
| `sortFns`        | `sortFn`           | TanStack `SortFn`             |
| `filterFns`      | `filterFn`         | TanStack `FilterFn`           |
| `aggregationFns` | `aggregationFn`    | TanStack `AggregationFnDef`   |
| `accessorFns`    | `accessorFn`       | `(row, index) => value`       |
| `cells`          | `cell`             | `(cellContext) => rendered`   |
| `headers`        | `header`, `footer` | `(headerContext) => rendered` |
| `formatters`     | `formatter`        | `(value) => rendered`         |
| `actions`        | `actions`          | `(row) => unknown`            |

## Composing

Let each module own its functions and compose them once.

```ts
import { composeRegistries } from "@colspec/core";

const registry = composeRegistries([inventoryRegistry, billingRegistry]);
```

A name registered twice in the same category throws a
`RegistryCollisionError`. To let later registries win deliberately, pass
`{ onCollision: "override" }`.

Create the registry once and reuse it. Its identity is part of the hydration
cache key.

## Missing references

If a contract names something that is not registered, hydration fails with a
diagnostic. It never substitutes another function, because a wrong sort or
formatter is a business bug that looks like a working table.

| Code                | Cause                                      |
| ------------------- | ------------------------------------------ |
| `missing-reference` | A `{ "ref": ... }` is not in the registry. |
| `unknown-builtin`   | A plain name is not a TanStack built-in.   |

This is why a new contract revision can ship without a frontend deploy only
when the deployed frontend already has every function it references.

## Features

`useContractTable` uses `defaultFeatures` from `@colspec/tanstack`: sorting,
filtering, pagination, visibility and sizing. Pass your own
`tableFeatures({...})` as `features` to include grouping, pinning or
aggregation, or to ship less.
