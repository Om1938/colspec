import {
  getMode,
  type ContractDefaults,
  type TableContract,
} from "@colspec/core";

/** Table options a contract controls besides its columns. */
export interface ContractTableOptions {
  initialState: ContractDefaults;
  manualSorting: boolean;
  manualFiltering: boolean;
  manualPagination: boolean;
}

/** Maps contract defaults and execution modes onto TanStack table options. */
export function toTableOptions(contract: TableContract): ContractTableOptions {
  const mode = getMode(contract);
  return {
    initialState: contract.defaults ?? {},
    manualSorting: mode.sorting === "server",
    manualFiltering: mode.filtering === "server",
    manualPagination: mode.pagination === "server",
  };
}
