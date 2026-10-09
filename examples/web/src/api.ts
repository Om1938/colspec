import { ContractError, validateContract, type TableContract } from '@colspec/core'
import type { ProductPage } from './types.ts'

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url} responded with ${response.status}`)
  return response.json()
}

/** Fetches a published contract and validates it before anything uses it. */
export async function fetchContract(tableId: string): Promise<TableContract> {
  const result = validateContract(await getJson(`/api/table-definitions/${tableId}`))
  if (!result.ok) throw new ContractError(result.diagnostics)
  return result.value
}

/** `query` is the serialized result of colspec's `toServerQuery`. */
export async function fetchProducts(query: string): Promise<ProductPage> {
  return (await getJson(`/api/products?${new URLSearchParams({ query })}`)) as ProductPage
}
