import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactsModule } from './contacts/contacts.module.js';
import { TableDefinitionsModule } from './table-definitions/table-definitions.module.js';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.MONGODB_URI ??
          'mongodb://localhost:27017/colspec_example',
      }),
    }),
    TableDefinitionsModule,
    ContactsModule,
  ],
})
export class AppModule {}
