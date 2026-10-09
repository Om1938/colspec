/* eslint-disable @typescript-eslint/no-explicit-any -- TanStack types its own feature-agnostic functions with `any`; its feature generics are invariant. */
import {
  toResult,
  type Diagnostic,
  type Result,
  type TableContract,
} from "@colspec/core";
import type { ColumnDef, RowData, TableFeatures } from "@tanstack/table-core";
import { hydrateColumns } from "./hydrate-columns";
import type { TableRegistry } from "./registry";
import { createResolver } from "./resolve";
import { toTableOptions, type ContractTableOptions } from "./table-options";

export interface HydratedContract<
  TFeatures extends TableFeatures,
  TData extends RowData,
> {
  columns: Array<ColumnDef<TFeatures, TData>>;
  options: ContractTableOptions;
}

// Keyed by identity, so results live exactly as long as their inputs.
const cache = new WeakMap<
  TableRegistry,
  WeakMap<TableContract, Result<unknown>>
>();

/**
 * Converts a validated contract into TanStack column definitions and table
 * options. The result is memoized per registry and contract object, so the
 * columns keep a stable identity between renders.
 */
export function hydrateContract<
  TFeatures extends TableFeatures = any,
  TData extends RowData = any,
>(
  contract: TableContract,
  registry: TableRegistry<TData>,
): Result<HydratedContract<TFeatures, TData>> {
  let byContract = cache.get(registry);
  if (!byContract) cache.set(registry, (byContract = new WeakMap()));

  let result = byContract.get(contract) as
    Result<HydratedContract<TFeatures, TData>> | undefined;
  if (!result) {
    const diagnostics: Diagnostic[] = [];
    const columns = hydrateColumns<TFeatures, TData>(
      contract.columns,
      createResolver(registry, diagnostics),
    );
    result = toResult(
      { columns, options: toTableOptions(contract) },
      diagnostics,
    );
    byContract.set(contract, result);
  }
  return result;
}
