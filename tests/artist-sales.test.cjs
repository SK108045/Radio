const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { spawn, execFileSync } = require('node:child_process')
const { createHmac, randomUUID } = require('node:crypto')
const { AsyncLocalStorage } = require('node:async_hooks')
const { Client } = require('pg')
const ts = require('typescript')
const { NextRequest } = require('next/server')
const TEST_ARTIST_ID='33333333-3333-3333-3333-333333333337'
const nativeFetch = global.fetch
const root=path.resolve(__dirname,'..'), context=new AsyncLocalStorage(), loaded=new Map()
const secret='local-test-jwt-secret-at-least-32-bytes-long'
const jwt=role=> {const p=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({role,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url');return p+'.'+createHmac('sha256',secret).update(p).digest('base64url')}
function load(file) {
 if(loaded.has(file))return loaded.get(file).exports
 const module={exports:{}}; loaded.set(file,module)
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText
 const req=name=> name==='server-only'?{}:name==='next/headers'?{cookies:async()=>context.getStore()}:name==='next/navigation'?{redirect:url=>{throw Object.assign(new Error('redirect'),{url})}}:name==='next/cache'?{revalidatePath:()=>{}}:name.startsWith('@/')?load(path.join(root,name.slice(2)+'.ts')):name.startsWith('.')?load(path.resolve(path.dirname(file),name+'.ts')):require(name)
 new Function('require','module','exports',code)(req,module,module.exports); return module.exports
}
function jar(){const map=new Map();return {map,get:name=>map.has(name)?{value:map.get(name)}:undefined,set:(name,value)=>map.set(name,value),delete:name=>map.delete(typeof name==='string'?name:name.name)}}
function form(input){const f=new FormData();for(const [k,v]of Object.entries(input))f.set(k,String(v));return f}
const request=(url,input,cookies=new Map(),headers={})=>new NextRequest('https://rieng.test'+url,{method:input?'POST':'GET',headers:{host:'rieng.test',origin:'https://rieng.test','content-type':'application/json',cookie:[...cookies].map(([k,v])=>k+'='+v).join('; '),...headers},body:input?JSON.stringify(input):undefined})
const jsonResponse=data=>new Response(JSON.stringify(data),{headers:{'content-type':'application/json'}})
let sql,control,pgrst,dbName,port,tmp,fixture,actions,security,admin,originalEnv,provider=new Map(),sms=new Map(),objects=new Map(),grants=new Map(),signed=new Map(),stkCount=0
const dbQuery=(q,params=[])=>sql.query(q,params)
test.before(async()=>{
 const base=process.env.SALES_TEST_DATABASE_URL || 'postgresql://radio_test@127.0.0.1:55437/postgres'
 const u=new URL(base)
 if(!['localhost','127.0.0.1'].includes(u.hostname))throw new Error('Tests require a disposable LOCAL Postgres instance.')
 control=new Client({connectionString:base});await control.connect();dbName='radio_sales_test_'+process.pid
 await control.query(`CREATE DATABASE ${dbName}`);u.pathname='/'+dbName
 sql=new Client({connectionString:u.toString()});await sql.connect()
 let schema=fs.readFileSync(path.join(__dirname,'sales-schema-fixture.sql'),'utf8').replace(/CREATE ROLE (anon|authenticated|service_role)( BYPASSRLS)?;/g,(_,role,option='')=>`DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='${role}') THEN CREATE ROLE ${role}${option}; END IF; END $$;`)
 await sql.query(schema)
 for(const name of ['202610070001_artist_sales.sql','202610070002_test_artist.sql','202610070003_signup_verification.sql','202610070004_metro_demo_signup.sql','202610070005_test_demo_signup.sql'])await sql.query(fs.readFileSync(path.join(root,'supabase/migrations',name),'utf8'))
 const role='radio_test_auth_'+process.pid
 await control.query(`CREATE ROLE ${role} LOGIN NOINHERIT`);await control.query(`GRANT anon,authenticated,service_role TO ${role}`)
 u.username=role;u.password='';port=Number(process.env.SALES_TEST_POSTGREST_PORT||55438)
 tmp=fs.mkdtempSync(path.join(os.tmpdir(),'radio-sales-tests-'))
 fs.writeFileSync(path.join(tmp,'postgrest.conf'),`db-uri = "${u.toString()}"\ndb-schemas = "public"\ndb-anon-role = "anon"\njwt-secret = "${secret}"\nserver-host = "127.0.0.1"\nserver-port = ${port}\n`)
 pgrst=spawn(process.env.POSTGREST_BIN||'/tmp/postgrest',[path.join(tmp,'postgrest.conf')],{stdio:['ignore','ignore','pipe']})
 pgrst.stderr.on('data',d=>process.stderr.write(d))
 await new Promise((resolve,reject)=>{pgrst.once('error',reject);setTimeout(resolve,500)})
 let last; for(let i=0;i<120;i++){const probe=await nativeFetch(`http://127.0.0.1:${port}/`);if(probe.status===200){last=null;break}last=await probe.text();await new Promise(r=>setTimeout(r,500))};assert.equal(last,null)
 originalEnv={...process.env};Object.assign(process.env,{NEXT_PUBLIC_SUPABASE_URL:'https://radio-test.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:jwt('anon'),SUPABASE_SERVICE_ROLE_KEY:jwt('service_role'),SUPABASE_SECRET_KEY:'',DOMAIN_PAYMENT_SECRET:'test-domain-secret',SALES_OTP_SECRET:'test-otp-secret',SWIFTA_API_KEY:'test-swifta-key',SOZURI_API_KEY:'test-sozuri-key',SOZURI_PROJECT:'test-project',FFMPEG_PATH:'/usr/bin/ffmpeg'})
 fixture=path.join(tmp,'audio.mp3');execFileSync('/usr/bin/ffmpeg',['-nostdin','-loglevel','error','-f','lavfi','-i','sine=frequency=440:duration=75','-b:a','320k','-y',fixture]);fixture=fs.readFileSync(fixture)
 global.fetch=async(input,options={})=>{
  const url=String(input instanceof Request?input.url:input),u=new URL(url)
  if(url.startsWith('https://radio-test.supabase.co/rest/v1/')) return nativeFetch(`http://127.0.0.1:${port}`+u.pathname.slice('/rest/v1'.length)+u.search,options)
  if(url==='https://sozuri.net/api/v1/messaging'){const body=JSON.parse(options.body);assert.equal(body.apiKey,'test-sozuri-key');const code=body.message.match(/\b\d{6}\b/)[0];sms.set(body.to,code);return jsonResponse({recipients:[{status:'sent'}]})}
  if(url==='https://app.swifta.co.ke/stkpush'){assert.equal(options.headers['x-api-key'],'test-swifta-key');const body=JSON.parse(options.body),id='checkout-'+randomUUID();stkCount++;provider.set(id,{status:'pending',amount:body.amount,accountReference:body.accountReference,checkoutRequestId:id});return jsonResponse({success:true,data:{mpesaResponse:{ResponseCode:'0',CheckoutRequestID:id}}})}
  if(url.startsWith('https://app.swifta.co.ke/poll/'))return jsonResponse({transaction:provider.get(decodeURIComponent(u.pathname.split('/').pop()))||{status:'pending'}})
  if(url.startsWith('https://radio-test.supabase.co/storage/v1/')){
   const parts=u.pathname.slice('/storage/v1/'.length)
   if(parts.startsWith('object/upload/sign/')){const key=decodeURIComponent(parts.slice('object/upload/sign/'.length));const token=randomUUID();grants.set(token,key);return jsonResponse({url:`/object/upload/sign/${key}?token=${token}`})}
   if(parts.startsWith('object/info/')){const key=decodeURIComponent(parts.slice('object/info/'.length)),buf=objects.get(key);return buf?jsonResponse({name:key,size:buf.length,metadata:{size:buf.length},contentType:'audio/mpeg'}):new Response('{}',{status:404})}
   if(parts.startsWith('object/sign/')){const key=decodeURIComponent(parts.slice('object/sign/'.length));if(!objects.has(key))return new Response('{}',{status:404});const ttl=JSON.parse(options.body).expiresIn,token=randomUUID();signed.set(token,{key,expires:Date.now()+ttl*1000});return jsonResponse({signedURL:`/object/sign/${key}?token=${token}`})}
   if(parts.startsWith('object/')){const key=decodeURIComponent(parts.slice('object/'.length));let buffer;if(Buffer.isBuffer(options.body))buffer=options.body;else if(options.body instanceof Blob)buffer=Buffer.from(await options.body.arrayBuffer());else if(options.body instanceof FormData)buffer=Buffer.from(await options.body.get('').arrayBuffer());else throw new Error('Unexpected upload body');objects.set(key,buffer);return jsonResponse({Key:key})}
  }
  throw new Error('Unexpected network request: '+u.origin+u.pathname)
 }
 security=load(path.join(root,'lib/sales-security.ts'));admin=load(path.join(root,'lib/supabase-admin.ts'));actions=load(path.join(root,'app/sales/actions.ts'))
 // Signed URL fetching is streamed to real FFmpeg; intercept before JSON signing route.
 const wrapped=global.fetch;global.fetch=async(input,options={})=>{const u=new URL(String(input));if(u.searchParams.has('token')&&signed.has(u.searchParams.get('token'))){const s=signed.get(u.searchParams.get('token'));if(s.expires<=Date.now())return new Response('',{status:403});return new Response(objects.get(s.key),{headers:{'content-type':'audio/mpeg','content-length':String(objects.get(s.key).length)}})}return wrapped(input,options)}
})
test.after(async()=>{
 global.fetch=nativeFetch
 if(pgrst){pgrst.kill();await new Promise(r=>setTimeout(r,100))}
 if(sql)await sql.end()
 if(control){await control.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);await control.query(`DROP ROLE IF EXISTS radio_test_auth_${process.pid}`);await control.end()}
 if(tmp)fs.rmSync(tmp,{recursive:true,force:true})
 if(originalEnv)process.env=originalEnv
})
const signup=async(slug,phone,artistJar)=>{
 const sent=await actions.requestSignupCodeAction(slug,null,form({phone}));assert.ok(sent.challengeId, sent.error)
 const code=sms.get('+254'+phone.slice(1));const verified=await context.run(artistJar,()=>actions.verifySignupCodeAction(slug,null,form({challengeId:sent.challengeId,code})));assert.equal(verified.verified,true,verified.error);const result=await context.run(artistJar,async()=>{try{return await actions.signupAction(slug,null,form({challengeId:sent.challengeId,code,password:'strong-password-123',confirmPassword:'strong-password-123'}))}catch(e){return e}})
 assert.equal(result.url,'/sales');return sent.challengeId
}
test('Metro demo bypass is restricted, one-time, hashes passwords, sends no SMS and supports phone login',async()=>{
 const id='33333333-3333-3333-3333-333333333333',demoJar=jar(),before=sms.size
 await assert.rejects(dbQuery("UPDATE sales_artist_registry SET demo_signup_enabled=true WHERE slug='swatt'"),/check constraint/)
 const rejected=await context.run(jar(),()=>actions.signupAction('swatt',null,form({phone:'0712345689',password:'demo-strong-password-123',confirmPassword:'demo-strong-password-123'})));assert.match(rejected.error,/Verify your phone/)
 const invalid=await context.run(demoJar,()=>actions.signupAction('metro_stunna',null,form({phone:'bad',password:'demo-strong-password-123',confirmPassword:'demo-strong-password-123'})));assert.match(invalid.error,/valid Kenyan/)
 const mismatch=await context.run(demoJar,()=>actions.signupAction('metro_stunna',null,form({phone:'0712345689',password:'demo-strong-password-123',confirmPassword:'different-password'})));assert.match(mismatch.error,/Passwords do not match/)
 const result=await context.run(demoJar,async()=>{try{return await actions.signupAction('metro_stunna',null,form({phone:'0712345689',password:'demo-strong-password-123',confirmPassword:'demo-strong-password-123'}))}catch(e){return e}});assert.equal(result.url,'/sales');assert.equal(sms.size,before)
 const account=(await dbQuery('SELECT password_hash FROM sales_artist_accounts WHERE artist_id=$1',[id])).rows[0];assert.ok(await security.verifyPassword('demo-strong-password-123',account.password_hash));assert.notEqual(account.password_hash,'demo-strong-password-123')
 assert.equal((await dbQuery('SELECT demo_signup_enabled FROM sales_artist_registry WHERE artist_id=$1',[id])).rows[0].demo_signup_enabled,false)
 await assert.rejects(dbQuery('SELECT sales_claim_metro_demo($1,$2)',['0712345688',account.password_hash]),/unavailable/)
 const login=await context.run(demoJar,async()=>{try{return await actions.loginAction(null,form({phone:'0712345689',password:'demo-strong-password-123'}))}catch(e){return e}});assert.equal(login.url,'/sales')
 assert.equal((await dbQuery('SELECT count(*) FROM sales_otp_challenges WHERE artist_id=$1',[id])).rows[0].count,'0')
 // Restore only this disposable fixture for the existing verified-signup coverage.
 await dbQuery('DELETE FROM sales_artist_sessions WHERE artist_id=$1',[id]);await dbQuery('DELETE FROM sales_artist_accounts WHERE artist_id=$1',[id]);await dbQuery('UPDATE sales_artist_registry SET claimed_at=null WHERE artist_id=$1',[id])
})
test('SMS rejection refunds send limits, recent code requests reuse one SMS, and signup requires a verified browser',async()=>{
 const previous=global.fetch,phone='0712345691',otpArtist='33333333-3333-3333-3333-333333333336'
 global.fetch=async(input,options)=>String(input)==='https://sozuri.net/api/v1/messaging'?new Response(JSON.stringify({messageData:{message:'Error. Insufficient balance. Top up and try again.'}}),{status:400,headers:{'content-type':'application/json'}}):previous(input,options)
 try{for(let i=0;i<6;i++){const result=await actions.requestSignupCodeAction('kapitani',null,form({phone}));assert.match(result.error,/insufficient credits/);assert.equal(result.challengeId,undefined)}}finally{global.fetch=previous}
 const counters=(await dbQuery("SELECT hits FROM sales_rate_limits WHERE key=$1 OR key=$2",['otp-artist:'+otpArtist,'otp-phone:'+security.digest(phone)])).rows;assert.ok(counters.every(r=>r.hits===0))
 const first=await actions.requestSignupCodeAction('kapitani',null,form({phone}));assert.ok(first.challengeId,first.error)
 const second=await actions.requestSignupCodeAction('kapitani',null,form({phone}));assert.equal(second.challengeId,first.challengeId);assert.ok(second.retryAfterSeconds>0)
 assert.equal((await dbQuery('SELECT count(*) FROM sales_otp_challenges WHERE artist_id=$1 AND phone=$2 AND sms_sent_at IS NOT NULL',[otpArtist,phone])).rows[0].count,'1')
 const premature=await context.run(jar(),()=>actions.signupAction('kapitani',null,form({challengeId:first.challengeId,password:'strong-password-123',confirmPassword:'strong-password-123'})));assert.match(premature.error,/Verify your phone/)
})
let swattJar=jar(),metroJar=jar(),kapitaniJar=jar(),trackId,orderId,browser= new Map([['rieng-listening-browser','A'.repeat(43)]])
test('exactly three public one-time identities; verified signup, hashes, phone login and session forgery',async()=>{
 assert.deepEqual((await dbQuery('SELECT slug FROM sales_artist_registry WHERE NOT is_test ORDER BY slug')).rows.map(r=>r.slug),['kapitani','metro_stunna','swatt'])
 assert.ok((await actions.requestSignupCodeAction('mejja',null,form({phone:'0712345678'}))).error)
 const sent=await actions.requestSignupCodeAction('swatt',null,form({phone:'0712345678'}));assert.ok(sent.challengeId)
 const wrong=await context.run(swattJar,()=>actions.signupAction('swatt',null,form({challengeId:sent.challengeId,code:'000000',password:'strong-password-123',confirmPassword:'strong-password-123'})));assert.ok(wrong.error)
 const code=sms.get('+254712345678');const verified=await context.run(swattJar,()=>actions.verifySignupCodeAction('swatt',null,form({challengeId:sent.challengeId,code})));assert.equal(verified.verified,true);const withoutProof=await context.run(jar(),()=>actions.signupAction('swatt',null,form({challengeId:sent.challengeId,password:'strong-password-123',confirmPassword:'strong-password-123'})));assert.match(withoutProof.error,/Verify your phone/);const success=await context.run(swattJar,async()=>{try{return await actions.signupAction('swatt',null,form({challengeId:sent.challengeId,code,password:'strong-password-123',confirmPassword:'strong-password-123'}))}catch(e){return e}});assert.equal(success.url,'/sales')
 assert.ok((await actions.requestSignupCodeAction('swatt',null,form({phone:'0712345679'}))).error)
 const auth=load(path.join(root,'lib/auth.ts'));assert.equal((await context.run(swattJar,auth.getSession)).stageName,'swatt')
 const account=(await dbQuery('SELECT * FROM sales_artist_accounts')).rows[0];assert.notEqual(account.password_hash,'strong-password-123');assert.ok(await security.verifyPassword('strong-password-123',account.password_hash));assert.equal(await security.verifyPassword('bad',account.password_hash),false)
 const fake=jar();fake.set('sales_session',Buffer.from(JSON.stringify({artistId:account.artist_id})).toString('base64'));assert.equal(await context.run(fake,auth.getSession),null)
 const failed=await context.run(jar(),()=>actions.loginAction(null,form({phone:'0712345678',password:'bad'})));assert.ok(failed.error)
 const logged=await context.run(swattJar,async()=>{try{return await actions.loginAction(null,form({phone:'+254712345678',password:'strong-password-123'}))}catch(e){return e}});assert.equal(logged.url,'/sales')
 await signup('metro_stunna','0712345679',metroJar);await signup('kapitani','0712345680',kapitaniJar)
 assert.equal((await dbQuery("SELECT COUNT(*) FROM information_schema.columns WHERE table_name='artist_accounts' AND column_name='password'")).rows[0].count,'0')
})
test('authenticated upload locks artist, drafts stay off catalog, FFmpeg produces only a 30-second preview',async()=>{
 const upload=load(path.join(root,'app/api/sales/uploads/route.ts')),finish=load(path.join(root,'app/api/sales/uploads/complete/route.ts')),catalog=load(path.join(root,'lib/sales-catalog.ts'))
 assert.equal((await context.run(jar(),()=>upload.POST(request('/api/sales/uploads',{title:'Test track',price:150,size:fixture.length,contentType:'audio/mpeg'})))).status,401)
 const response=await context.run(swattJar,()=>upload.POST(request('/api/sales/uploads',{title:'Real uploaded test track',price:150,size:fixture.length,contentType:'audio/mpeg',artistId:'33333333-3333-3333-3333-333333333333'})))
 const grant=await response.json();assert.equal(response.status,200,JSON.stringify(grant));trackId=grant.trackId;assert.match(grant.endpoint,/^https:\/\/radio-test.storage.supabase.co\/storage\/v1\/upload\/resumable\/sign$/);assert.match(grant.path,/^33333333-3333-3333-3333-333333333332\//)
 assert.deepEqual(await catalog.publicCatalog(),[])
 objects.set(grants.get(grant.token),fixture)
 const forbidden=await context.run(metroJar,()=>finish.POST(request('/api/sales/uploads/complete',{trackId})));assert.equal(forbidden.status,400)
 const previous=global.fetch
 global.fetch=async(input,options)=>String(input).includes('/storage/v1/object/artist-previews/')?new Response(JSON.stringify({message:'Temporary storage failure',statusCode:'503',error:'Unavailable'}),{status:503}):previous(input,options)
 try{assert.equal((await context.run(swattJar,()=>finish.POST(request('/api/sales/uploads/complete',{trackId})))).status,400)}finally{global.fetch=previous}
 assert.deepEqual(await catalog.publicCatalog(),[])
 const grantsBefore=grants.size
 const retry=await context.run(swattJar,()=>upload.POST(request('/api/sales/uploads',{resumeId:trackId,size:fixture.length,contentType:'audio/mpeg'})))
 const resumed=await retry.json();assert.equal(retry.status,200,JSON.stringify(resumed));assert.equal(resumed.uploaded,true);assert.equal(grants.size,grantsBefore,'Publishing retries must not re-upload a completed original')
 const published=await context.run(swattJar,()=>finish.POST(request('/api/sales/uploads/complete',{trackId,description:'Real upload test description.'})));assert.equal(published.status,200,JSON.stringify(await published.json()))
 const publicTracks=await catalog.publicCatalog();assert.equal(publicTracks.length,1);assert.equal(publicTracks[0].artist,'swatt');assert.equal(publicTracks[0].title,'Real uploaded test track');assert.equal('mp3_file_path' in publicTracks[0],false)
 const preview=[...objects.entries()].find(([k])=>k.startsWith('artist-previews/'))[1];const f=path.join(tmp,'preview.mp3');fs.writeFileSync(f,preview);const duration=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',f],{encoding:'utf8'}));assert.ok(duration>=29.9&&duration<30.1,'Preview duration: '+duration);assert.ok(preview.length<fixture.length)
 await assert.rejects(dbQuery('UPDATE tracks SET artist_id=$1 WHERE id=$2',['33333333-3333-3333-3333-333333333333',trackId]),/cannot change/)
})
test('public preview never returns full file, unpaid playback denies, duplicate STK clicks send once and pending is not a sale',async()=>{
 const playback=load(path.join(root,'app/api/music/playback/route.ts')),checkout=load(path.join(root,'app/api/music/checkout/route.ts')),status=load(path.join(root,'app/api/music/status/route.ts'))
 let response=await playback.GET(request(`/api/music/playback?trackId=${trackId}&mode=preview`,null,browser));assert.equal(response.status,200);assert.match((await response.json()).url,/artist-previews/)
 assert.equal((await playback.GET(request(`/api/music/playback?trackId=${trackId}&mode=full`,null,browser))).status,403)
 const attemptId=randomUUID(),input={trackId,phone:'0712345678',attemptId,amount:1,artistId:'forged'}
 const replies=await Promise.all(Array.from({length:6},()=>checkout.POST(request('/api/music/checkout',input,browser))))
 const data=await replies[0].json();assert.ok(data.order,JSON.stringify(data));orderId=data.order.id;assert.equal(stkCount,1);assert.equal(Number(data.order.amount),150);assert.ok(['pending','uncertain'].includes(data.order.status));assert.equal((await dbQuery('SELECT status FROM sales_orders WHERE id=$1',[orderId])).rows[0].status,'pending')
 const pending=await (await status.GET(request(`/api/music/status?trackId=${trackId}`,null,browser))).json();assert.equal(pending.expiresAt,null);assert.equal((await dbQuery('SELECT COUNT(*) FROM sales_receipts')).rows[0].count,'0')
 const evil=request('/api/music/checkout',input,browser,{origin:'https://evil.test'});assert.equal((await checkout.POST(evil)).status,400)
})
test('provider mismatches and forged callbacks never count; concurrent confirmation produces one receipt and 12-hour entitlement',async()=>{
 const status=load(path.join(root,'app/api/music/status/route.ts')),callback=load(path.join(root,'app/api/music/swifta/callback/route.ts')),order=(await dbQuery('SELECT * FROM sales_orders WHERE id=$1',[orderId])).rows[0]
 const t=provider.get(order.provider_id);t.status='success';t.mpesaReceiptNumber='TESTRECEIPT001';t.amount=1
 await status.GET(request(`/api/music/status?trackId=${trackId}`,null,browser));assert.equal((await dbQuery('SELECT COUNT(*) FROM sales_receipts')).rows[0].count,'0')
 const fakeCallback=await callback.POST(request('/api/music/swifta/callback',{CheckoutRequestID:order.provider_id,status:'success',amount:150,mpesaReceiptNumber:'FORGED123'}));assert.equal(fakeCallback.status,503)
 t.amount=150;t.accountReference='wrong';await status.GET(request(`/api/music/status?trackId=${trackId}`,null,browser));assert.equal((await dbQuery('SELECT COUNT(*) FROM sales_receipts')).rows[0].count,'0');t.accountReference=order.reference
 const results=await Promise.all(Array.from({length:8},()=>callback.POST(request('/api/music/swifta/callback',{Body:{stkCallback:{CheckoutRequestID:order.provider_id}}}))))
 assert.ok(results.every(r=>r.status===200));const receipts=(await dbQuery('SELECT * FROM sales_receipts')).rows;assert.equal(receipts.length,1);const receipt=receipts[0];assert.equal(receipt.artist_id,'33333333-3333-3333-3333-333333333332');assert.equal(receipt.track_id,trackId);assert.equal(Number(receipt.amount),150);assert.equal(receipt.transaction_id,'TESTRECEIPT001');assert.equal(receipt.reference,order.reference);assert.equal(receipt.provider_id,order.provider_id);assert.ok(receipt.confirmed_at)
 const ent=(await dbQuery('SELECT * FROM sales_entitlements WHERE order_id=$1',[orderId])).rows[0];assert.equal(new Date(ent.expires_at)-new Date(receipt.confirmed_at),12*3600000)
 assert.equal((await dbQuery('SELECT COUNT(*) FROM sales_receipts WHERE artist_id=$1',['33333333-3333-3333-3333-333333333333'])).rows[0].count,'0')
})
test('paid playback uses short signed URLs, isolates browsers, reload restores access, and expiry rejects',async()=>{
 const playback=load(path.join(root,'app/api/music/playback/route.ts')),status=load(path.join(root,'app/api/music/status/route.ts'))
 let response=await playback.GET(request(`/api/music/playback?trackId=${trackId}&mode=full`,null,browser));const data=await response.json();assert.equal(response.status,200);assert.match(data.url,/artist-tracks/);assert.ok(new Date(data.urlExpiresAt)-Date.now()<=60000);assert.equal(data.previewSeconds,null)
 assert.equal((await playback.GET(request(`/api/music/playback?trackId=${trackId}&mode=full`,null,new Map([['rieng-listening-browser','B'.repeat(43)]])))).status,403)
 assert.ok((await (await status.GET(request(`/api/music/status?trackId=${trackId}`,null,browser))).json()).expiresAt)
 const before=(await dbQuery('SELECT expires_at FROM sales_entitlements')).rows[0].expires_at
 await dbQuery("UPDATE sales_entitlements SET expires_at=now()-interval '1 second'")
 assert.equal((await playback.GET(request(`/api/music/playback?trackId=${trackId}&mode=full`,null,browser))).status,403)
 await dbQuery('UPDATE sales_entitlements SET expires_at=$1',[before]);const order=(await dbQuery('SELECT * FROM sales_orders WHERE id=$1',[orderId])).rows[0]
 await dbQuery('SELECT sales_confirm_order($1,$2,$3,$4)',[order.id,order.provider_id,'TESTRECEIPT001',150]);assert.equal(new Date((await dbQuery('SELECT expires_at FROM sales_entitlements')).rows[0].expires_at).getTime(),new Date(before).getTime())
})
test('unique provider receipts cannot credit a second artist; failed payments never create sales; accounting failures are retryable',async()=>{
 const track=randomUUID();await dbQuery("INSERT INTO tracks(id,artist_id,title,price_ksh,sales_status,preview_file_path) VALUES($1,'33333333-3333-3333-3333-333333333333','Other artist test',300,'ready','preview')",[track])
 const order=(await dbQuery('SELECT (sales_create_order($1,$2,$3)).*',['other-browser',track,randomUUID()])).rows[0]
 await dbQuery("UPDATE sales_orders SET provider_id='checkout-other',status='pending' WHERE id=$1",[order.id]);await assert.rejects(dbQuery('SELECT sales_confirm_order($1,$2,$3,$4)',[order.id,'checkout-other','TESTRECEIPT001',300]),/duplicate key/)
 assert.equal((await dbQuery('SELECT status FROM sales_orders WHERE id=$1',[order.id])).rows[0].status,'pending');assert.equal((await dbQuery('SELECT COUNT(*) FROM sales_entitlements WHERE order_id=$1',[order.id])).rows[0].count,'0')
 const payments=load(path.join(root,'lib/track-payments.ts'));provider.set('checkout-other',{status:'failed'});await payments.reconcileTrackOrder({...order,provider_id:'checkout-other',status:'pending'});assert.equal((await dbQuery('SELECT status FROM sales_orders WHERE id=$1',[order.id])).rows[0].status,'failed')
 provider.set('checkout-other',{status:'success',amount:300,mpesaReceiptNumber:'OTHERRECEIPT002'});await payments.reconcileTrackOrder({...order,provider_id:'checkout-other',status:'failed'});assert.equal((await dbQuery('SELECT COUNT(*) FROM sales_receipts WHERE artist_id=$1',['33333333-3333-3333-3333-333333333333'])).rows[0].count,'1')
 const result=payments.parseTrackConfirmation({status:'success',mpesaReceiptNumber:'OTHERRECEIPT002'}, {...order,provider_id:'checkout-other'});assert.equal(result.status,'paid')
 const wrongAmount=payments.parseTrackConfirmation({status:'success',amount:999,mpesaReceiptNumber:'OTHERRECEIPT003'}, {...order,provider_id:'checkout-other'});assert.equal(wrongAmount.status,'pending')
})
test('credential changes verify phone and revoke old sessions; immutable identity and anonymous DB/storage policies',async()=>{
 const auth=load(path.join(root,'lib/auth.ts')),old=jar();old.map.set('sales_session',swattJar.map.get('sales_session'))
 const result=await context.run(swattJar,()=>actions.updatePasswordAction(null,form({currentPassword:'strong-password-123',newPassword:'new-strong-password-456',confirmPassword:'new-strong-password-456'})));assert.ok(result.success,result.error);assert.equal(await context.run(old,auth.getSession),null)
 const codeState=await context.run(swattJar,()=>actions.requestPhoneCodeAction(null,form({currentPassword:'new-strong-password-456',phone:'0712345681'})));assert.ok(codeState.challengeId,codeState.error)
 const updated=await context.run(swattJar,()=>actions.updatePhoneAction(null,form({currentPassword:'new-strong-password-456',challengeId:codeState.challengeId,code:sms.get('+254712345681')})));assert.ok(updated.success,updated.error);assert.equal((await context.run(swattJar,auth.getSession)).phone,'0712345681');assert.equal((await context.run(swattJar,auth.getSession)).stageName,'swatt')
 await assert.rejects(dbQuery("UPDATE sales_artist_accounts SET artist_id='33333333-3333-3333-3333-333333333333' WHERE phone='0712345681'"),/cannot change/)
 const anon=await nativeFetch(`http://127.0.0.1:${port}/sales_receipts?select=*`,{headers:{Authorization:'Bearer '+jwt('anon')}});assert.equal(anon.status,401)
 await dbQuery("INSERT INTO storage.objects(bucket_id) VALUES('artist-tracks')");await dbQuery('SET ROLE anon');assert.equal((await dbQuery('SELECT COUNT(*) FROM storage.objects')).rows[0].count,'0');await assert.rejects(dbQuery("INSERT INTO storage.objects(bucket_id) VALUES('artist-tracks')"),/row-level security/);await dbQuery('RESET ROLE')
})
test('callback before initiation-save recovers by trusted reference and does not extend listening access',async()=>{
 const track=randomUUID(),id='early-checkout-'+randomUUID()
 await dbQuery("INSERT INTO tracks(id,artist_id,title,price_ksh,sales_status,preview_file_path) VALUES($1,'33333333-3333-3333-3333-333333333336','Early callback test',200,'ready','preview')",[track])
 const order=(await dbQuery('SELECT (sales_create_order($1,$2,$3)).*',['early-browser',track,randomUUID()])).rows[0]
 await dbQuery("UPDATE sales_orders SET status='uncertain' WHERE id=$1",[order.id])
 provider.set(id,{status:'success',checkoutRequestId:id,accountReference:order.reference,amount:200,mpesaReceiptNumber:'EARLYRECEIPT004'})
 const callbacks=load(path.join(root,'lib/track-payments.ts')),result=await callbacks.processTrackCallback(id)
 assert.equal(result.status,'paid');assert.equal(result.provider_id,id)
 const ent=(await dbQuery('SELECT expires_at FROM sales_entitlements WHERE order_id=$1',[order.id])).rows[0]
 await callbacks.processTrackCallback(id)
 assert.equal((await dbQuery('SELECT COUNT(*) FROM sales_receipts WHERE order_id=$1',[order.id])).rows[0].count,'1')
 assert.equal(new Date((await dbQuery('SELECT expires_at FROM sales_entitlements WHERE order_id=$1',[order.id])).rows[0].expires_at).getTime(),new Date(ent.expires_at).getTime())
 assert.ok((await dbQuery('SELECT processed_at FROM sales_callback_inbox WHERE provider_id=$1',[id])).rows[0].processed_at)
})
test('preview decoder rejects uploaded playlists that reference server files',async()=>{
 const preview=load(path.join(root,'lib/audio-preview.ts'))
 const playlist=`ffconcat version 1.0\nfile '${path.join(tmp,'audio.mp3')}'\n`
 await assert.rejects(preview.makePreview('https://radio-test.supabase.co/test-playlist',async()=>new Response(playlist)),/not on whitelist|Invalid data|Operation not permitted/)
})
test('scheduled recovery isolates unavailable callbacks and records delayed payments older than seven days',async()=>{
 const order=(await dbQuery('SELECT (sales_create_order($1,$2,$3)).*',['reconcile-browser',trackId,randomUUID()])).rows[0]
 const id='delayed-checkout-'+randomUUID(), unavailable='unavailable-callback-'+randomUUID()
 await dbQuery("UPDATE sales_orders SET provider_id=$2,status='failed',created_at=now()-interval '30 days' WHERE id=$1",[order.id,id])
 await dbQuery("INSERT INTO sales_callback_inbox(provider_id,received_at) VALUES($1,now()-interval '30 days')",[unavailable])
 provider.set(id,{status:'success',checkoutRequestId:id,accountReference:order.reference,amount:150,mpesaReceiptNumber:'DELAYEDRECEIPT005'})
 const previous=global.fetch;global.fetch=async(input,options)=>String(input).endsWith('/poll/'+unavailable)?new Response('{}',{status:503}):previous(input,options)
 process.env.SALES_RECONCILE_SECRET='test-reconcile-secret'
 try{
  const route=load(path.join(root,'app/api/music/reconcile/route.ts'))
  assert.equal((await route.POST(request('/api/music/reconcile',{}))).status,401)
  const response=await route.POST(request('/api/music/reconcile',{},new Map(),{authorization:'Bearer test-reconcile-secret'}));assert.equal(response.status,200)
  const result=await response.json();assert.equal(result.confirmed,1);assert.ok(result.retryableFailures>=1)
  assert.equal((await dbQuery('SELECT COUNT(*) FROM sales_receipts WHERE order_id=$1',[order.id])).rows[0].count,'1')
  assert.ok((await dbQuery('SELECT last_checked_at FROM sales_callback_inbox WHERE provider_id=$1',[unavailable])).rows[0].last_checked_at)
  assert.equal((await dbQuery('SELECT processed_at FROM sales_callback_inbox WHERE provider_id=$1',[unavailable])).rows[0].processed_at,null)
 }finally{global.fetch=previous}
})
test('experiment artist signs up without SMS once, hashes passwords, publishes real uploads and receives only its own payments',async()=>{
 const experiment=jar(),id=TEST_ARTIST_ID
 const beforeSms=sms.size
 const invalid=await context.run(experiment,()=>actions.signupAction('test_artist',null,form({phone:'invalid',password:'strong-password-123',confirmPassword:'strong-password-123'})));assert.match(invalid.error,/valid Kenyan/)
 const mismatch=await context.run(experiment,()=>actions.signupAction('test_artist',null,form({phone:'0712345690',password:'strong-password-123',confirmPassword:'different-password'})));assert.match(mismatch.error,/Passwords do not match/)
 const signupResult=await context.run(experiment,async()=>{try{return await actions.signupAction('test_artist',null,form({phone:'0712345690',password:'strong-password-123',confirmPassword:'strong-password-123'}))}catch(e){return e}});assert.equal(signupResult.url,'/sales');assert.equal(sms.size,beforeSms)
 assert.equal((await dbQuery('SELECT count(*) FROM sales_otp_challenges WHERE artist_id=$1',[id])).rows[0].count,'0')
 assert.equal((await dbQuery('SELECT demo_signup_enabled FROM sales_artist_registry WHERE artist_id=$1',[id])).rows[0].demo_signup_enabled,false)
 const stored=(await dbQuery('SELECT password_hash FROM sales_artist_accounts WHERE artist_id=$1',[id])).rows[0].password_hash
 assert.ok(await security.verifyPassword('strong-password-123',stored));assert.notEqual(stored,'strong-password-123')
 await assert.rejects(dbQuery('SELECT sales_claim_test_demo($1,$2)',['0712345691',stored]),/unavailable/)
 const repeat=await context.run(jar(),()=>actions.signupAction('test_artist',null,form({phone:'0712345691',password:'strong-password-123',confirmPassword:'strong-password-123'})));assert.match(repeat.error,/already signed up/)
 const logged=await context.run(experiment,async()=>{try{return await actions.loginAction(null,form({phone:'0712345690',password:'strong-password-123'}))}catch(e){return e}});assert.equal(logged.url,'/sales')
 const auth=load(path.join(root,'lib/auth.ts')),session=await context.run(experiment,auth.getSession)
 assert.equal(session.stageName,'Test_Artist');assert.equal(session.isTest,true)
 assert.ok((await actions.requestSignupCodeAction('test_artist',null,form({phone:'0712345691'}))).error)
 await assert.rejects(dbQuery('UPDATE sales_artist_registry SET is_test=false WHERE artist_id=$1',[id]),/check constraint/)
 const upload=load(path.join(root,'app/api/sales/uploads/route.ts')),finish=load(path.join(root,'app/api/sales/uploads/complete/route.ts')),catalog=load(path.join(root,'lib/sales-catalog.ts'))
 const grantResponse=await context.run(experiment,()=>upload.POST(request('/api/sales/uploads',{title:'Experiment uploaded track',description:'Uploaded in the isolated experiment test.',price:1,size:fixture.length,contentType:'audio/mpeg'})))
 const grant=await grantResponse.json();assert.equal(grantResponse.status,200,JSON.stringify(grant));assert.ok(grant.path.startsWith(id+'/'))
 objects.set(grants.get(grant.token),fixture)
 assert.equal((await context.run(experiment,()=>finish.POST(request('/api/sales/uploads/complete',{trackId:grant.trackId})))).status,200)
 const listed=(await catalog.publicCatalog()).find(t=>t.id===grant.trackId);assert.ok(listed);assert.equal(listed.artist,'Test_Artist');assert.equal(listed.title,'Experiment uploaded track');assert.equal('mp3_file_path' in listed,false);assert.equal('preview_file_path' in listed,false)
 const before=(await dbQuery('SELECT artist_id,count(*)::int AS sales FROM sales_receipts WHERE artist_id<>$1 GROUP BY artist_id ORDER BY artist_id',[id])).rows
 const checkout=load(path.join(root,'app/api/music/checkout/route.ts')),buyer=new Map([['rieng-listening-browser','C'.repeat(43)]])
 const response=await checkout.POST(request('/api/music/checkout',{trackId:grant.trackId,phone:'0712345690',attemptId:randomUUID()},buyer));assert.equal(response.status,200)
 const result=await response.json(),order=(await dbQuery('SELECT * FROM sales_orders WHERE id=$1',[result.order.id])).rows[0]
 Object.assign(provider.get(order.provider_id),{status:'success',mpesaReceiptNumber:'TESTARTISTRECEIPT006'})
 const payments=load(path.join(root,'lib/track-payments.ts'));await payments.processTrackCallback(order.provider_id)
 const receipt=(await dbQuery('SELECT * FROM sales_receipts WHERE order_id=$1',[order.id])).rows[0]
 assert.equal(receipt.artist_id,id);assert.equal(receipt.track_id,grant.trackId);assert.equal(Number(receipt.amount),1)
 assert.deepEqual((await dbQuery('SELECT artist_id,count(*)::int AS sales FROM sales_receipts WHERE artist_id<>$1 GROUP BY artist_id ORDER BY artist_id',[id])).rows,before)
 const playback=load(path.join(root,'app/api/music/playback/route.ts'));assert.equal((await playback.GET(request(`/api/music/playback?trackId=${grant.trackId}&mode=full`,null,buyer))).status,200)
 // Delete removes the listing without deleting receipts or revoking paid access.
 const unauthorized=await context.run(jar(),()=>actions.deleteTrackAction(grant.trackId));assert.match(unauthorized.error,/sign in/)
 const otherArtist=await context.run(metroJar,()=>actions.deleteTrackAction(grant.trackId));assert.ok(otherArtist.error);assert.ok((await catalog.publicCatalog()).some(t=>t.id===grant.trackId))
 assert.equal((await context.run(experiment,()=>actions.deleteTrackAction(grant.trackId))).success,true)
 assert.ok(!(await catalog.publicCatalog()).some(t=>t.id===grant.trackId))
 assert.equal((await dbQuery('SELECT sales_status FROM tracks WHERE id=$1',[grant.trackId])).rows[0].sales_status,'archived')
 assert.equal((await dbQuery('SELECT count(*) FROM sales_receipts WHERE order_id=$1',[order.id])).rows[0].count,'1')
 assert.equal((await playback.GET(request(`/api/music/playback?trackId=${grant.trackId}&mode=preview`,null,buyer))).status,404)
 assert.equal((await playback.GET(request(`/api/music/playback?trackId=${grant.trackId}&mode=full`,null,buyer))).status,200)
 assert.equal((await context.run(experiment,()=>actions.deleteTrackAction(grant.trackId))).success,true)
 const draftResponse=await context.run(experiment,()=>upload.POST(request('/api/sales/uploads',{title:'Deleted unfinished draft',price:1,size:fixture.length,contentType:'audio/mpeg'}))),draft=await draftResponse.json();assert.equal(draftResponse.status,200)
 assert.equal((await context.run(experiment,()=>actions.deleteTrackAction(draft.trackId))).success,true)
 assert.equal((await dbQuery('SELECT sales_status FROM tracks WHERE id=$1',[draft.trackId])).rows[0].sales_status,'archived')
})
test('browser UI: signup → upload → real catalog card → preview → payment → playback → artist reporting', {timeout:300000}, async()=>{
 const http=require('node:http'),{chromium}=require('@playwright/test')
 // Reset only the isolated test artist to exercise signup through the real UI.
 const kapitani='33333333-3333-3333-3333-333333333336'
 await dbQuery("DELETE FROM sales_entitlements WHERE order_id IN (SELECT id FROM sales_orders WHERE browser_hash='early-browser')");await dbQuery("DELETE FROM sales_receipts WHERE order_id IN (SELECT id FROM sales_orders WHERE browser_hash='early-browser')");await dbQuery("DELETE FROM sales_orders WHERE browser_hash='early-browser'");await dbQuery("DELETE FROM tracks WHERE title='Early callback test'")
 await dbQuery('DELETE FROM sales_artist_sessions WHERE artist_id=$1',[kapitani]);await dbQuery('DELETE FROM sales_artist_accounts WHERE artist_id=$1',[kapitani]);await dbQuery('DELETE FROM sales_otp_challenges WHERE artist_id=$1',[kapitani]);await dbQuery('UPDATE sales_artist_registry SET claimed_at=null WHERE artist_id=$1',[kapitani]);await dbQuery('DELETE FROM sales_rate_limits')
 const bridge=http.createServer(async(req,res)=>{
  try {
   const url=Buffer.from(req.url.slice(1),'base64url').toString(),bufs=[];for await(const b of req)bufs.push(b);let body=Buffer.concat(bufs)
   const headers={...req.headers};delete headers.host;delete headers['content-length'];delete headers.connection
   if(req.headers['content-type']?.startsWith('multipart/form-data')){body=await new Request('http://local.test',{method:'POST',headers:{'content-type':req.headers['content-type']},body}).formData();delete headers['content-type']}
   const response=await global.fetch(url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:body});res.statusCode=response.status;for(const [k,v] of response.headers)res.setHeader(k,v);res.end(Buffer.from(await response.arrayBuffer()))
  }catch(e){res.statusCode=500;res.end(JSON.stringify({error:'Test proxy request failed: '+e.message}))}
 })
 await new Promise(r=>bridge.listen(0,'127.0.0.1',r))
 const child=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'dev','--webpack','--port','3117'],{cwd:root,env:{...process.env,NODE_ENV:'development',NODE_OPTIONS:`--require=${path.join(root,'tests/sales-fetch-preload.cjs')}`,SALES_TEST_PROXY_URL:`http://127.0.0.1:${bridge.address().port}`,GEMINI_API_KEY:''},stdio:['ignore','pipe','pipe']})
 let logs='';child.stdout.on('data',d=>logs+=d.toString());child.stderr.on('data',d=>logs+=d.toString())
 let browserInstance
 try {
  for(let i=0;i<80&&!logs.includes('Ready');i++){if(child.exitCode!==null)throw new Error(logs);await new Promise(r=>setTimeout(r,250))}
  browserInstance=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']})
  const browserContext=await browserInstance.newContext({viewport:{width:1440,height:1000}}),page=await browserContext.newPage(),browserErrors=[]
  page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(90000)
  page.on('pageerror',e=>browserErrors.push(e.message));page.on('response',r=>{if(r.status()>=400) logs+='\nBrowser HTTP '+r.status()+' '+new URL(r.url()).pathname})
  await browserContext.route('https://mixes.casacam.net/**',route=>route.abort())
  const uploads=new Map(),cors={'access-control-allow-origin':'*','access-control-allow-methods':'POST,PATCH,HEAD,GET,OPTIONS','access-control-allow-headers':'*','access-control-expose-headers':'*','tus-resumable':'1.0.0'}
  await browserContext.route('https://radio-test.storage.supabase.co/**',async route=>{
   const req=route.request(),method=req.method(),url=new URL(req.url())
   if(method==='OPTIONS'){await route.fulfill({status:204,headers:cors});return}
   if(method==='POST'){
    const meta=Object.fromEntries(req.headers()['upload-metadata'].split(',').map(p=>{const [key,value]=p.trim().split(' ');return [key,Buffer.from(value,'base64').toString()]}))
    const key=meta.bucketName+'/'+meta.objectName;assert.equal(grants.get(req.headers()['x-signature']),key)
    const id=randomUUID(),buffer=req.postDataBuffer()||Buffer.alloc(0);uploads.set(id,{key,buffer,length:Number(req.headers()['upload-length'])});if(buffer.length===Number(req.headers()['upload-length']))objects.set(key,buffer)
    await route.fulfill({status:201,headers:{...cors,location:`https://radio-test.storage.supabase.co/storage/v1/upload/resumable/sign/${id}`,'upload-offset':String(buffer.length)}});return
   }
   const item=uploads.get(url.pathname.split('/').pop());assert.ok(item)
   if(method==='HEAD'){await route.fulfill({status:200,headers:{...cors,'upload-offset':String(item.buffer.length),'upload-length':String(item.length)}});return}
   if(method==='PATCH'){assert.equal(Number(req.headers()['upload-offset']),item.buffer.length);item.buffer=Buffer.concat([item.buffer,req.postDataBuffer()]);if(item.buffer.length===item.length)objects.set(item.key,item.buffer);await route.fulfill({status:204,headers:{...cors,'upload-offset':String(item.buffer.length)}});return}
   await route.fulfill({status:404,headers:cors})
  })
  await browserContext.route('https://radio-test.supabase.co/storage/**',async route=>{const response=await global.fetch(route.request().url());await route.fulfill({status:response.status,headers:{...Object.fromEntries(response.headers),...cors},body:Buffer.from(await response.arrayBuffer())})})
  await page.goto('http://localhost:3117/sales/sign-up/kapitani',{waitUntil:'domcontentloaded'})
  await page.waitForFunction(()=>Object.keys(document.querySelector('#signup-phone')||{}).some(k=>k.startsWith('__reactProps$')))
  await page.getByLabel('Phone number',{exact:true}).fill('0712345682');await page.getByRole('button',{name:'Verify phone',exact:true}).click()
  await page.getByLabel('SMS code',{exact:true}).waitFor();assert.equal(await page.getByLabel('Password',{exact:true}).count(),0);await page.getByLabel('SMS code',{exact:true}).fill('000000');await page.getByRole('button',{name:'Verify code',exact:true}).click();await page.getByRole('alert').waitFor();assert.equal(await page.getByLabel('Password',{exact:true}).count(),0);await page.getByLabel('SMS code',{exact:true}).fill(sms.get('+254712345682'));await page.getByRole('button',{name:'Verify code',exact:true}).click();await page.getByLabel('Password',{exact:true}).waitFor()
  await page.getByLabel('Password',{exact:true}).fill('ui-strong-password-123');await page.getByLabel('Confirm password',{exact:true}).fill('ui-strong-password-123');await page.getByRole('button',{name:'Create artist account'}).click();await page.waitForURL('**/sales')
  await page.getByLabel('Track title').fill('Browser uploaded real track');await page.getByLabel('Price (KSh)').fill('2');await page.getByLabel('Description',{exact:true}).fill('Uploaded through the artist portal during the isolated browser test.')
  const fixtureFile=path.join(tmp,'ui-song.mp3');fs.writeFileSync(fixtureFile,fixture);await page.getByLabel('Audio file · up to 50 MB').setInputFiles(fixtureFile);await page.getByRole('button',{name:'Upload and publish',exact:true}).click()
  await page.getByText('Published. Your track is now on /dj-mix-sales.').waitFor({timeout:90000})
  await page.goto('http://localhost:3117/dj-mix-sales',{waitUntil:'domcontentloaded'});const card=page.locator('article').filter({has:page.getByRole('heading',{name:'Browser uploaded real track',exact:true})});assert.equal(await card.count(),1);assert.ok(await card.getByText('Kapitani',{exact:true}).count())
  await page.waitForFunction(title=>{const a=[...document.querySelectorAll('article')].find(a=>a.querySelector('h2')?.textContent===title),b=a?.querySelector('button');return b && Object.keys(b).some(k=>k.startsWith('__reactProps$') && typeof b[k]?.onClick==='function')},'Browser uploaded real track')
  await card.getByRole('button',{name:'Play 30-second preview',exact:true}).click();await card.getByRole('button',{name:'Pause',exact:true}).waitFor();const source=await card.locator('audio').getAttribute('src');assert.match(source,/artist-previews/)
  await card.getByRole('button',{name:'Pause',exact:true}).click();await card.getByLabel('M-Pesa phone number').fill('0712345678');await card.getByRole('button',{name:'Pay KSh 2 with M-Pesa',exact:true}).click()
  await card.getByRole('button',{name:'Awaiting payment confirmation',exact:true}).waitFor()
  const order=(await dbQuery("SELECT * FROM sales_orders WHERE artist_id=$1 AND amount=2 ORDER BY created_at DESC LIMIT 1",[kapitani])).rows[0];assert.ok(order.provider_id)
  Object.assign(provider.get(order.provider_id),{status:'success',mpesaReceiptNumber:'BROWSERRECEIPT003'})
  await card.getByRole('button',{name:'Play full track',exact:true}).waitFor({timeout:90000});await card.getByRole('button',{name:'Play full track',exact:true}).click();await card.getByRole('button',{name:'Pause',exact:true}).waitFor();assert.match(await card.locator('audio').getAttribute('src'),/artist-tracks/);assert.equal(await card.locator('a[download]').count(),0)
  await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Play full track',exact:true}).waitFor()
  await page.screenshot({path:'/tmp/radio-sales-ui.png',fullPage:true})
  const visitorContext=await browserInstance.newContext(),visitor=await visitorContext.newPage();await visitor.goto('http://localhost:3117/dj-mix-sales',{waitUntil:'domcontentloaded'});const locked=visitor.locator('article').filter({has:visitor.getByRole('heading',{name:'Browser uploaded real track',exact:true})});assert.equal(await locked.getByRole('button',{name:'Play full track',exact:true}).count(),0);await locked.getByRole('button',{name:'Play 30-second preview',exact:true}).waitFor();await visitorContext.close()
  await page.goto('http://localhost:3117/sales',{waitUntil:'domcontentloaded'});await page.getByText('BROWSERRECEIPT003',{exact:true}).waitFor();assert.ok(await page.getByText('KSh 2',{exact:true}).count());assert.equal((await dbQuery('SELECT COUNT(*) FROM sales_receipts WHERE artist_id=$1',[kapitani])).rows[0].count,'1')
  await page.goto('http://localhost:3117/sales/sign-up/kapitani',{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'This signup link has been used'}).waitFor()
  // Reopen only the disposable database's test identity to exercise its real signup UI.
  await dbQuery('DELETE FROM sales_artist_sessions WHERE artist_id=$1',[TEST_ARTIST_ID]);await dbQuery('DELETE FROM sales_artist_accounts WHERE artist_id=$1',[TEST_ARTIST_ID]);await dbQuery('DELETE FROM sales_otp_challenges WHERE artist_id=$1',[TEST_ARTIST_ID]);await dbQuery('UPDATE sales_artist_registry SET claimed_at=null,demo_signup_enabled=true WHERE artist_id=$1',[TEST_ARTIST_ID])
  await page.goto('http://localhost:3117/sales/sign-up/test_artist',{waitUntil:'domcontentloaded'})
  await page.waitForFunction(()=>Object.keys(document.querySelector('#demo-phone')||{}).some(k=>k.startsWith('__reactProps$')))
  assert.equal(await page.getByRole('button',{name:'Verify phone',exact:true}).count(),0);assert.equal(await page.getByLabel('SMS code',{exact:true}).count(),0)
  const testSmsBefore=sms.size
  await page.getByLabel('Phone number',{exact:true}).fill('0712345690')
  await page.getByLabel('Password',{exact:true}).fill('test-ui-password-123');await page.getByLabel('Confirm password',{exact:true}).fill('test-ui-password-123');await page.getByRole('button',{name:'Create artist account'}).click();await page.waitForURL('**/sales')
  assert.equal(sms.size,testSmsBefore)
  const testPassword=(await dbQuery('SELECT password_hash FROM sales_artist_accounts WHERE artist_id=$1',[TEST_ARTIST_ID])).rows[0].password_hash;assert.ok(await security.verifyPassword('test-ui-password-123',testPassword));assert.notEqual(testPassword,'test-ui-password-123')
  await page.getByText('Test artist portal',{exact:true}).waitFor();await page.getByRole('heading',{name:'Try the sales experience',exact:true}).waitFor()
  await page.getByLabel('Track title').fill('Browser experiment track');await page.getByLabel('Price (KSh)').fill('1');await page.getByLabel('Description',{exact:true}).fill('Actual upload through the test artist portal.')
  await page.getByLabel('Audio file · up to 50 MB').setInputFiles(fixtureFile);await page.getByRole('button',{name:'Upload and publish',exact:true}).click()
  await page.getByText('Published. Your track is now on /dj-mix-sales and in this portal.').waitFor({timeout:90000})
  const testCard=page.locator('article').filter({has:page.getByRole('heading',{name:'Browser experiment track',exact:true})});await testCard.waitFor();assert.equal(await testCard.count(),1)
  await testCard.getByRole('button',{name:'Play 30-second preview',exact:true}).click();await testCard.getByRole('button',{name:'Pause',exact:true}).waitFor();await testCard.getByRole('button',{name:'Pause',exact:true}).click()
  await testCard.getByLabel('M-Pesa phone number').fill('0712345690');await testCard.getByRole('button',{name:'Pay KSh 1 with M-Pesa',exact:true}).click();await testCard.getByRole('button',{name:'Awaiting payment confirmation',exact:true}).waitFor()
  const testOrder=(await dbQuery("SELECT * FROM sales_orders WHERE artist_id='33333333-3333-3333-3333-333333333337' AND track_id=(SELECT id FROM tracks WHERE title='Browser experiment track')")).rows[0]
  Object.assign(provider.get(testOrder.provider_id),{status:'success',mpesaReceiptNumber:'TESTUIRECEIPT007'})
  await testCard.getByRole('button',{name:'Play full track',exact:true}).waitFor({timeout:90000});await testCard.getByRole('button',{name:'Play full track',exact:true}).click();await testCard.getByRole('button',{name:'Pause',exact:true}).waitFor()
  await page.getByText('TESTUIRECEIPT007',{exact:true}).waitFor();assert.equal(await page.getByText('BROWSERRECEIPT003',{exact:true}).count(),0)
  await page.screenshot({path:'/tmp/radio-test-artist-ui.png',fullPage:true})
  await page.goto('http://localhost:3117/sales/sign-up/test_artist',{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'This signup link has been used'}).waitFor()
  await page.goto('http://localhost:3117/dj-mix-sales',{waitUntil:'domcontentloaded'});const publicTestCard=page.locator('article').filter({has:page.getByRole('heading',{name:'Browser experiment track',exact:true})});assert.equal(await publicTestCard.count(),1);assert.equal(await publicTestCard.getByText('Test_Artist',{exact:true}).count(),1);await publicTestCard.getByRole('button',{name:'Play full track',exact:true}).waitFor()
  await page.goto('http://localhost:3117/sales',{waitUntil:'domcontentloaded'})
  const ownTracks=page.locator('section').filter({has:page.getByRole('heading',{name:'Your tracks',exact:true})})
  await page.waitForFunction(()=>{const section=[...document.querySelectorAll('section')].find(s=>s.querySelector('h2')?.textContent==='Your tracks'),button=section?.querySelector('button');return button && Object.keys(button).some(k=>k.startsWith('__reactProps$') && typeof button[k]?.onClick==='function')})
  const cancelled=page.waitForEvent('dialog').then(dialog=>dialog.dismiss());await ownTracks.getByRole('button',{name:'Delete track',exact:true}).click();await cancelled;assert.equal(await ownTracks.getByText('Browser experiment track',{exact:true}).count(),1)
  const confirmed=page.waitForEvent('dialog').then(dialog=>dialog.accept());await ownTracks.getByRole('button',{name:'Delete track',exact:true}).click();await confirmed;await page.waitForFunction(()=>![...document.querySelectorAll('section')].find(s=>s.querySelector('h2')?.textContent==='Your tracks')?.innerText.includes('Browser experiment track'))
  assert.equal(await page.getByRole('heading',{name:'Browser experiment track',exact:true}).count(),0);await page.getByText('TESTUIRECEIPT007',{exact:true}).waitFor()
  await page.goto('http://localhost:3117/dj-mix-sales',{waitUntil:'domcontentloaded'});assert.equal(await page.getByRole('heading',{name:'Browser experiment track',exact:true}).count(),0)
  assert.equal((await dbQuery('SELECT count(*) FROM sales_receipts WHERE order_id=$1',[testOrder.id])).rows[0].count,'1')
  assert.deepEqual(browserErrors,[])
 } catch(error) {throw new Error(error.message+'\nNext test server log tail:\n'+logs.slice(-5000))}
 finally {if(browserInstance)await browserInstance.close();child.kill();await new Promise(r=>setTimeout(r,200));bridge.closeAllConnections();await new Promise(r=>bridge.close(r))}
})
