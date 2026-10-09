export const REGISTRY_CATEGORIES = [
  "sortFns",
  "filterFns",
  "accessorFns",
  "cells",
  "headers",
  "formatters",
  "actions",
  "aggregationFns",
] as const;

export type RegistryCategory = (typeof REGISTRY_CATEGORIES)[number];

type EntryTypes = Record<RegistryCategory, unknown>;

/**
 * Named functions an application makes available to contracts. Adapters fix
 * `TEntries` to the function types their table engine expects.
 */
export type Registry<TEntries extends EntryTypes = EntryTypes> = {
  readonly [K in RegistryCategory]: Readonly<Record<string, TEntries[K]>>;
};

export type RegistryInput<TEntries extends EntryTypes = EntryTypes> = Partial<
  Registry<TEntries>
>;

export class RegistryCollisionError extends Error {
  constructor(category: RegistryCategory, name: string) {
    super(`"${name}" is registered more than once in ${category}.`);
    this.name = "RegistryCollisionError";
  }
}

export interface ComposeOptions {
  /** `error` (default) rejects duplicate names; `override` lets later registries win. */
  onCollision?: "error" | "override";
}

/** Merges registries contributed by separate application modules. */
export function composeRegistries<TEntries extends EntryTypes = EntryTypes>(
  registries: ReadonlyArray<RegistryInput<TEntries>>,
  { onCollision = "error" }: ComposeOptions = {},
): Registry<TEntries> {
  const composed = Object.fromEntries(
    REGISTRY_CATEGORIES.map((category) => {
      const entries: Record<string, unknown> = {};
      for (const registry of registries) {
        for (const [name, entry] of Object.entries(registry[category] ?? {})) {
          if (onCollision === "error" && Object.hasOwn(entries, name)) {
            throw new RegistryCollisionError(category, name);
          }
          entries[name] = entry;
        }
      }
      return [category, Object.freeze(entries)];
    }),
  );
  return Object.freeze(composed) as Registry<TEntries>;
}

/** Creates a complete, immutable registry from the categories provided. */
export function createRegistry<TEntries extends EntryTypes = EntryTypes>(
  input: RegistryInput<TEntries> = {},
): Registry<TEntries> {
  return composeRegistries([input]);
}
