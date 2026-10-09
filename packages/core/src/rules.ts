import { getMode, type TableContract } from "./contract";
import type { Diagnostic } from "./diagnostics";

/** A semantic check that the JSON structure alone cannot express. */
export type ContractRule = (contract: TableContract) => Diagnostic[];

const uniqueColumnIds: ContractRule = ({ columns }) => {
  const seen = new Set<string>();
  return columns.flatMap(({ id }, index) => {
    if (!seen.has(id)) {
      seen.add(id);
      return [];
    }
    return [
      {
        code: "duplicate-column-id",
        severity: "error",
        path: ["columns", index, "id"],
        message: `Column id "${id}" is used more than once.`,
      },
    ];
  });
};

const singleAccessor: ContractRule = ({ columns }) =>
  columns.flatMap((column, index) =>
    column.accessorKey !== undefined && column.accessorFn !== undefined
      ? [
          {
            code: "conflicting-accessors",
            severity: "error",
            path: ["columns", index],
            message: `Column "${column.id}" sets both accessorKey and accessorFn.`,
          },
        ]
      : [],
  );

const defaultsReferenceColumns: ContractRule = ({ columns, defaults = {} }) => {
  const ids = new Set(columns.map((column) => column.id));
  const referenced: Array<[path: Diagnostic["path"], id: string]> = [
    ...(defaults.sorting ?? []).map(
      ({ id }, index): [Diagnostic["path"], string] => [
        ["defaults", "sorting", index],
        id,
      ],
    ),
    ...(defaults.columnFilters ?? []).map(
      ({ id }, index): [Diagnostic["path"], string] => [
        ["defaults", "columnFilters", index],
        id,
      ],
    ),
    ...Object.keys(defaults.columnVisibility ?? {}).map(
      (id): [Diagnostic["path"], string] => [
        ["defaults", "columnVisibility", id],
        id,
      ],
    ),
  ];
  return referenced
    .filter(([, id]) => !ids.has(id))
    .map(([path, id]) => ({
      code: "unknown-column",
      severity: "error",
      path,
      message: `Defaults reference column "${id}", which is not defined.`,
    }));
};

/**
 * Sorting, filtering and pagination must run over the same dataset: once the
 * server paginates, the browser only holds one page to sort or filter.
 */
const compatibleModes: ContractRule = (contract) => {
  const mode = getMode(contract);
  if (mode.pagination !== "server") return [];
  return (["sorting", "filtering"] as const)
    .filter((operation) => mode[operation] === "client")
    .map((operation) => ({
      code: "mode-mismatch",
      severity: "warning",
      path: ["mode", operation],
      message: `Client-side ${operation} with server-side pagination only applies to the current page.`,
    }));
};

export const contractRules: ReadonlyArray<ContractRule> = [
  uniqueColumnIds,
  singleAccessor,
  defaultsReferenceColumns,
  compatibleModes,
];
