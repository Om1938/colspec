# Server SDK

`@colspec/server` runs inside your existing backend. It needs no ORM, no
particular framework and no separate service.

## Storage

Implement `TableDefinitionRepository` over your database. One row or document
per revision, unique by `(tableId, revision)`.

```ts
interface TableDefinitionRepository {
  find(tableId, revision): Promise<TableDefinitionRecord | undefined>;
  findLatest(tableId, status): Promise<TableDefinitionRecord | undefined>;
  list(tableId): Promise<TableDefinitionRecord[]>;
  save(record): Promise<void>; // insert or replace
}
```

A PostgreSQL table for it:

```sql
create table table_definitions (
  table_id       text        not null,
  revision       integer     not null,
  schema_version text        not null,
  definition     jsonb       not null,
  status         text        not null check (status in ('draft', 'published')),
  created_at     timestamptz not null,
  updated_at     timestamptz not null,
  primary key (table_id, revision)
);
```

`createMemoryRepository()` is included for tests and prototypes.

## Lifecycle

```ts
import { createTableDefinitionService } from "@colspec/server";

const definitions = createTableDefinitionService(repository);

await definitions.saveDraft(json); // validates; throws ContractError if invalid
await definitions.publish("inventory.products", 4);
await definitions.getPublished("inventory.products"); // latest published
await definitions.getPublished("inventory.products", 3); // a specific revision
await definitions.listRevisions("inventory.products");
```

Drafts can be saved repeatedly. Once published, a revision is immutable:
saving it again throws `RevisionPublishedError`. Change a table by saving a
new revision number.

Who may call `saveDraft` and `publish` is your application's decision. The SDK
does no authorization.

## Serving contracts

`getDefinitionResponse` returns a plain `{ status, headers, body }`, with an
`ETag` and `304 Not Modified` handling, so no cache service is needed.

::: code-group

```ts [Express]
app.get("/api/table-definitions/:tableId", async (req, res) => {
  const { status, headers, body } = await getDefinitionResponse(definitions, {
    tableId: req.params.tableId,
    ifNoneMatch: req.get("if-none-match"),
  });
  res.status(status).set(headers).json(body);
});
```

```ts [Fastify]
app.get("/api/table-definitions/:tableId", async (request, reply) => {
  const { status, headers, body } = await getDefinitionResponse(definitions, {
    tableId: request.params.tableId,
    ifNoneMatch: request.headers["if-none-match"],
  });
  return reply.code(status).headers(headers).send(body);
});
```

```ts [Fetch API]
export async function GET(request: Request, tableId: string) {
  const { status, headers, body } = await getDefinitionResponse(definitions, {
    tableId,
    ifNoneMatch: request.headers.get("if-none-match"),
  });
  return new Response(body && JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
```

:::

The response body is the contract itself, ready for `validateContract` on the
client.
