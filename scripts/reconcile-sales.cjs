require('@next/env').loadEnvConfig(process.cwd())
async function main(){
 const base=process.env.SALES_SITE_URL,secret=process.env.SALES_RECONCILE_SECRET
 if(!base||!secret)throw new Error('Set SALES_SITE_URL and SALES_RECONCILE_SECRET in the server environment.')
 const endpoint=new URL('/api/music/reconcile',base)
 for(let i=0;i<20;i++){
  const response=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+secret},signal:AbortSignal.timeout(180000)})
  if(!response.ok)throw new Error('Reconciliation returned HTTP '+response.status+'. Retry the job; no payment will be charged by this command.')
  const data=await response.json();console.log('Checked '+data.checked+' orders and '+data.callbacksChecked+' callbacks; confirmed '+data.confirmed+' payments; '+(data.retryableFailures||0)+' items need another attempt.')
  if(data.checked<25&&data.callbacksChecked<25)return
 }
 console.log('Batch limit reached. The next scheduled invocation will continue.')
}
main().catch(error=>{console.error(error.message);process.exitCode=1})
