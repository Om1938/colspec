import { toServerQuery, type TableContract } from '@colspec/core'
import { useContractTable } from '@colspec/react'
import type { DefaultFeatures } from '@colspec/tanstack'
import type { Column } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { fetchContacts } from './api.ts'
import type { Contact, ContactPage } from './types.ts'

const EMPTY_PAGE: ContactPage = { rows: [], total: 0 }
const SORT_INDICATOR = { asc: ' ▲', desc: ' ▼' } as const

interface FilterProps {
  column: Column<DefaultFeatures, Contact>
  onChange: (value: string) => void
}

/** A select when the contract lists options in column meta, else a text box. */
function Filter({ column, onChange }: FilterProps) {
  const label = `Filter ${column.id}`
  const value = String(column.getFilterValue() ?? '')
  const { filterOptions } = (column.columnDef.meta ?? {}) as { filterOptions?: string[] }

  if (!filterOptions) {
    return (
      <input aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} />
    )
  }
  return (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">All</option>
      {filterOptions.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  )
}

export function ContactsTable({ contract }: { contract: TableContract }) {
  const [page, setPage] = useState(EMPTY_PAGE)
  const table = useContractTable<Contact>({ contract, data: page.rows, rowCount: page.total })

  // The server sorts, filters and paginates, so the table state is the query.
  // A string is a stable effect dependency; the query object is new each render.
  const query = JSON.stringify(toServerQuery(contract, table.state))
  useEffect(() => {
    let current = true
    fetchContacts(query).then(
      (next) => current && setPage(next),
      (error: unknown) => console.error(error),
    )
    return () => {
      current = false
    }
  }, [query])

  const { pageIndex } = table.state.pagination

  return (
    <>
      <table>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => {
                const { column } = header
                const sorted = column.getIsSorted()
                return (
                  <th key={header.id} style={{ width: header.getSize() }}>
                    <button
                      type="button"
                      disabled={!column.getCanSort()}
                      onClick={() => {
                        column.toggleSorting()
                        table.firstPage()
                      }}
                    >
                      <table.FlexRender header={header} />
                      {sorted && SORT_INDICATOR[sorted]}
                    </button>
                    {column.getCanFilter() && (
                      <Filter
                        column={column}
                        onChange={(value) => {
                          column.setFilterValue(value || undefined)
                          table.firstPage()
                        }}
                      />
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getAllCells().map((cell) => (
                <td key={cell.id}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <footer>
        <button type="button" disabled={!table.getCanPreviousPage()} onClick={table.previousPage}>
          Previous
        </button>
        <span>
          Page {pageIndex + 1} of {Math.max(table.getPageCount(), 1)} · {page.total} contacts
        </span>
        <button type="button" disabled={!table.getCanNextPage()} onClick={table.nextPage}>
          Next
        </button>
      </footer>
    </>
  )
}
