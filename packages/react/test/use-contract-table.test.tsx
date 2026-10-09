// @vitest-environment jsdom
import {
  ContractError,
  validateContract,
  type TableContract,
} from "@colspec/core";
import { createTableRegistry } from "@colspec/tanstack";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { productsContract } from "../../core/test/fixtures";
import { ColspecProvider, useContractTable } from "../src";

interface Product {
  name: string;
  status: string;
  brand: string;
  model: string;
  createdAt: string;
}

const data: Product[] = [
  {
    name: "item 10",
    status: "active",
    brand: "Acme",
    model: "Lamp",
    createdAt: "2026-01-02",
  },
  {
    name: "item 2",
    status: "inactive",
    brand: "Apex",
    model: "Torch",
    createdAt: "2026-01-01",
  },
];

const registry = createTableRegistry<Product>({
  accessorFns: { "inventory.brandModel": (row) => `${row.brand} ${row.model}` },
  cells: {
    "inventory.statusBadge": ({ getValue }) => (
      <strong>{String(getValue())}</strong>
    ),
  },
});

const parsed = validateContract(productsContract);
if (!parsed.ok) throw new Error("fixture is invalid");
const contract: TableContract = parsed.value;

function ProductsTable() {
  const table = useContractTable<Product>({ contract, data });
  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id}>
                <table.FlexRender header={header} />
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <td key={cell.id}>
                <table.FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

afterEach(cleanup);

describe("useContractTable", () => {
  it("renders headers, sorted rows and registered renderers from a contract", () => {
    render(
      <ColspecProvider registry={registry}>
        <ProductsTable />
      </ColspecProvider>,
    );

    expect(
      screen.getAllByRole("columnheader").map((th) => th.textContent),
    ).toEqual(["Product Name", "Status", "Brand / Model", "createdAt"]);
    const [first, second] = screen.getAllByRole("row").slice(1);
    expect(first?.textContent).toContain("item 2");
    expect(second?.textContent).toContain("Acme Lamp");
    expect(second?.querySelector("strong")?.textContent).toBe("active");
  });

  it("throws a ContractError when the registry lacks a reference", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <ColspecProvider registry={createTableRegistry()}>
          <ProductsTable />
        </ColspecProvider>,
      ),
    ).toThrow(ContractError);
  });
});
