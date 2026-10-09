/* eslint-disable @typescript-eslint/no-explicit-any -- TanStack types its own feature-agnostic functions with `any`; its feature generics are invariant. */
import {
  createRegistry,
  type Registry,
  type RegistryInput,
} from "@colspec/core";
import type {
  AccessorFn,
  AggregationFnDef,
  CellContext,
  FilterFn,
  HeaderContext,
  RowData,
  SortFn,
} from "@tanstack/table-core";

/** The function types each registry category holds for TanStack Table. */
export interface TableRegistryEntries<TData extends RowData = any> {
  sortFns: SortFn<any, TData>;
  filterFns: FilterFn<any, TData>;
  accessorFns: AccessorFn<TData>;
  cells: (context: CellContext<any, TData, any>) => unknown;
  /** Used for both `header` and `footer`. */
  headers: (context: HeaderContext<any, TData, any>) => unknown;
  formatters: (value: any) => unknown;
  actions: (row: TData) => unknown;
  aggregationFns: AggregationFnDef<any, TData, any, any>;
}

export type TableRegistry<TData extends RowData = any> = Registry<
  TableRegistryEntries<TData>
>;

/** `createRegistry` typed for TanStack Table functions over `TData` rows. */
export function createTableRegistry<TData extends RowData>(
  input: RegistryInput<TableRegistryEntries<TData>> = {},
): TableRegistry<TData> {
  return createRegistry(input);
}
