import type { ContractColumn } from "@colspec/core";
import type { ColumnDef, RowData, TableFeatures } from "@tanstack/table-core";
import type { Resolver } from "./resolve";

/** Drops unset keys so they cannot shadow TanStack's column defaults. */
function defined<T extends Record<string, unknown>>(values: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function hydrateColumn(
  column: ContractColumn,
  index: number,
  resolve: Resolver,
) {
  const {
    accessorFn,
    header,
    footer,
    cell,
    formatter,
    actions,
    sortFn,
    filterFn,
    aggregationFn,
    meta,
    // Server keys are for the data API, not the table instance.
    server: _server,
    ...serializable
  } = column;
  const at = (key: keyof ContractColumn, ...rest: Array<string | number>) => [
    "columns",
    index,
    key,
    ...rest,
  ];

  const format = resolve.ref("formatters", formatter, at("formatter"));
  const handlers = actions?.map((action, actionIndex) => [
    action.ref,
    resolve.ref("actions", action, at("actions", actionIndex)),
  ]);

  return {
    ...serializable,
    ...defined({
      accessorFn: resolve.ref("accessorFns", accessorFn, at("accessorFn")),
      header: resolve.template("headers", header, at("header")),
      footer: resolve.template("headers", footer, at("footer")),
      cell:
        resolve.ref("cells", cell, at("cell")) ??
        (format &&
          ((context: { getValue: () => unknown }) =>
            format(context.getValue()))),
      sortFn: resolve.named("sortFns", sortFn, at("sortFn")),
      filterFn: resolve.named("filterFns", filterFn, at("filterFn")),
      aggregationFn: resolve.named(
        "aggregationFns",
        aggregationFn,
        at("aggregationFn"),
      ),
      meta:
        meta || handlers
          ? {
              ...meta,
              ...(handlers && { actions: Object.fromEntries(handlers) }),
            }
          : undefined,
    }),
  };
}

/** Converts contract columns into native TanStack column definitions. */
export function hydrateColumns<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  columns: ReadonlyArray<ContractColumn>,
  resolve: Resolver,
): Array<ColumnDef<TFeatures, TData>> {
  return columns.map(
    (column, index) =>
      hydrateColumn(column, index, resolve) as ColumnDef<TFeatures, TData>,
  );
}
