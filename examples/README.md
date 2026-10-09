# colspec example: NestJS, MongoDB, React

A products table whose columns live in MongoDB. The API stores and serves the
table definition with `@colspec/server`; the front end turns it into a
TanStack Table with `@colspec/react`. Sorting, filtering and pagination all
run in MongoDB.

| Path                 | What it is                                                          |
| -------------------- | ------------------------------------------------------------------- |
| [`api`](api)         | NestJS API. Table definitions and products in MongoDB via Mongoose. |
| [`web`](web)         | React + Vite app using TanStack Table v9.                           |
| `docker-compose.yml` | MongoDB on port 27017.                                              |

## Run it

From the repository root:

```sh
pnpm install
pnpm build --filter "./packages/*"        # the examples use the built packages
docker compose -f examples/docker-compose.yml up -d
pnpm --filter example-api start           # http://localhost:3000
pnpm --filter example-web dev             # http://localhost:5173
```

On first start the API seeds 35 products and publishes revision 1 of the
`inventory.products` definition.

## Change the table without touching the front end

Save a new revision and publish it, then reload the page:

```sh
curl -s localhost:3000/api/table-definitions/inventory.products \
  | sed 's/"revision":1/"revision":2/; s/"Product Name"/"Name"/' \
  | curl -s -X POST localhost:3000/api/table-definitions \
      -H 'Content-Type: application/json' -d @-

curl -s -X POST localhost:3000/api/table-definitions/inventory.products/revisions/2/publish
```

This works because revision 2 only refers to functions the front end already
registers in [`web/src/registry.tsx`](web/src/registry.tsx).

## Where to look

- [`api/src/table-definitions/mongo-table-definition.repository.ts`](api/src/table-definitions/mongo-table-definition.repository.ts):
  colspec's storage interface over a Mongoose model.
- [`api/src/products/product-fields.ts`](api/src/products/product-fields.ts):
  the list of keys a client may sort and filter by.
- [`api/src/products/products.contract.ts`](api/src/products/products.contract.ts):
  the seeded table definition.
- [`web/src/ProductsTable.tsx`](web/src/ProductsTable.tsx): the table, driven
  by the contract.

The API has no authentication. A real application must restrict who can save
and publish definitions.

## Tests

```sh
pnpm --filter example-api test:e2e   # needs MongoDB; uses its own database
pnpm --filter example-web test       # no backend needed
```
