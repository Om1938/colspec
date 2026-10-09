/** The products table definition used as the reference fixture across packages. */
export const productsContract = {
  schemaVersion: "1.0",
  tableId: "inventory.products",
  revision: 4,
  columns: [
    {
      id: "name",
      accessorKey: "name",
      header: "Product Name",
      enableSorting: true,
      sortFn: "alphanumeric",
      enableColumnFilter: true,
      filterFn: "includesString",
      size: 240,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: { ref: "inventory.statusBadge" },
      enableColumnFilter: true,
      filterFn: "equalsString",
    },
    {
      id: "brandModel",
      header: "Brand / Model",
      accessorFn: { ref: "inventory.brandModel" },
      enableSorting: true,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      enableSorting: true,
      server: { sortKey: "product.created_at" },
    },
  ],
  defaults: {
    sorting: [{ id: "name", desc: false }],
    pagination: { pageSize: 25 },
  },
  mode: { sorting: "client", filtering: "client", pagination: "client" },
};

/** A copy of the fixture with top-level fields replaced. */
export const productsWith = (overrides: Record<string, unknown>) => ({
  ...productsContract,
  ...overrides,
});
