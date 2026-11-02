// Only injected into the isolated browser integration-test process.
const nativeFetch=global.fetch
if(!process.env.SALES_TEST_PROXY_URL)throw new Error('A local test proxy URL is required.')
global.fetch=async(input,options)=>{
 const request=new Request(input,options),url=new URL(request.url)
 if(!['radio-test.supabase.co','app.swifta.co.ke','sozuri.net'].includes(url.hostname))return nativeFetch(input,options)
 const body=['GET','HEAD'].includes(request.method)?undefined:Buffer.from(await request.arrayBuffer())
 return nativeFetch(process.env.SALES_TEST_PROXY_URL+'/'+Buffer.from(request.url).toString('base64url'),{method:request.method,headers:Object.fromEntries(request.headers.entries()),body,duplex:body?'half':undefined})
}
