import type { TableContract } from "@colspec/core";

export type DefinitionStatus = "draft" | "published";

/** One stored revision of a table definition; unique by `(tableId, revision)`. */
export interface TableDefinitionRecord {
  tableId: string;
  revision: number;
  schemaVersion: string;
  definition: TableContract;
  status: DefinitionStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * The storage boundary. Implement it over any database: one row or document
 * per revision, with the contract kept as JSON.
 */
export interface TableDefinitionRepository {
  find(
    tableId: string,
    revision: number,
  ): Promise<TableDefinitionRecord | undefined>;
  /** The highest revision with the given status. */
  findLatest(
    tableId: string,
    status: DefinitionStatus,
  ): Promise<TableDefinitionRecord | undefined>;
  /** Every revision of a table, oldest first. */
  list(tableId: string): Promise<TableDefinitionRecord[]>;
  /** Inserts the record, or replaces the one with the same `(tableId, revision)`. */
  save(record: TableDefinitionRecord): Promise<void>;
}
