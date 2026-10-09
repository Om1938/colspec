import { createTableRegistry } from '@colspec/tanstack'
import type { Product } from './types.ts'

const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' })

/**
 * Every function a contract may refer to. The database only stores the names;
 * the code lives here, in the deployed front end.
 */
export const registry = createTableRegistry<Product>({
  accessorFns: {
    'inventory.brandModel': (row) => `${row.brand} ${row.model}`,
  },
  cells: {
    'inventory.statusBadge': ({ getValue }) => {
      const status = String(getValue())
      return <span className={`badge badge-${status}`}>{status}</span>
    },
  },
  formatters: {
    'inventory.date': (value: string) => dateFormat.format(new Date(value)),
  },
})
