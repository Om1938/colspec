import type { TableDefinitionRecord } from '@colspec/server';
import { Schema } from 'mongoose';

export const TABLE_DEFINITION_MODEL = 'TableDefinition';

/** One document per revision; the contract itself is stored as-is. */
export const tableDefinitionSchema = new Schema<TableDefinitionRecord>(
  {
    tableId: { type: String, required: true },
    revision: { type: Number, required: true },
    schemaVersion: { type: String, required: true },
    definition: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['draft', 'published'], required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { versionKey: false, minimize: false },
);

tableDefinitionSchema.index({ tableId: 1, revision: 1 }, { unique: true });
