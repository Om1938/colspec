import { Schema } from 'mongoose';

export interface Product {
  name: string;
  brand: string;
  model: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export const PRODUCT_MODEL = 'Product';

export const productSchema = new Schema<Product>(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], required: true },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false },
);
