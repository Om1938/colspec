/** A contact row as the API returns it. */
export interface Contact {
  name: string
  first: string
  last: string
  status: 'active' | 'inactive'
  createdAt: string
}

export interface ContactPage {
  rows: Contact[]
  total: number
}
