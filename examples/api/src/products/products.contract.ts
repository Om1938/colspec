/**
 * The products table as stored in MongoDB. Everything runs on the server, so
 * the browser only ever holds one page of rows.
 */
export const PRODUCTS_TABLE_ID = 'inventory.products';

export const productsContract = {
  schemaVersion: '1.0',
  tableId: PRODUCTS_TABLE_ID,
  revision: 1,
  columns: [
    { id: 'name', accessorKey: 'name', header: 'Product Name', size: 220 },
    {
      id: 'brandModel',
      header: 'Brand / Model',
      accessorFn: { ref: 'inventory.brandModel' },
      // Computed in the browser, so the server cannot sort or filter by it.
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: { ref: 'inventory.statusBadge' },
      // Plain JSON the front end reads to render a select instead of a text box.
      meta: { filterOptions: ['active', 'inactive'] },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Created',
      formatter: { ref: 'inventory.date' },
      enableColumnFilter: false,
      server: { sortKey: 'product.created_at' },
    },
  ],
  defaults: {
    sorting: [{ id: 'name', desc: false }],
    pagination: { pageSize: 10 },
  },
  mode: { sorting: 'server', filtering: 'server', pagination: 'server' },
};
