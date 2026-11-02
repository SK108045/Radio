const fs = require('node:fs')
const path = require('node:path')
const { Client } = require('pg')

async function connectSalesDatabase() {
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  if (!url) throw new Error('Set DATABASE_URL in .env.')
  const connection = new URL(url)
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(connection.hostname)
  const caFile = process.env.DATABASE_CA_CERT || connection.searchParams.get('sslrootcert') ||
    (connection.hostname.endsWith('.supabase.com') || connection.hostname.endsWith('.supabase.co')
      ? path.join(__dirname, '../supabase/certificates/prod-ca-2021.crt') : null)
  const ssl = local ? false : { rejectUnauthorized: true, ...(caFile ? { ca: fs.readFileSync(caFile, 'utf8') } : {}) }
  connection.searchParams.delete('sslmode')
  connection.searchParams.delete('sslrootcert')
  const db = new Client({ connectionString: connection.toString(), connectionTimeoutMillis: 15000, ssl })
  await db.connect()
  return db
}
module.exports = { connectSalesDatabase }
