import { describe, expect, it } from "vitest";
import { toServerQuery, validateContract, type TableContract } from "../src";
import { contactsWith } from "./fixtures";

const contract = (mode: Record<string, string>): TableContract => {
  const result = validateContract(contactsWith({ mode }));
  if (!result.ok) throw new Error("fixture is invalid");
  return result.value;
};

const state = {
  sorting: [
    { id: "createdAt", desc: true },
    { id: "name", desc: false },
    { id: "ghost", desc: false },
  ],
  columnFilters: [{ id: "status", value: "active" }],
  pagination: { pageIndex: 2, pageSize: 25 },
};

describe("toServerQuery", () => {
  it("maps column ids to server keys for server-side operations", () => {
    const server = {
      sorting: "server",
      filtering: "server",
      pagination: "server",
    };
    expect(toServerQuery(contract(server), state)).toEqual({
      sort: [
        { key: "contact.created_at", desc: true },
        { key: "name", desc: false },
      ],
      filters: [{ key: "status", value: "active" }],
      page: { index: 2, size: 25 },
    });
  });

  it("omits operations the browser performs", () => {
    expect(toServerQuery(contract({}), state)).toEqual({});
  });
});
