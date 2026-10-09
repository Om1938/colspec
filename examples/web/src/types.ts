/** A product row as the API returns it. */
export interface Product {
  name: string
  brand: string
  model: string
  status: 'active' | 'inactive'
  createdAt: string
}

export interface ProductPage {
  rows: Product[]
  total: number
}
