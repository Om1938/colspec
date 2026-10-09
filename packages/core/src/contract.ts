import { z } from "zod";
import { refSchema } from "./ref";

/** A TanStack built-in function name, or a reference to a registered one. */
const namedFnSchema = z.union([z.string().min(1), refSchema]);

/** Literal text, or a reference to a registered renderer. */
const templateSchema = z.union([z.string(), refSchema]);

const metaSchema = z.record(z.string(), z.json());

const executionSchema = z.enum(["client", "server"]);

export const columnSchema = z.strictObject({
  id: z.string().min(1),
  accessorKey: z.string().min(1).optional(),
  accessorFn: refSchema.optional(),

  header: templateSchema.optional(),
  footer: templateSchema.optional(),
  cell: refSchema.optional(),
  /** Formats the cell value when no `cell` renderer is given. */
  formatter: refSchema.optional(),
  /** Row action handlers, exposed to renderers as `meta.actions`. */
  actions: z.array(refSchema).optional(),

  sortFn: namedFnSchema.optional(),
  filterFn: namedFnSchema.optional(),
  aggregationFn: namedFnSchema.optional(),

  enableSorting: z.boolean().optional(),
  enableMultiSort: z.boolean().optional(),
  invertSorting: z.boolean().optional(),
  sortDescFirst: z.boolean().optional(),
  sortUndefined: z
    .union([
      z.literal(false),
      z.literal(-1),
      z.literal(1),
      z.enum(["first", "last"]),
    ])
    .optional(),
  enableColumnFilter: z.boolean().optional(),
  enableGlobalFilter: z.boolean().optional(),
  enableHiding: z.boolean().optional(),
  enableGrouping: z.boolean().optional(),
  enablePinning: z.boolean().optional(),
  enableResizing: z.boolean().optional(),

  size: z.number().nonnegative().optional(),
  minSize: z.number().nonnegative().optional(),
  maxSize: z.number().nonnegative().optional(),

  /** Backend-defined operation identifiers; never raw SQL or field paths. */
  server: z
    .strictObject({
      sortKey: z.string().min(1).optional(),
      filterKey: z.string().min(1).optional(),
    })
    .optional(),

  meta: metaSchema.optional(),
});

export const defaultsSchema = z.strictObject({
  sorting: z
    .array(z.strictObject({ id: z.string(), desc: z.boolean() }))
    .optional(),
  columnFilters: z
    .array(z.strictObject({ id: z.string(), value: z.json() }))
    .optional(),
  pagination: z
    .strictObject({
      pageIndex: z.number().int().nonnegative().default(0),
      pageSize: z.number().int().positive(),
    })
    .optional(),
  columnVisibility: z.record(z.string(), z.boolean()).optional(),
});

export const modeSchema = z.strictObject({
  sorting: executionSchema.default("client"),
  filtering: executionSchema.default("client"),
  pagination: executionSchema.default("client"),
});

export const tableContractSchema = z.strictObject({
  schemaVersion: z.string().regex(/^\d+\.\d+$/),
  tableId: z.string().min(1),
  revision: z.number().int().positive(),
  columns: z.array(columnSchema).min(1),
  defaults: defaultsSchema.optional(),
  mode: modeSchema.optional(),
  meta: metaSchema.optional(),
});

export type ContractColumn = z.infer<typeof columnSchema>;
export type ContractDefaults = z.infer<typeof defaultsSchema>;
export type ContractMode = z.infer<typeof modeSchema>;
export type ExecutionMode = z.infer<typeof executionSchema>;
export type TableContract = z.infer<typeof tableContractSchema>;

const CLIENT_MODE: ContractMode = modeSchema.parse({});

/** The contract's execution modes with client-side defaults applied. */
export function getMode(contract: TableContract): ContractMode {
  return contract.mode ?? CLIENT_MODE;
}
