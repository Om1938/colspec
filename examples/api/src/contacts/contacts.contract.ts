/**
 * The contacts table as stored in MongoDB. Everything runs on the server, so
 * the browser only ever holds one page of rows.
 */
export const CONTACTS_TABLE_ID = 'crm.contacts';

export const contactsContract = {
  schemaVersion: '1.0',
  tableId: CONTACTS_TABLE_ID,
  revision: 1,
  columns: [
    { id: 'name', accessorKey: 'name', header: 'Contact Name', size: 220 },
    {
      id: 'fullName',
      header: 'Full Name',
      accessorFn: { ref: 'crm.fullName' },
      // Computed in the browser, so the server cannot sort or filter by it.
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: { ref: 'crm.statusBadge' },
      // Plain JSON the front end reads to render a select instead of a text box.
      meta: { filterOptions: ['active', 'inactive'] },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Created',
      formatter: { ref: 'crm.date' },
      enableColumnFilter: false,
      server: { sortKey: 'contact.created_at' },
    },
  ],
  defaults: {
    sorting: [{ id: 'name', desc: false }],
    pagination: { pageSize: 10 },
  },
  mode: { sorting: 'server', filtering: 'server', pagination: 'server' },
};
