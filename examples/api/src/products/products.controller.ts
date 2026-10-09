import { ContractError } from '@colspec/core';
import { resolveServerQuery } from '@colspec/server';
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { PRODUCT_FIELDS } from './product-fields.js';
import { ProductsService } from './products.service.js';

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new BadRequestException('The query parameter must be JSON.');
  }
}

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  /** `query` is the JSON produced by colspec's `toServerQuery` on the client. */
  @Get()
  find(@Query('query') query = '{}') {
    const resolved = resolveServerQuery(parseJson(query), PRODUCT_FIELDS);
    if (!resolved.ok) throw new ContractError(resolved.diagnostics);
    return this.products.find(resolved.value);
  }
}
