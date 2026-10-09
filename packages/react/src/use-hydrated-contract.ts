/* eslint-disable @typescript-eslint/no-explicit-any -- TanStack types its own feature-agnostic functions with `any`; its feature generics are invariant. */
import type { Result, TableContract } from "@colspec/core";
import { hydrateContract, type HydratedContract } from "@colspec/tanstack";
import type { RowData, TableFeatures } from "@tanstack/react-table";
import { useRegistry } from "./registry-context";

/**
 * Hydrates a validated contract with the registry from `<ColspecProvider>`.
 * Returns diagnostics instead of throwing, so callers can render a fallback.
 */
export function useHydratedContract<
  TFeatures extends TableFeatures = any,
  TData extends RowData = any,
>(contract: TableContract): Result<HydratedContract<TFeatures, TData>> {
  // hydrateContract memoizes by contract and registry identity.
  return hydrateContract<TFeatures, TData>(contract, useRegistry());
}
