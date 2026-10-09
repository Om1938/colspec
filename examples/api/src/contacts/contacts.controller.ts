import { ContractError } from '@colspec/core';
import { resolveServerQuery } from '@colspec/server';
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { CONTACT_FIELDS } from './contact-fields.js';
import { ContactsService } from './contacts.service.js';

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new BadRequestException('The query parameter must be JSON.');
  }
}

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contacts: ContactsService) {}

  /** `query` is the JSON produced by colspec's `toServerQuery` on the client. */
  @Get()
  find(@Query('query') query = '{}') {
    const resolved = resolveServerQuery(parseJson(query), CONTACT_FIELDS);
    if (!resolved.ok) throw new ContractError(resolved.diagnostics);
    return this.contacts.find(resolved.value);
  }
}
