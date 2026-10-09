import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TableDefinitionsModule } from '../table-definitions/table-definitions.module.js';
import { CONTACT_MODEL, contactSchema } from './contact.schema.js';
import { ContactsController } from './contacts.controller.js';
import { ContactsSeeder } from './contacts.seeder.js';
import { ContactsService } from './contacts.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CONTACT_MODEL, schema: contactSchema }]),
    TableDefinitionsModule,
  ],
  controllers: [ContactsController],
  providers: [ContactsService, ContactsSeeder],
})
export class ContactsModule {}
