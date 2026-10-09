import type { TableDefinitionService } from '@colspec/server';
import {
  Inject,
  Injectable,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { TABLE_DEFINITIONS } from '../table-definitions/table-definitions.provider.js';
import { CONTACT_MODEL, type Contact } from './contact.schema.js';
import { CONTACTS_TABLE_ID, contactsContract } from './contacts.contract.js';

const FIRST = [
  'Ada',
  'Alan',
  'Grace',
  'Linus',
  'Margaret',
  'Dennis',
  'Barbara',
];
const LAST = ['Lovelace', 'Turing', 'Hopper', 'Torvalds', 'Hamilton'];
const DAY = 24 * 60 * 60 * 1000;

/** 35 deterministic contacts, so the example and its tests see the same data. */
const sampleContacts: Contact[] = FIRST.flatMap((first, i) =>
  LAST.map((last, j) => {
    const n = i * LAST.length + j;
    return {
      name: `${last}, ${first}`,
      first,
      last,
      status: n % 3 === 0 ? 'inactive' : 'active',
      createdAt: new Date(Date.UTC(2026, 0, 1) + n * DAY),
    };
  }),
);

/** Fills an empty database with sample data and a published contract. */
@Injectable()
export class ContactsSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectModel(CONTACT_MODEL) private readonly contacts: Model<Contact>,
    @Inject(TABLE_DEFINITIONS)
    private readonly definitions: TableDefinitionService,
  ) {}

  async onApplicationBootstrap() {
    if ((await this.contacts.estimatedDocumentCount()) === 0) {
      await this.contacts.insertMany(sampleContacts);
    }
    if (!(await this.definitions.getPublished(CONTACTS_TABLE_ID))) {
      const { revision } = await this.definitions.saveDraft(contactsContract);
      await this.definitions.publish(CONTACTS_TABLE_ID, revision);
    }
  }
}
