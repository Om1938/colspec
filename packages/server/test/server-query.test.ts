import { describe, expect, it } from "vitest";
import { resolveServerQuery } from "../src";

const fields = {
  "contact.created_at": "contacts.created_at",
  status: "contacts.status",
};

describe("resolveServerQuery", () => {
  it("maps approved keys to backend fields", () => {
    const result = resolveServerQuery(
      {
        sort: [{ key: "contact.created_at", desc: true }],
        filters: [{ key: "status", value: "active" }],
        page: { index: 0, size: 25 },
      },
      fields,
    );
    expect(result).toMatchObject({
      ok: true,
      value: {
        sort: [{ field: "contacts.created_at", desc: true }],
        filters: [{ field: "contacts.status", value: "active" }],
        page: { index: 0, size: 25 },
      },
    });
  });

  it("rejects keys that are not approved, including inherited names", () => {
    const result = resolveServerQuery(
      {
        sort: [
          { key: "1; DROP TABLE contacts", desc: false },
          { key: "toString", desc: false },
        ],
      },
      fields,
    );
    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((d) => d.path)).toEqual([
      ["sort", 0, "key"],
      ["sort", 1, "key"],
    ]);
  });

  it("rejects input that is not a well-formed query", () => {
    const result = resolveServerQuery(
      { sort: [{ key: "status", desc: "yes" }] },
      fields,
    );
    expect(result.diagnostics).toMatchObject([
      { code: "invalid-query", path: ["sort", 0, "desc"] },
    ]);
  });
});
