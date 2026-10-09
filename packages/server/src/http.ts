import type { TableContract } from "@colspec/core";
import type { TableDefinitionRecord } from "./repository";
import type { TableDefinitionService } from "./service";

/** Published revisions never change, so identity plus revision is a strong validator. */
export function etagFor({
  tableId,
  revision,
}: Pick<TableDefinitionRecord, "tableId" | "revision">) {
  return `"${encodeURIComponent(tableId)}@${revision}"`;
}

/** A response any HTTP framework can send: status, headers and a JSON body. */
export interface DefinitionResponse {
  status: 200 | 304 | 404;
  headers: Record<string, string>;
  body?: TableContract | { error: string };
}

export interface DefinitionRequest {
  tableId: string;
  revision?: number;
  /** The request's `If-None-Match` header, if any. */
  ifNoneMatch?: string | null;
}

/**
 * Answers a contract retrieval request, including conditional requests, so
 * clients revalidate with a 304 instead of downloading an unchanged contract.
 */
export async function getDefinitionResponse(
  service: TableDefinitionService,
  { tableId, revision, ifNoneMatch }: DefinitionRequest,
): Promise<DefinitionResponse> {
  const record = await service.getPublished(tableId, revision);
  if (!record) {
    return {
      status: 404,
      headers: {},
      body: { error: `No published definition for "${tableId}".` },
    };
  }

  const etag = etagFor(record);
  const headers = { ETag: etag, "Cache-Control": "no-cache" };
  const cached = ifNoneMatch
    ?.split(",")
    .some((candidate) => candidate.trim() === etag);
  return cached
    ? { status: 304, headers }
    : { status: 200, headers, body: record.definition };
}
