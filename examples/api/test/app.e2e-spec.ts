import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import mongoose from 'mongoose';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { contactsContract } from '../src/contacts/contacts.contract.js';

// A database of its own, emptied before the run; needs `docker compose up -d`.
const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/colspec_example_test';

describe('example API (e2e)', () => {
  let app: INestApplication<App>;
  const http = () => request(app.getHttpServer());
  const contacts = (query: unknown) =>
    http()
      .get('/api/contacts')
      .query({ query: JSON.stringify(query) });

  beforeAll(async () => {
    process.env.MONGODB_URI = MONGODB_URI;
    const connection = await mongoose.createConnection(MONGODB_URI).asPromise();
    await connection.dropDatabase();
    await connection.close();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = configureApp(
      moduleRef.createNestApplication<INestApplication<App>>(),
    );
    await app.init();
  });

  afterAll(() => app.close());

  describe('table definitions', () => {
    it('serves the seeded contract from MongoDB with an ETag', async () => {
      const response = await http()
        .get('/api/table-definitions/crm.contacts')
        .expect(200);
      expect(response.body).toMatchObject({
        tableId: 'crm.contacts',
        revision: 1,
        mode: { pagination: 'server' },
      });
      expect(response.body.columns).toHaveLength(4);
      expect(response.body).not.toHaveProperty('_id');

      await http()
        .get('/api/table-definitions/crm.contacts')
        .set('If-None-Match', response.headers.etag)
        .expect(304);
    });

    it('returns 404 for a table with no published definition', () =>
      http().get('/api/table-definitions/nope').expect(404));

    it('rejects an invalid draft with diagnostics', async () => {
      const response = await http()
        .post('/api/table-definitions')
        .send({
          ...contactsContract,
          revision: 2,
          columns: [{ id: 'a', sortingFn: 'x' }],
        })
        .expect(400);
      expect(response.body.diagnostics[0]).toMatchObject({
        code: 'invalid-structure',
      });
    });

    it('publishes a new revision, which then replaces the served contract', async () => {
      const draft = { ...contactsContract, revision: 2, meta: { note: 'v2' } };
      await http().post('/api/table-definitions').send(draft).expect(201);

      // Still a draft: consumers keep getting revision 1.
      const before = await http().get('/api/table-definitions/crm.contacts');
      expect(before.body.revision).toBe(1);

      await http()
        .post('/api/table-definitions/crm.contacts/revisions/2/publish')
        .expect(201);
      const after = await http()
        .get('/api/table-definitions/crm.contacts')
        .set('If-None-Match', before.headers.etag)
        .expect(200);
      expect(after.body).toMatchObject({ revision: 2, meta: { note: 'v2' } });

      const revisions = await http()
        .get('/api/table-definitions/crm.contacts/revisions')
        .expect(200);
      expect(revisions.body.map((r: { status: string }) => r.status)).toEqual([
        'published',
        'published',
      ]);
    });

    it('refuses to change a published revision', () =>
      http().post('/api/table-definitions').send(contactsContract).expect(409));

    it('returns 404 when publishing a revision that does not exist', () =>
      http()
        .post('/api/table-definitions/crm.contacts/revisions/99/publish')
        .expect(404));
  });

  describe('contacts', () => {
    it('paginates on the server and reports the total', async () => {
      const { body } = await contacts({ page: { index: 0, size: 10 } }).expect(
        200,
      );
      expect(body.total).toBe(35);
      expect(body.rows).toHaveLength(10);

      const last = await contacts({ page: { index: 3, size: 10 } }).expect(200);
      expect(last.body.rows).toHaveLength(5);
    });

    it('sorts by an approved server key', async () => {
      const { body } = await contacts({
        sort: [{ key: 'contact.created_at', desc: true }],
        page: { index: 0, size: 3 },
      }).expect(200);
      expect(
        body.rows.map((row: { createdAt: string }) => row.createdAt),
      ).toEqual([
        '2026-02-04T00:00:00.000Z',
        '2026-02-03T00:00:00.000Z',
        '2026-02-02T00:00:00.000Z',
      ]);
    });

    it('filters before paginating', async () => {
      const { body } = await contacts({
        filters: [
          { key: 'status', value: 'inactive' },
          { key: 'name', value: 'love' },
        ],
        sort: [{ key: 'name', desc: false }],
      }).expect(200);
      expect(body.total).toBe(3);
      expect(body.rows.map((row: { name: string }) => row.name)).toEqual([
        'Lovelace, Ada',
        'Lovelace, Barbara',
        'Lovelace, Linus',
      ]);
    });

    it('rejects keys that are not approved', async () => {
      const { body } = await contacts({
        sort: [{ key: 'passwordHash', desc: false }],
      }).expect(400);
      expect(body.diagnostics[0]).toMatchObject({ code: 'unapproved-key' });
    });

    it('treats operator objects as plain text, not as MongoDB operators', async () => {
      const { body } = await contacts({
        filters: [{ key: 'status', value: { $ne: 'active' } }],
      }).expect(200);
      expect(body.total).toBe(0);
    });

    it('rejects malformed queries', async () => {
      await http().get('/api/contacts').query({ query: '{nope' }).expect(400);
      await contacts({ page: { index: -1, size: 10 } }).expect(400);
    });
  });
});
