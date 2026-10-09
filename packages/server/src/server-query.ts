import {
  issuesToDiagnostics,
  serverQuerySchema,
  toResult,
  type Diagnostic,
  type Result,
  type ServerQuery,
} from "@colspec/core";

/** A client's query with every key replaced by its approved backend field. */
export interface ResolvedQuery<TField> {
  sort: Array<{ field: TField; desc: boolean }>;
  filters: Array<{ field: TField; value: unknown }>;
  page?: ServerQuery["page"];
}

/**
 * Validates an untrusted query and maps its operation keys to fields the
 * backend has approved. Keys are looked up, never interpolated, so an
 * unlisted key is rejected rather than reaching a query.
 */
export function resolveServerQuery<TField>(
  input: unknown,
  fields: Readonly<Record<string, TField>>,
): Result<ResolvedQuery<TField>> {
  const parsed = serverQuerySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      diagnostics: issuesToDiagnostics(parsed.error.issues, "invalid-query"),
    };
  }
  const query = parsed.data;
  const diagnostics: Diagnostic[] = [];

  const resolve = <T extends { key: string }>(
    entries: T[] | undefined,
    section: string,
  ) =>
    (entries ?? []).flatMap(({ key, ...rest }, index) => {
      if (Object.hasOwn(fields, key))
        return [{ field: fields[key] as TField, ...rest }];
      diagnostics.push({
        code: "unapproved-key",
        severity: "error",
        path: [section, index, "key"],
        message: `"${key}" is not an approved ${section} key.`,
      });
      return [];
    });

  const resolved: ResolvedQuery<TField> = {
    sort: resolve(query.sort, "sort"),
    filters: resolve(query.filters, "filters"),
    page: query.page,
  };
  return toResult(resolved, diagnostics);
}
