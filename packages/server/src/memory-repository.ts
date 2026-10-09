import type {
  TableDefinitionRecord,
  TableDefinitionRepository,
} from "./repository";

/** A repository held in memory, for tests, examples and prototypes. */
export function createMemoryRepository(): TableDefinitionRepository {
  const records = new Map<string, TableDefinitionRecord>();
  const keyOf = (tableId: string, revision: number) =>
    JSON.stringify([tableId, revision]);
  const list = (tableId: string) =>
    [...records.values()]
      .filter((record) => record.tableId === tableId)
      .sort((a, b) => a.revision - b.revision);

  return {
    find: async (tableId, revision) => records.get(keyOf(tableId, revision)),
    findLatest: async (tableId, status) =>
      list(tableId).findLast((record) => record.status === status),
    list: async (tableId) => list(tableId),
    save: async (record) => {
      records.set(keyOf(record.tableId, record.revision), record);
    },
  };
}
