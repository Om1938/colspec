/** Contract schema version written and understood by this SDK. */
export const SCHEMA_VERSION = "1.0";

const major = (version: string): string | undefined => version.split(".")[0];

/** Minor versions are compatible; a different major version is not. */
export function isSupportedSchemaVersion(version: unknown): boolean {
  return (
    typeof version === "string" && major(version) === major(SCHEMA_VERSION)
  );
}

/** Upgrades a definition written for an older schema to the current one. */
export type Migrate = (definition: unknown, fromVersion: unknown) => unknown;
