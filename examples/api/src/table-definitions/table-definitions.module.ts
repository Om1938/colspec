import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TABLE_DEFINITION_MODEL,
  tableDefinitionSchema,
} from './table-definition.schema.js';
import { TableDefinitionsController } from './table-definitions.controller.js';
import {
  TABLE_DEFINITIONS,
  tableDefinitionsProvider,
} from './table-definitions.provider.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TABLE_DEFINITION_MODEL, schema: tableDefinitionSchema },
    ]),
  ],
  controllers: [TableDefinitionsController],
  providers: [tableDefinitionsProvider],
  exports: [TABLE_DEFINITIONS],
})
export class TableDefinitionsModule {}
