/** The CRM contacts definition used as the reference fixture across packages. */
export declare const contactsContract: {
  schemaVersion: string;
  tableId: string;
  revision: number;
  columns: (
    | {
        id: string;
        accessorKey: string;
        header: string;
        enableSorting: boolean;
        sortFn: string;
        enableColumnFilter: boolean;
        filterFn: string;
        size: number;
        cell?: undefined;
        accessorFn?: undefined;
        server?: undefined;
      }
    | {
        sortFn?: undefined;
        size?: undefined;
        id: string;
        accessorKey: string;
        header: string;
        cell: {
          ref: string;
        };
        enableColumnFilter: boolean;
        filterFn: string;
        accessorFn?: undefined;
        enableSorting?: undefined;
        server?: undefined;
      }
    | {
        sortFn?: undefined;
        size?: undefined;
        cell?: undefined;
        enableColumnFilter?: undefined;
        filterFn?: undefined;
        id: string;
        header: string;
        accessorFn: {
          ref: string;
        };
        enableSorting: boolean;
        accessorKey?: undefined;
        server?: undefined;
      }
    | {
        sortFn?: undefined;
        size?: undefined;
        cell?: undefined;
        enableColumnFilter?: undefined;
        filterFn?: undefined;
        header?: undefined;
        accessorFn?: undefined;
        id: string;
        accessorKey: string;
        enableSorting: boolean;
        server: {
          sortKey: string;
        };
      }
  )[];
  defaults: {
    sorting: {
      id: string;
      desc: boolean;
    }[];
    pagination: {
      pageSize: number;
    };
  };
  mode: {
    sorting: string;
    filtering: string;
    pagination: string;
  };
};
/** A copy of the fixture with top-level fields replaced. */
export declare const contactsWith: (overrides: Record<string, unknown>) => {
  schemaVersion: string;
  tableId: string;
  revision: number;
  columns: (
    | {
        id: string;
        accessorKey: string;
        header: string;
        enableSorting: boolean;
        sortFn: string;
        enableColumnFilter: boolean;
        filterFn: string;
        size: number;
        cell?: undefined;
        accessorFn?: undefined;
        server?: undefined;
      }
    | {
        sortFn?: undefined;
        size?: undefined;
        id: string;
        accessorKey: string;
        header: string;
        cell: {
          ref: string;
        };
        enableColumnFilter: boolean;
        filterFn: string;
        accessorFn?: undefined;
        enableSorting?: undefined;
        server?: undefined;
      }
    | {
        sortFn?: undefined;
        size?: undefined;
        cell?: undefined;
        enableColumnFilter?: undefined;
        filterFn?: undefined;
        id: string;
        header: string;
        accessorFn: {
          ref: string;
        };
        enableSorting: boolean;
        accessorKey?: undefined;
        server?: undefined;
      }
    | {
        sortFn?: undefined;
        size?: undefined;
        cell?: undefined;
        enableColumnFilter?: undefined;
        filterFn?: undefined;
        header?: undefined;
        accessorFn?: undefined;
        id: string;
        accessorKey: string;
        enableSorting: boolean;
        server: {
          sortKey: string;
        };
      }
  )[];
  defaults: {
    sorting: {
      id: string;
      desc: boolean;
    }[];
    pagination: {
      pageSize: number;
    };
  };
  mode: {
    sorting: string;
    filtering: string;
    pagination: string;
  };
};
