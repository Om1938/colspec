# @colspec/server

Store, version and serve [colspec](https://github.com/Om1938/colspec) table
definitions from your own backend. It works with any database and any Node.js
framework, and needs no ORM or separate service.

```sh
npm install @colspec/server @colspec/core
```

## 1. Implement storage

One row or document per revision, unique by `(tableId, revision)`.

```ts
import type { TableDefinitionRepository } from "@colspec/server";

const repository: TableDefinitionRepository = {
  find: (tableId, revision) => /* one record or undefined */,
  findLatest: (tableId, status) => /* highest revision with that status */,
  list: (tableId) => /* all revisions, oldest first */,
  save: (record) => /* insert or replace */,
};
```

`createMemoryRepository()` is included for tests and prototypes.

## 2. Manage definitions

```ts
import { createTableDefinitionService } from "@colspec/server";

const definitions = createTableDefinitionService(repository);

await definitions.saveDraft(json); // validates; throws ContractError if invalid
await definitions.publish("crm.contacts", 4);
await definitions.getPublished("crm.contacts"); // latest published revision
await definitions.listRevisions("crm.contacts");
```

Drafts can be saved repeatedly. A published revision is immutable; change a
table by saving a new revision number.

## 3. Serve them

`getDefinitionResponse` returns `{ status, headers, body }` with an `ETag` and
`304 Not Modified` handling.

```ts
app.get("/api/table-definitions/:tableId", async (req, res) => {
  const { status, headers, body } = await getDefinitionResponse(definitions, {
    tableId: req.params.tableId,
    ifNoneMatch: req.get("if-none-match"),
  });
  res.status(status).set(headers).json(body);
});
```

## 4. Accept sort and filter requests safely

Clients send operation keys, not field names. Map every key through a list
you control.

```ts
import { resolveServerQuery } from "@colspec/server";

const result = resolveServerQuery(untrustedJson, {
  "contact.created_at": "contacts.created_at",
  status: "contacts.status",
});

if (!result.ok) return badRequest(result.diagnostics);
const { sort, filters, page } = result.value; // only fields from your list
```

Malformed input and unlisted keys are rejected. Filter _values_ are still
untrusted: validate or coerce them before they reach a query.

## Not included

Authentication and authorization. Decide in your application who may save,
publish and read definitions.

[Documentation](https://github.com/Om1938/colspec/tree/main/apps/docs/guide) ·
[NestJS + MongoDB example](https://github.com/Om1938/colspec/tree/main/examples) · MIT
