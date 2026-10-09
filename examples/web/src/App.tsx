import type { TableContract } from '@colspec/core'
import { ColspecProvider } from '@colspec/react'
import { useEffect, useState } from 'react'
import { fetchContract } from './api.ts'
import { ContactsTable } from './ContactsTable.tsx'
import { registry } from './registry.tsx'

const TABLE_ID = 'crm.contacts'

export default function App() {
  const [contract, setContract] = useState<TableContract>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    fetchContract(TABLE_ID).then(setContract, (reason: unknown) => setError(String(reason)))
  }, [])

  return (
    <main>
      <h1>Contacts</h1>
      {error && <pre role="alert">{error}</pre>}
      {contract && (
        <>
          <p>
            Table definition <code>{contract.tableId}</code>, revision {contract.revision}, loaded
            from MongoDB.
          </p>
          <ColspecProvider registry={registry}>
            <ContactsTable contract={contract} />
          </ColspecProvider>
        </>
      )}
    </main>
  )
}
