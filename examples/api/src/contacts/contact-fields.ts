import type { QueryFilter } from 'mongoose';
import type { Contact } from './contact.schema.js';

/** How one approved operation key may be used in a MongoDB query. */
export interface ContactField {
  path: keyof Contact;
  /** Builds the filter from an untrusted value; absent if not filterable. */
  filter?: (value: unknown) => QueryFilter<Contact>;
}

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The only keys a client may sort or filter by. Each filter coerces its
 * value to a string, so operator objects such as `{ "$ne": null }` cannot
 * reach the database.
 */
export const CONTACT_FIELDS: Readonly<Record<string, ContactField>> = {
  name: {
    path: 'name',
    filter: (value) => ({
      name: { $regex: escapeRegExp(String(value)), $options: 'i' },
    }),
  },
  status: {
    path: 'status',
    filter: (value) => ({ status: String(value) as Contact['status'] }),
  },
  'contact.created_at': { path: 'createdAt' },
};
