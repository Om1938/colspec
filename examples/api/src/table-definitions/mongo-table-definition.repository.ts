import type {
  DefinitionStatus,
  TableDefinitionRecord,
  TableDefinitionRepository,
} from '@colspec/server';
import type { Model } from 'mongoose';

const WITHOUT_ID = { _id: 0 } as const;

/** colspec's storage boundary, implemented over a Mongoose model. */
export class MongoTableDefinitionRepository implements TableDefinitionRepository {
  constructor(private readonly model: Model<TableDefinitionRecord>) {}

  async find(tableId: string, revision: number) {
    const record = await this.model
      .findOne({ tableId, revision }, WITHOUT_ID)
      .lean();
    return record ?? undefined;
  }

  async findLatest(tableId: string, status: DefinitionStatus) {
    const record = await this.model
      .findOne({ tableId, status }, WITHOUT_ID)
      .sort({ revision: -1 })
      .lean();
    return record ?? undefined;
  }

  list(tableId: string) {
    return this.model
      .find({ tableId }, WITHOUT_ID)
      .sort({ revision: 1 })
      .lean();
  }

  async save(record: TableDefinitionRecord) {
    const { tableId, revision } = record;
    await this.model.replaceOne({ tableId, revision }, record, {
      upsert: true,
    });
  }
}
