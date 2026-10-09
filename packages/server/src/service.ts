import {
  ContractError,
  validateContract,
  type Result,
  type TableContract,
  type ValidateOptions,
} from "@colspec/core";
import type {
  TableDefinitionRecord,
  TableDefinitionRepository,
} from "./repository";

export class DefinitionNotFoundError extends Error {
  constructor(tableId: string, revision?: number) {
    super(
      `No definition found for "${tableId}"${revision ? ` revision ${revision}` : ""}.`,
    );
    this.name = "DefinitionNotFoundError";
  }
}

export class RevisionPublishedError extends Error {
  constructor(tableId: string, revision: number) {
    super(
      `Revision ${revision} of "${tableId}" is published and can no longer change.`,
    );
    this.name = "RevisionPublishedError";
  }
}

export interface ServiceOptions {
  /** Passed to `validateContract` for every definition the service handles. */
  validation?: ValidateOptions;
  now?: () => Date;
}

export interface TableDefinitionService {
  validate(input: unknown): Result<TableContract>;
  /** Stores a draft. Throws `ContractError` if invalid, `RevisionPublishedError` if published. */
  saveDraft(input: unknown): Promise<TableDefinitionRecord>;
  /** Makes a draft visible to consumers and freezes it. Publishing twice is a no-op. */
  publish(tableId: string, revision: number): Promise<TableDefinitionRecord>;
  /** The latest published revision, or a specific one. Drafts are never returned. */
  getPublished(
    tableId: string,
    revision?: number,
  ): Promise<TableDefinitionRecord | undefined>;
  listRevisions(tableId: string): Promise<TableDefinitionRecord[]>;
}

/** The definition lifecycle on top of any storage implementation. */
export function createTableDefinitionService(
  repository: TableDefinitionRepository,
  { validation, now = () => new Date() }: ServiceOptions = {},
): TableDefinitionService {
  const validate = (input: unknown) => validateContract(input, validation);

  return {
    validate,

    async saveDraft(input) {
      const result = validate(input);
      if (!result.ok) throw new ContractError(result.diagnostics);

      const definition = result.value;
      const { tableId, revision, schemaVersion } = definition;
      const existing = await repository.find(tableId, revision);
      if (existing?.status === "published")
        throw new RevisionPublishedError(tableId, revision);

      const timestamp = now();
      const record: TableDefinitionRecord = {
        tableId,
        revision,
        schemaVersion,
        definition,
        status: "draft",
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      };
      await repository.save(record);
      return record;
    },

    async publish(tableId, revision) {
      const record = await repository.find(tableId, revision);
      if (!record) throw new DefinitionNotFoundError(tableId, revision);
      if (record.status === "published") return record;

      const published: TableDefinitionRecord = {
        ...record,
        status: "published",
        updatedAt: now(),
      };
      await repository.save(published);
      return published;
    },

    async getPublished(tableId, revision) {
      if (revision === undefined)
        return repository.findLatest(tableId, "published");
      const record = await repository.find(tableId, revision);
      return record?.status === "published" ? record : undefined;
    },

    listRevisions: (tableId) => repository.list(tableId),
  };
}
