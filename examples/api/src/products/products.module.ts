import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TableDefinitionsModule } from '../table-definitions/table-definitions.module.js';
import { PRODUCT_MODEL, productSchema } from './product.schema.js';
import { ProductsController } from './products.controller.js';
import { ProductsSeeder } from './products.seeder.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PRODUCT_MODEL, schema: productSchema }]),
    TableDefinitionsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsSeeder],
})
export class ProductsModule {}
