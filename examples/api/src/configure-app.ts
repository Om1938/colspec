import type { INestApplication } from '@nestjs/common';
import { ColspecExceptionFilter } from './table-definitions/colspec-exception.filter.js';

/** Settings shared by the running server and the e2e tests. */
export function configureApp<T extends INestApplication>(app: T): T {
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ColspecExceptionFilter());
  return app;
}
