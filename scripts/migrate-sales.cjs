// Apply only the checked-in artist sales migrations. Credentials never print.
require('@next/env').loadEnvConfig(process.cwd())
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto')
const {connectSalesDatabase}=require('./sales-database.cjs')
const filenames=['202610070001_artist_sales.sql','202610070002_test_artist.sql','202610070003_signup_verification.sql','202610070004_metro_demo_signup.sql','202610070005_test_demo_signup.sql','202610120001_bob_preorders.sql','202610120002_bob_one_bob_test.sql','202610130001_swatt_no_sms_signup.sql']
async function main(){
 const db=await connectSalesDatabase()
 try{
  await db.query('BEGIN');await db.query("SELECT pg_advisory_xact_lock(hashtext('rieng-sales-migrations'))")
  await db.query('CREATE TABLE IF NOT EXISTS public.sales_schema_migrations(name text PRIMARY KEY,sha256 text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())')
  await db.query('ALTER TABLE public.sales_schema_migrations ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.sales_schema_migrations FROM anon,authenticated; GRANT ALL ON public.sales_schema_migrations TO service_role')
  const completed=[]
  for(const filename of filenames){
   const source=fs.readFileSync(path.join(process.cwd(),'supabase/migrations',filename),'utf8'),hash=createHash('sha256').update(source).digest('hex'),applied=(await db.query('SELECT sha256 FROM public.sales_schema_migrations WHERE name=$1',[filename])).rows[0]
   if(applied){if(applied.sha256!==hash)throw new Error('The applied migration checksum differs. Add a new migration instead of editing an applied migration.');continue}
   await db.query(source.replace(/^BEGIN;\s*/,'').replace(/COMMIT;\s*$/,''))
   await db.query('INSERT INTO public.sales_schema_migrations(name,sha256) VALUES($1,$2)',[filename,hash]);completed.push(filename)
  }
  if(completed.length)await db.query("NOTIFY pgrst, 'reload schema'")
  await db.query('COMMIT');console.log(completed.length?'Applied migrations: '+completed.join(', '):'Artist sales migrations already applied.')
 }catch(error){await db.query('ROLLBACK');throw error}finally{await db.end()}
}
main().catch(error=>{console.error(error.code?'Database migration failed ('+error.code+'). No partial migration was committed.':error.message);process.exitCode=1})
