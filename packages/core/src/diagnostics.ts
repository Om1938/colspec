export type Severity = "error" | "warning";

export interface Diagnostic {
  code: string;
  severity: Severity;
  /** Location inside the contract, e.g. `["columns", 2, "sortFn"]`. */
  path: ReadonlyArray<string | number>;
  message: string;
}

export type Result<T> =
  | { ok: true; value: T; diagnostics: Diagnostic[] }
  | { ok: false; diagnostics: Diagnostic[] };

export function hasErrors(diagnostics: ReadonlyArray<Diagnostic>): boolean {
  return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}

/** Converts schema validation issues into error diagnostics under one code. */
export function issuesToDiagnostics(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
  code: string,
): Diagnostic[] {
  return issues.map(({ path, message }) => ({
    code,
    severity: "error",
    path: path.map((key) => (typeof key === "symbol" ? String(key) : key)),
    message,
  }));
}

/** A value is only usable when none of its diagnostics are errors. */
export function toResult<T>(value: T, diagnostics: Diagnostic[]): Result<T> {
  return hasErrors(diagnostics)
    ? { ok: false, diagnostics }
    : { ok: true, value, diagnostics };
}

/** Thrown where a failed `Result` cannot be returned to the caller. */
export class ContractError extends Error {
  readonly diagnostics: ReadonlyArray<Diagnostic>;

  constructor(diagnostics: ReadonlyArray<Diagnostic>) {
    super(
      diagnostics
        .map(
          ({ code, path, message }) =>
            `[${code}] ${path.join(".")}: ${message}`,
        )
        .join("\n"),
    );
    this.name = "ContractError";
    this.diagnostics = diagnostics;
  }
}
