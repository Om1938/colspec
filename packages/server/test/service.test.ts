import { ContractError } from "@colspec/core";
import { describe, expect, it } from "vitest";
import { productsContract, productsWith } from "../../core/test/fixtures";
import {
  createMemoryRepository,
  createTableDefinitionService,
  DefinitionNotFoundError,
  getDefinitionResponse,
  RevisionPublishedError,
} from "../src";

const TABLE = "inventory.products";
const setup = () => createTableDefinitionService(createMemoryRepository());

describe("table definition service", () => {
  it("keeps drafts private until they are published", async () => {
    const service = setup();
    await service.saveDraft(productsContract);
    expect(await service.getPublished(TABLE)).toBeUndefined();

    await service.publish(TABLE, 4);
    expect(await service.getPublished(TABLE)).toMatchObject({
      revision: 4,
      status: "published",
    });
  });

  it("lets a draft be revised but freezes a published revision", async () => {
    const service = setup();
    await service.saveDraft(productsContract);
    await service.saveDraft(productsWith({ meta: { note: "edited" } }));
    await service.publish(TABLE, 4);

    await expect(service.saveDraft(productsContract)).rejects.toThrow(
      RevisionPublishedError,
    );
    expect((await service.getPublished(TABLE))?.definition.meta).toEqual({
      note: "edited",
    });
  });

  it("serves the latest published revision and specific ones on request", async () => {
    const service = setup();
    for (const revision of [4, 5, 6])
      await service.saveDraft(productsWith({ revision }));
    await service.publish(TABLE, 4);
    await service.publish(TABLE, 5);

    expect((await service.getPublished(TABLE))?.revision).toBe(5);
    expect((await service.getPublished(TABLE, 4))?.revision).toBe(4);
    expect(await service.getPublished(TABLE, 6)).toBeUndefined();
    expect(
      (await service.listRevisions(TABLE)).map((r) => [r.revision, r.status]),
    ).toEqual([
      [4, "published"],
      [5, "published"],
      [6, "draft"],
    ]);
  });

  it("rejects invalid definitions with diagnostics", async () => {
    await expect(
      setup().saveDraft(productsWith({ columns: [] })),
    ).rejects.toThrow(ContractError);
  });

  it("fails to publish a revision that does not exist", async () => {
    await expect(setup().publish(TABLE, 9)).rejects.toThrow(
      DefinitionNotFoundError,
    );
  });
});

describe("getDefinitionResponse", () => {
  it("returns the contract with an ETag, then 304 for a matching request", async () => {
    const service = setup();
    await service.saveDraft(productsContract);
    await service.publish(TABLE, 4);

    const first = await getDefinitionResponse(service, { tableId: TABLE });
    expect(first).toMatchObject({
      status: 200,
      body: { tableId: TABLE, revision: 4 },
    });

    const ifNoneMatch = first.headers.ETag;
    expect(
      await getDefinitionResponse(service, { tableId: TABLE, ifNoneMatch }),
    ).toEqual({
      status: 304,
      headers: first.headers,
    });

    await service.saveDraft(productsWith({ revision: 5 }));
    await service.publish(TABLE, 5);
    const next = await getDefinitionResponse(service, {
      tableId: TABLE,
      ifNoneMatch,
    });
    expect(next).toMatchObject({ status: 200, body: { revision: 5 } });
  });

  it("returns 404 when nothing is published", async () => {
    expect(
      (await getDefinitionResponse(setup(), { tableId: TABLE })).status,
    ).toBe(404);
  });
});
