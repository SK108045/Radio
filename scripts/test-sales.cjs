const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net'),{spawn,execFileSync}=require('node:child_process')
const root=path.resolve(__dirname,'..')
const port=()=>new Promise((resolve,reject)=>{const server=net.createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const value=server.address().port;server.close(()=>resolve(value))})})
async function main(){
 const env={...process.env},ownCluster=!env.SALES_TEST_DATABASE_URL
 let directory,bin
 try {
  if(ownCluster){
   bin=env.PG_BIN
   if(!bin){try{bin=path.join('/usr/lib/postgresql',fs.readdirSync('/usr/lib/postgresql').filter(v=>/^\d+$/.test(v)).sort((a,b)=>Number(b)-Number(a))[0],'bin')}catch{throw new Error('Install local PostgreSQL or set PG_BIN to the directory containing initdb and pg_ctl.')}}
   directory=fs.mkdtempSync(path.join(os.tmpdir(),'radio-pg-tests-'));const data=path.join(directory,'data'),pgPort=await port()
   execFileSync(path.join(bin,'initdb'),['-D',data,'-A','trust','-U','radio_test'],{stdio:'ignore'})
   execFileSync(path.join(bin,'pg_ctl'),['-D',data,'-l',path.join(directory,'postgres.log'),'-o',`-p ${pgPort} -k ${directory} -h 127.0.0.1`,'start'],{stdio:'ignore'})
   env.SALES_TEST_DATABASE_URL=`postgresql://radio_test@127.0.0.1:${pgPort}/postgres`
  }
  env.SALES_TEST_POSTGREST_PORT=String(await port())
  if(!env.POSTGREST_BIN)env.POSTGREST_BIN=fs.existsSync('/tmp/postgrest')?'/tmp/postgrest':'postgrest'
  const child=spawn(process.execPath,['--test','tests/resumable-upload.test.cjs','tests/artist-sales.test.cjs'],{cwd:root,env,stdio:'inherit'})
  const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>resolve(code))});process.exitCode=code??1
 }finally{
  if(directory){try{execFileSync(path.join(bin,'pg_ctl'),['-D',path.join(directory,'data'),'-m','immediate','stop'],{stdio:'ignore'})}catch{}fs.rmSync(directory,{recursive:true,force:true})}
 }
}
main().catch(error=>{console.error(error.message);process.exitCode=1})
