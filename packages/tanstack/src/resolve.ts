import {
  isRef,
  type Diagnostic,
  type Ref,
  type RegistryCategory,
} from "@colspec/core";
import { aggregationFns, filterFns, sortFns } from "@tanstack/table-core";
import type { TableRegistry, TableRegistryEntries } from "./registry";

/** Functions TanStack ships, addressable from a contract by plain name. */
const BUILTINS: Partial<Record<RegistryCategory, Record<string, unknown>>> = {
  sortFns,
  filterFns,
  aggregationFns,
};

/** Lets TanStack pick a function from the column's data. */
const AUTO = "auto";

type Path = Diagnostic["path"];
type Entry<C extends RegistryCategory> = TableRegistryEntries[C];

/**
 * Looks names up in the registry or TanStack's built-ins. A name that cannot
 * be found is reported and never replaced with another function.
 */
export function createResolver(
  registry: TableRegistry,
  diagnostics: Diagnostic[],
) {
  function lookup<C extends RegistryCategory>(
    source: Record<string, unknown>,
    category: C,
    name: string,
    path: Path,
    code: string,
  ): Entry<C> | undefined {
    if (Object.hasOwn(source, name)) return source[name] as Entry<C>;
    diagnostics.push({
      code,
      severity: "error",
      path,
      message: `"${name}" was not found in ${category}.`,
    });
    return undefined;
  }

  /** Resolves a reference to an application-registered function. */
  function ref<C extends RegistryCategory>(
    category: C,
    value: Ref | undefined,
    path: Path,
  ): Entry<C> | undefined {
    return (
      value &&
      lookup(registry[category], category, value.ref, path, "missing-reference")
    );
  }

  /** Resolves a built-in name, `"auto"`, or a reference. */
  function named<C extends RegistryCategory>(
    category: C,
    value: string | Ref | undefined,
    path: Path,
  ): Entry<C> | typeof AUTO | undefined {
    if (value === undefined || value === AUTO) return value;
    if (isRef(value)) return ref(category, value, path);
    return lookup(
      BUILTINS[category] ?? {},
      category,
      value,
      path,
      "unknown-builtin",
    );
  }

  /** Resolves a renderer reference, passing literal text through. */
  function template<C extends RegistryCategory>(
    category: C,
    value: string | Ref | undefined,
    path: Path,
  ): Entry<C> | string | undefined {
    return typeof value === "string" ? value : ref(category, value, path);
  }

  return { ref, named, template };
}

export type Resolver = ReturnType<typeof createResolver>;
