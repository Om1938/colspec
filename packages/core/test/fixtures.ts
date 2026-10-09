/** The CRM contacts definition used as the reference fixture across packages. */
export const contactsContract = {
  schemaVersion: "1.0",
  tableId: "crm.contacts",
  revision: 4,
  columns: [
    {
      id: "name",
      accessorKey: "name",
      header: "Contact Name",
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
      cell: { ref: "crm.statusBadge" },
      enableColumnFilter: true,
      filterFn: "equalsString",
    },
    {
      id: "fullName",
      header: "Full Name",
      accessorFn: { ref: "crm.fullName" },
      enableSorting: true,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      enableSorting: true,
      server: { sortKey: "contact.created_at" },
    },
  ],
  defaults: {
    sorting: [{ id: "name", desc: false }],
    pagination: { pageSize: 25 },
  },
  mode: { sorting: "client", filtering: "client", pagination: "client" },
};

/** A copy of the fixture with top-level fields replaced. */
export const contactsWith = (overrides: Record<string, unknown>) => ({
  ...contactsContract,
  ...overrides,
});
