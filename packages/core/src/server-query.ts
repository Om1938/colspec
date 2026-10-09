import { z } from "zod";
import { getMode, type ContractColumn, type TableContract } from "./contract";

/** The slices of table state that server-side operations depend on. */
export interface QueryState {
  sorting?: ReadonlyArray<{ id: string; desc: boolean }>;
  columnFilters?: ReadonlyArray<{ id: string; value: unknown }>;
  pagination?: { pageIndex: number; pageSize: number };
}

/** What the data API receives: operation keys instead of column ids. */
export const serverQuerySchema = z.strictObject({
  sort: z
    .array(z.strictObject({ key: z.string(), desc: z.boolean() }))
    .optional(),
  filters: z
    .array(z.strictObject({ key: z.string(), value: z.unknown() }))
    .optional(),
  page: z
    .strictObject({
      index: z.number().int().nonnegative(),
      size: z.number().int().positive(),
    })
    .optional(),
});

export type ServerQuery = z.infer<typeof serverQuerySchema>;

type ServerKey = keyof NonNullable<ContractColumn["server"]>;

/**
 * Translates table state into a query for the operations the contract runs on
 * the server. Entries for columns the contract does not define are dropped.
 */
export function toServerQuery(
  contract: TableContract,
  state: QueryState,
): ServerQuery {
  const mode = getMode(contract);
  const columns = new Map(
    contract.columns.map((column) => [column.id, column]),
  );

  const withKeys = <T extends { id: string }>(
    entries: ReadonlyArray<T>,
    serverKey: ServerKey,
  ) =>
    entries.flatMap(({ id, ...rest }) => {
      const column = columns.get(id);
      return column ? [{ key: column.server?.[serverKey] ?? id, ...rest }] : [];
    });

  const query: ServerQuery = {};
  if (mode.sorting === "server" && state.sorting) {
    query.sort = withKeys(state.sorting, "sortKey");
  }
  if (mode.filtering === "server" && state.columnFilters) {
    query.filters = withKeys(state.columnFilters, "filterKey");
  }
  if (mode.pagination === "server" && state.pagination) {
    query.page = {
      index: state.pagination.pageIndex,
      size: state.pagination.pageSize,
    };
  }
  return query;
}
