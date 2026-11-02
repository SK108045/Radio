const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript')
const {randomBytes}=require('node:crypto')
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='test-public-key'
function helper(){const module={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../lib/resumable-upload.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(require,module,module.exports);return module.exports}
test('TUS uses 6 MB chunks, resumes an interrupted upload, retries and reports progress',async()=>{
 const chunk=6*1024*1024,file=randomBytes(13*1024*1024);file.name='test.mp3';file.size=file.length;file.lastModified=1
 const received=[],sizes=[],seenHeaders=[],progress=[],records=new Map();let offset=0,fail=true,creates=0
 const server=http.createServer(async(req,res)=>{
  seenHeaders.push(req.headers);res.setHeader('Tus-Resumable','1.0.0')
  if(req.method==='HEAD'){res.setHeader('Upload-Offset',offset);res.setHeader('Upload-Length',file.length);res.statusCode=200;res.end();return}
  const buffers=[];for await(const buf of req)buffers.push(buf);const body=Buffer.concat(buffers)
  if(req.method==='POST'){creates++;received.push(body);sizes.push(body.length);offset+=body.length;res.setHeader('Location','/upload/1');res.setHeader('Upload-Offset',offset);res.statusCode=201;res.end();return}
  if(req.method==='PATCH'){
   assert.equal(Number(req.headers['upload-offset']),offset)
   if(fail){fail=false;res.statusCode=503;res.end();return}
   received.push(body);sizes.push(body.length);offset+=body.length;res.setHeader('Upload-Offset',offset);res.statusCode=204;res.end();return
  }
  res.statusCode=404;res.end()
 })
 await new Promise(r=>server.listen(0,'127.0.0.1',r))
 const urlStorage={findUploadsByFingerprint:async fp=>[...records.values()].filter(v=>v.fingerprint===fp),addUpload:async(fp,record)=>{const key='saved';records.set(key,{...record,fingerprint:fp,urlStorageKey:key});return key},removeUpload:async key=>records.delete(key),findAllUploads:async()=>[...records.values()]}
 const grant={trackId:'id',path:'artist/id/original',token:'signed-upload-token',endpoint:`http://127.0.0.1:${server.address().port}/resumable/sign`,contentType:'audio/mpeg'}
 const defaults=require('tus-js-client').defaultOptions,originalStorage=defaults.urlStorage;defaults.urlStorage=urlStorage
 const {createAudioUpload,startOrResume}=helper()
 try {
  await assert.rejects(new Promise((resolve,reject)=>{const upload=createAudioUpload(file,grant,n=>progress.push(n),resolve,reject);assert.equal(upload.options.chunkSize,chunk);assert.deepEqual(upload.options.retryDelays,[0,1000,3000,5000,10000,20000]);upload.options.retryDelays=[];void startOrResume(upload).catch(reject)}), error => /response code: 503/.test(String(error)))
  assert.equal(offset,chunk);assert.equal(records.size,1)
  await new Promise((resolve,reject)=>{const upload=createAudioUpload(file,grant,n=>progress.push(n),resolve,reject);void startOrResume(upload).catch(reject)})
  assert.equal(creates,1);assert.deepEqual(sizes,[chunk,chunk,1024*1024]);assert.ok(Buffer.concat(received).equals(file),'resumed bytes must match the original');assert.equal(progress.at(-1),100);assert.equal(records.size,0);assert.ok(seenHeaders.every(h=>h['x-signature']==='signed-upload-token'))
 } finally {defaults.urlStorage=originalStorage;await new Promise(r=>server.close(r))}
})
