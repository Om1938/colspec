import {
  createTableDefinitionService,
  type TableDefinitionRecord,
} from '@colspec/server';
import type { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { MongoTableDefinitionRepository } from './mongo-table-definition.repository.js';
import { TABLE_DEFINITION_MODEL } from './table-definition.schema.js';

/** Injection token for colspec's `TableDefinitionService`. */
export const TABLE_DEFINITIONS = Symbol('TABLE_DEFINITIONS');

export const tableDefinitionsProvider: Provider = {
  provide: TABLE_DEFINITIONS,
  inject: [getModelToken(TABLE_DEFINITION_MODEL)],
  useFactory: (model: Model<TableDefinitionRecord>) =>
    createTableDefinitionService(new MongoTableDefinitionRepository(model)),
};
