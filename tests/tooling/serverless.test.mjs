import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';

test('compiled production serverless entry imports under native Node ESM and serves the method guard',async t=>{
 const base=resolve(tmpdir()),folder=mkdtempSync(join(base,'qc-serverless-'));
 t.after(()=>{assert.ok(resolve(folder).startsWith(base+sep));rmSync(folder,{recursive:true});});
 writeFileSync(join(folder,'package.json'),'{"type":"module"}');
 for(const file of ['server/rpc','api/genlayer-rpc']){
  mkdirSync(join(folder,file.split('/')[0]),{recursive:true});
  const source=readFileSync(new URL('../../frontend/'+file+'.ts',import.meta.url),'utf8');
  writeFileSync(join(folder,file+'.js'),stripTypeScriptTypes(source));
 }
 const {default:handler}=await import(pathToFileURL(join(folder,'api/genlayer-rpc.js')).href);
 let body='';const res={setHeader(){},end(value){body=value;},statusCode:200};
 await handler({method:'GET'},res);assert.equal(res.statusCode,405);assert.equal(JSON.parse(body).error,'Use POST for contract reads.');
});
