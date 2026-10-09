// @vitest-environment jsdom
import {
  ContractError,
  validateContract,
  type TableContract,
} from "@colspec/core";
import { createTableRegistry } from "@colspec/tanstack";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { contactsContract } from "../../core/test/fixtures";
import { ColspecProvider, useContractTable } from "../src";

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

const registry = createTableRegistry<Contact>({
  accessorFns: { "crm.fullName": (row) => `${row.first} ${row.last}` },
  cells: {
    "crm.statusBadge": ({ getValue }) => <strong>{String(getValue())}</strong>,
  },
});

const parsed = validateContract(contactsContract);
if (!parsed.ok) throw new Error("fixture is invalid");
const contract: TableContract = parsed.value;

function ContactsTable() {
  const table = useContractTable<Contact>({ contract, data });
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
        <ContactsTable />
      </ColspecProvider>,
    );

    expect(
      screen.getAllByRole("columnheader").map((th) => th.textContent),
    ).toEqual(["Contact Name", "Status", "Full Name", "createdAt"]);
    const [first, second] = screen.getAllByRole("row").slice(1);
    expect(first?.textContent).toContain("item 2");
    expect(second?.textContent).toContain("Ada Lovelace");
    expect(second?.querySelector("strong")?.textContent).toBe("active");
  });

  it("throws a ContractError when the registry lacks a reference", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <ColspecProvider registry={createTableRegistry()}>
          <ContactsTable />
        </ColspecProvider>,
      ),
    ).toThrow(ContractError);
  });
});
