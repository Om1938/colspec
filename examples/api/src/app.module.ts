import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products/products.module.js';
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
    ProductsModule,
  ],
})
export class AppModule {}
