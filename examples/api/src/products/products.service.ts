import type { ResolvedQuery } from '@colspec/server';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { ProductField } from './product-fields.js';
import { PRODUCT_MODEL, type Product } from './product.schema.js';

const DEFAULT_PAGE = { index: 0, size: 10 };
const MAX_PAGE_SIZE = 100;

export interface ProductPage {
  rows: Product[];
  total: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(PRODUCT_MODEL) private readonly products: Model<Product>,
  ) {}

  /** Filtering, sorting and pagination all run in MongoDB, in that order. */
  async find(query: ResolvedQuery<ProductField>): Promise<ProductPage> {
    const filter = {
      $and: query.filters.map(
        ({ field, value }) => field.filter?.(value) ?? {},
      ),
    };
    const where = filter.$and.length > 0 ? filter : {};
    const sort = query.sort.map(
      ({ field, desc }) => [field.path, desc ? -1 : 1] as [string, 1 | -1],
    );
    const { index, size } = query.page ?? DEFAULT_PAGE;
    const limit = Math.min(size, MAX_PAGE_SIZE);

    const [rows, total] = await Promise.all([
      this.products
        .find(where, { _id: 0 })
        // A stable tiebreaker keeps pages from overlapping.
        .sort([...sort, ['_id', 1]])
        .skip(index * limit)
        .limit(limit)
        .lean(),
      this.products.countDocuments(where),
    ]);
    return { rows, total };
  }
}
