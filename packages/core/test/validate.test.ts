import { describe, expect, it } from "vitest";
import { validateContract } from "../src";
import { contactsContract, contactsWith } from "./fixtures";

const codes = (
  input: unknown,
  options?: Parameters<typeof validateContract>[1],
) =>
  validateContract(input, options).diagnostics.map(
    (diagnostic) => diagnostic.code,
  );

describe("validateContract", () => {
  it("accepts the reference contract and applies defaults", () => {
    const result = validateContract(contactsContract);
    expect(result).toMatchObject({ ok: true, diagnostics: [] });
    if (result.ok) expect(result.value.defaults?.pagination?.pageIndex).toBe(0);
  });

  it("reports structural problems with their path", () => {
    const result = validateContract(
      contactsWith({ columns: [{ id: "a", sortingFn: "basic" }] }),
    );
    expect(result.ok).toBe(false);
    expect(result.diagnostics[0]).toMatchObject({
      code: "invalid-structure",
      path: ["columns", 0],
    });
  });

  it("rejects a function reference that is not a ref object", () => {
    expect(
      codes(contactsWith({ columns: [{ id: "a", cell: "badge" }] })),
    ).toEqual(["invalid-structure"]);
  });

  it("rejects duplicate column ids", () => {
    expect(
      codes(
        contactsWith({
          columns: [{ id: "a" }, { id: "a" }],
          defaults: undefined,
        }),
      ),
    ).toEqual(["duplicate-column-id"]);
  });

  it("rejects a column with two accessors", () => {
    const column = { id: "a", accessorKey: "a", accessorFn: { ref: "x" } };
    expect(
      codes(contactsWith({ columns: [column], defaults: undefined })),
    ).toEqual(["conflicting-accessors"]);
  });

  it("rejects defaults that reference unknown columns", () => {
    expect(
      codes(
        contactsWith({ defaults: { sorting: [{ id: "nope", desc: true }] } }),
      ),
    ).toEqual(["unknown-column"]);
  });

  it("rejects an unsupported major schema version", () => {
    expect(codes(contactsWith({ schemaVersion: "2.0" }))).toEqual([
      "unsupported-schema-version",
    ]);
  });

  it("accepts a newer minor schema version", () => {
    expect(validateContract(contactsWith({ schemaVersion: "1.3" })).ok).toBe(
      true,
    );
  });

  it("migrates unsupported versions when a migration is supplied", () => {
    const migrate = (definition: unknown) => ({
      ...(definition as object),
      schemaVersion: "1.0",
    });
    expect(
      validateContract(contactsWith({ schemaVersion: "0.9" }), { migrate }).ok,
    ).toBe(true);
  });

  it("warns, without failing, when client operations meet server pagination", () => {
    const result = validateContract(
      contactsWith({
        mode: { sorting: "client", filtering: "server", pagination: "server" },
      }),
    );
    expect(result.ok).toBe(true);
    expect(result.diagnostics).toMatchObject([
      { code: "mode-mismatch", severity: "warning", path: ["mode", "sorting"] },
    ]);
  });

  it("runs application rules after the built-in ones", () => {
    const rule = () => [
      { code: "custom", severity: "error" as const, path: [], message: "no" },
    ];
    expect(codes(contactsContract, { rules: [rule] })).toEqual(["custom"]);
  });
});
