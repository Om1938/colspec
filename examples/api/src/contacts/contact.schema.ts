import { Schema } from 'mongoose';

export interface Contact {
  name: string;
  first: string;
  last: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export const CONTACT_MODEL = 'Contact';

export const contactSchema = new Schema<Contact>(
  {
    name: { type: String, required: true },
    first: { type: String, required: true },
    last: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], required: true },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false },
);
