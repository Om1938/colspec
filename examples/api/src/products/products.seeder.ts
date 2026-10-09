import type { TableDefinitionService } from '@colspec/server';
import {
  Inject,
  Injectable,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { TABLE_DEFINITIONS } from '../table-definitions/table-definitions.provider.js';
import { PRODUCT_MODEL, type Product } from './product.schema.js';
import { PRODUCTS_TABLE_ID, productsContract } from './products.contract.js';

const BRANDS = ['Acme', 'Apex', 'Gala', 'Lumo', 'Maxa', 'Dyna', 'Bolt'];
const MODELS = ['Lamp', 'Torch', 'Heater', 'Toaster', 'Fan'];
const DAY = 24 * 60 * 60 * 1000;

/** 35 deterministic products, so the example and its tests see the same data. */
const sampleProducts: Product[] = BRANDS.flatMap((brand, i) =>
  MODELS.map((model, j) => {
    const n = i * MODELS.length + j;
    return {
      name: `${model}, ${brand}`,
      brand,
      model,
      status: n % 3 === 0 ? 'inactive' : 'active',
      createdAt: new Date(Date.UTC(2026, 0, 1) + n * DAY),
    };
  }),
);

/** Fills an empty database with sample data and a published contract. */
@Injectable()
export class ProductsSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectModel(PRODUCT_MODEL) private readonly products: Model<Product>,
    @Inject(TABLE_DEFINITIONS)
    private readonly definitions: TableDefinitionService,
  ) {}

  async onApplicationBootstrap() {
    if ((await this.products.estimatedDocumentCount()) === 0) {
      await this.products.insertMany(sampleProducts);
    }
    if (!(await this.definitions.getPublished(PRODUCTS_TABLE_ID))) {
      const { revision } = await this.definitions.saveDraft(productsContract);
      await this.definitions.publish(PRODUCTS_TABLE_ID, revision);
    }
  }
}
