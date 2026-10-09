import type { TableRegistry } from "@colspec/tanstack";
import { createContext, useContext, type ReactNode } from "react";

const RegistryContext = createContext<TableRegistry | undefined>(undefined);

export interface ColspecProviderProps {
  /** Create this once at application start-up; its identity keys the hydration cache. */
  registry: TableRegistry;
  children: ReactNode;
}

/** Makes the application's registry available to every contract-driven table. */
export function ColspecProvider({ registry, children }: ColspecProviderProps) {
  return <RegistryContext value={registry}>{children}</RegistryContext>;
}

export function useRegistry(): TableRegistry {
  const registry = useContext(RegistryContext);
  if (!registry)
    throw new Error("useRegistry must be used inside a <ColspecProvider>.");
  return registry;
}
