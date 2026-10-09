import { ContractError, type TableContract } from "@colspec/core";
import { defaultFeatures, type DefaultFeatures } from "@colspec/tanstack";
import {
  useTable,
  type ReactTable,
  type RowData,
  type TableFeatures,
  type TableOptions,
} from "@tanstack/react-table";
import { useHydratedContract } from "./use-hydrated-contract";

export type ContractTableOptions<
  TFeatures extends TableFeatures,
  TData extends RowData,
> = Omit<TableOptions<TFeatures, TData>, "columns" | "features"> & {
  contract: TableContract;
  /** Defaults to `defaultFeatures` from `@colspec/tanstack`. */
  features?: TFeatures;
};

/**
 * Creates a TanStack table whose columns, initial state and manual modes come
 * from a contract. Any other table option can be passed and takes precedence.
 *
 * Throws a `ContractError` when the contract references something the
 * registry lacks; use `useHydratedContract` to handle that without throwing.
 */
export function useContractTable<
  TData extends RowData,
  TFeatures extends TableFeatures = DefaultFeatures,
>({
  contract,
  features = defaultFeatures as TableFeatures as TFeatures,
  initialState,
  ...tableOptions
}: ContractTableOptions<TFeatures, TData>): ReactTable<TFeatures, TData> {
  const hydrated = useHydratedContract<TFeatures, TData>(contract);
  if (!hydrated.ok) throw new ContractError(hydrated.diagnostics);

  const { columns, options } = hydrated.value;
  // TanStack derives its option types from TFeatures, which is open here, so
  // the merged options are assembled untyped and asserted once.
  const merged: object = {
    ...options,
    ...tableOptions,
    initialState: { ...options.initialState, ...initialState },
    features,
    columns,
  };
  return useTable(merged as TableOptions<TFeatures, TData>);
}
