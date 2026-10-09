import { validateContract, type TableContract } from "@colspec/core";
import { constructTable, sortFns } from "@tanstack/table-core";
import { storeReactivityBindings } from "@tanstack/table-core/store-reactivity-bindings";
import { describe, expect, it } from "vitest";
import { contactsContract, contactsWith } from "../../core/test/fixtures";
import { createTableRegistry, defaultFeatures, hydrateContract } from "../src";

interface Contact {
  name: string;
  status: string;
  first: string;
  last: string;
  createdAt: string;
}

const data: Contact[] = [
  {
    name: "item 10",
    status: "active",
    first: "Ada",
    last: "Lovelace",
    createdAt: "2026-01-02",
  },
  {
    name: "item 2",
    status: "inactive",
    first: "Alan",
    last: "Turing",
    createdAt: "2026-01-01",
  },
];

const statusBadge = () => "badge";
const registry = createTableRegistry<Contact>({
  accessorFns: { "crm.fullName": (row) => `${row.first} ${row.last}` },
  cells: { "crm.statusBadge": statusBadge },
});

function parse(input: unknown): TableContract {
  const result = validateContract(input);
  if (!result.ok) throw new Error("fixture is invalid");
  return result.value;
}

function hydrate(input: unknown, using = registry) {
  const result = hydrateContract<typeof defaultFeatures, Contact>(
    parse(input),
    using,
  );
  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  return result.value;
}

// Outside a framework adapter, the table needs its own reactivity binding.
const features = {
  ...defaultFeatures,
  coreReactivityFeature: storeReactivityBindings(),
};

const tableFor = (input: unknown, initialState = {}) => {
  const { columns, options } = hydrate(input);
  return constructTable({
    ...options,
    initialState: { ...options.initialState, ...initialState },
    features,
    columns,
    data,
  });
};

const names = (table: ReturnType<typeof tableFor>) =>
  table.getRowModel().rows.map((row) => row.original.name);

describe("hydrateContract", () => {
  it("resolves built-ins by name and references from the registry", () => {
    const [name, status, fullName, createdAt] =
      hydrate(contactsContract).columns;
    expect(name).toMatchObject({
      id: "name",
      header: "Contact Name",
      size: 240,
    });
    expect(name).toHaveProperty("sortFn", sortFns.alphanumeric);
    expect(status).toHaveProperty("cell", statusBadge);
    expect(fullName).toHaveProperty(
      "accessorFn",
      registry.accessorFns["crm.fullName"],
    );
    expect(createdAt).not.toHaveProperty("server");
    expect(createdAt).not.toHaveProperty("sortFn");
  });

  it("drives a real table: default sorting uses the named sort function", () => {
    // alphanumeric orders "item 2" before "item 10"; a plain text sort would not.
    expect(names(tableFor(contactsContract))).toEqual(["item 2", "item 10"]);
  });

  it("drives a real table: filtering and computed accessors", () => {
    const table = tableFor(contactsContract, {
      columnFilters: [{ id: "status", value: "active" }],
    });
    expect(names(table)).toEqual(["item 10"]);
    expect(table.getRowModel().rows[0]?.getValue("fullName")).toBe(
      "Ada Lovelace",
    );
  });

  it("leaves server-side operations to the data API", () => {
    const server = {
      sorting: "server",
      filtering: "server",
      pagination: "server",
    };
    const { options } = hydrate(contactsWith({ mode: server }));
    expect(options).toMatchObject({
      manualSorting: true,
      manualFiltering: true,
      manualPagination: true,
    });
    expect(names(tableFor(contactsWith({ mode: server })))).toEqual([
      "item 10",
      "item 2",
    ]);
  });

  it("reports missing references instead of falling back", () => {
    const result = hydrateContract(
      parse(contactsContract),
      createTableRegistry(),
    );
    expect(result.ok).toBe(false);
    expect(result.diagnostics).toMatchObject([
      { code: "missing-reference", path: ["columns", 1, "cell"] },
      { code: "missing-reference", path: ["columns", 2, "accessorFn"] },
    ]);
  });

  it("reports unknown built-in names", () => {
    const columns = [{ id: "a", accessorKey: "name", sortFn: "alphabetical" }];
    const result = hydrateContract(
      parse(contactsWith({ columns, defaults: undefined })),
      registry,
    );
    expect(result.diagnostics).toMatchObject([
      { code: "unknown-builtin", path: ["columns", 0, "sortFn"] },
    ]);
  });

  it("applies formatters and exposes row actions through column meta", () => {
    const archive = () => "archived";
    const custom = createTableRegistry<Contact>({
      formatters: { upper: (value: string) => value.toUpperCase() },
      actions: { archive },
    });
    const columns = [
      {
        id: "name",
        accessorKey: "name",
        formatter: { ref: "upper" },
        actions: [{ ref: "archive" }],
        meta: { align: "left" },
      },
    ];
    const [column] = hydrate(
      contactsWith({ columns, defaults: undefined }),
      custom,
    ).columns;
    expect(column?.meta).toEqual({ align: "left", actions: { archive } });
    const cell = column?.cell as (context: {
      getValue: () => string;
    }) => unknown;
    expect(cell({ getValue: () => "ada" })).toBe("ADA");
  });

  it("memoizes by contract and registry identity", () => {
    const contract = parse(contactsContract);
    expect(hydrateContract(contract, registry)).toBe(
      hydrateContract(contract, registry),
    );
    expect(hydrateContract(parse(contactsContract), registry)).not.toBe(
      hydrateContract(contract, registry),
    );
  });
});
