import {
  getDefinitionResponse,
  type TableDefinitionService,
} from '@colspec/server';
import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { TABLE_DEFINITIONS } from './table-definitions.provider.js';

/**
 * Authorization is deliberately absent from this example: a real application
 * must restrict who may save and publish definitions.
 */
@Controller('table-definitions')
export class TableDefinitionsController {
  constructor(
    @Inject(TABLE_DEFINITIONS)
    private readonly definitions: TableDefinitionService,
  ) {}

  /** The latest published contract, with ETag revalidation. */
  @Get(':tableId')
  async getPublished(
    @Param('tableId') tableId: string,
    @Headers('if-none-match') ifNoneMatch: string | undefined,
    @Res() response: Response,
  ) {
    const { status, headers, body } = await getDefinitionResponse(
      this.definitions,
      { tableId, ifNoneMatch },
    );
    response.status(status).set(headers);
    return body ? response.json(body) : response.end();
  }

  @Get(':tableId/revisions')
  async listRevisions(@Param('tableId') tableId: string) {
    const revisions = await this.definitions.listRevisions(tableId);
    return revisions.map(({ revision, status, updatedAt }) => ({
      revision,
      status,
      updatedAt,
    }));
  }

  @Post()
  async saveDraft(@Body() definition: unknown) {
    const { tableId, revision, status } =
      await this.definitions.saveDraft(definition);
    return { tableId, revision, status };
  }

  @Post(':tableId/revisions/:revision/publish')
  async publish(
    @Param('tableId') tableId: string,
    @Param('revision', ParseIntPipe) revision: number,
  ) {
    const record = await this.definitions.publish(tableId, revision);
    return { tableId, revision, status: record.status };
  }
}
