import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { contactsContract } from '../../api/src/contacts/contacts.contract.ts'
import App from './App.tsx'
import type { Contact } from './types.ts'

const rows: Contact[] = [
  {
    name: 'Lovelace, Ada',
    first: 'Ada',
    last: 'Lovelace',
    status: 'inactive',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    name: 'Turing, Alan',
    first: 'Alan',
    last: 'Turing',
    status: 'active',
    createdAt: '2026-01-07T00:00:00.000Z',
  },
]

/** Stands in for the NestJS API and records each contacts query. */
const queries: unknown[] = []
const fetchMock = vi.fn(async (url: string) => {
  const { pathname, searchParams } = new URL(url, 'http://localhost')
  if (pathname === '/api/contacts') queries.push(JSON.parse(searchParams.get('query') ?? '{}'))
  const body = pathname === '/api/contacts' ? { rows, total: 35 } : contactsContract
  return new Response(JSON.stringify(body))
})

const lastQuery = () => queries.at(-1)

beforeEach(() => {
  queries.length = 0
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(cleanup)

it('renders the table the contract describes', async () => {
  render(<App />)
  await screen.findByText('Lovelace, Ada')

  expect(
    screen.getAllByRole('columnheader').map((th) => th.querySelector('button')?.textContent),
  ).toEqual(['Contact Name ▲', 'Full Name', 'Status', 'Created'])
  // accessorFn, cell and formatter references, resolved from the registry.
  expect(screen.getByText('Ada Lovelace')).toBeTruthy()
  expect(screen.getByText('inactive', { selector: '.badge' })).toBeTruthy()
  expect(screen.getByText('Jan 7, 2026')).toBeTruthy()
  expect(screen.getByText(/Page 1 of 4 · 35 contacts/)).toBeTruthy()

  // The first request carries the contract's default sorting and page size.
  expect(queries[0]).toEqual({
    sort: [{ key: 'name', desc: false }],
    filters: [],
    page: { index: 0, size: 10 },
  })
})

it('sends sorting, filtering and paging to the server', async () => {
  render(<App />)
  await screen.findByText('Lovelace, Ada')

  fireEvent.click(screen.getByRole('button', { name: 'Next' }))
  await waitFor(() => expect(lastQuery()).toMatchObject({ page: { index: 1, size: 10 } }))

  // The column id is createdAt; the server receives its approved sort key.
  fireEvent.click(screen.getByRole('button', { name: 'Created' }))
  await waitFor(() =>
    expect(lastQuery()).toMatchObject({
      sort: [{ key: 'contact.created_at', desc: false }],
      page: { index: 0 },
    }),
  )

  // The select comes from `meta.filterOptions` in the contract.
  fireEvent.change(screen.getByLabelText('Filter status'), { target: { value: 'inactive' } })
  await waitFor(() =>
    expect(lastQuery()).toMatchObject({ filters: [{ key: 'status', value: 'inactive' }] }),
  )

  // Computed in the browser, so the contract disables both for this column.
  expect(screen.getByRole('button', { name: 'Full Name' })).toHaveProperty('disabled', true)
  expect(screen.queryByLabelText('Filter fullName')).toBeNull()
})
