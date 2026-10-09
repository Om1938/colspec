import { tableContractSchema, type TableContract } from "./contract";
import { issuesToDiagnostics, toResult, type Result } from "./diagnostics";
import { contractRules, type ContractRule } from "./rules";
import {
  isSupportedSchemaVersion,
  SCHEMA_VERSION,
  type Migrate,
} from "./version";

export interface ValidateOptions {
  /** Upgrades definitions whose schema version this SDK does not support. */
  migrate?: Migrate;
  /** Application-specific checks run after the built-in ones. */
  rules?: ReadonlyArray<ContractRule>;
}

const versionOf = (input: unknown): unknown =>
  typeof input === "object" && input !== null && "schemaVersion" in input
    ? input.schemaVersion
    : undefined;

/** Validates untrusted JSON and returns a typed contract or diagnostics. */
export function validateContract(
  input: unknown,
  { migrate, rules = [] }: ValidateOptions = {},
): Result<TableContract> {
  let definition = input;
  if (!isSupportedSchemaVersion(versionOf(definition)) && migrate) {
    definition = migrate(definition, versionOf(definition));
  }

  const version = versionOf(definition);
  if (version !== undefined && !isSupportedSchemaVersion(version)) {
    return {
      ok: false,
      diagnostics: [
        {
          code: "unsupported-schema-version",
          severity: "error",
          path: ["schemaVersion"],
          message: `Schema version "${String(version)}" is not supported; this SDK supports ${SCHEMA_VERSION}.`,
        },
      ],
    };
  }

  const parsed = tableContractSchema.safeParse(definition);
  if (!parsed.success) {
    return {
      ok: false,
      diagnostics: issuesToDiagnostics(
        parsed.error.issues,
        "invalid-structure",
      ),
    };
  }

  const diagnostics = [...contractRules, ...rules].flatMap((rule) =>
    rule(parsed.data),
  );
  return toResult(parsed.data, diagnostics);
}
