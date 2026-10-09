import type { QueryFilter } from 'mongoose';
import type { Product } from './product.schema.js';

/** How one approved operation key may be used in a MongoDB query. */
export interface ProductField {
  path: keyof Product;
  /** Builds the filter from an untrusted value; absent if not filterable. */
  filter?: (value: unknown) => QueryFilter<Product>;
}

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The only keys a client may sort or filter by. Each filter coerces its
 * value to a string, so operator objects such as `{ "$ne": null }` cannot
 * reach the database.
 */
export const PRODUCT_FIELDS: Readonly<Record<string, ProductField>> = {
  name: {
    path: 'name',
    filter: (value) => ({
      name: { $regex: escapeRegExp(String(value)), $options: 'i' },
    }),
  },
  status: {
    path: 'status',
    filter: (value) => ({ status: String(value) as Product['status'] }),
  },
  'product.created_at': { path: 'createdAt' },
};
