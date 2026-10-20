import {existsSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createClient,createFeesDistribution,abi} from 'genlayer-js';
import {studioDevnet} from 'genlayer-js/chains';
import {CalldataAddress,TransactionHashVariant} from 'genlayer-js/types';
import {privateKeyToAccount} from 'viem/accounts';
import {formatEther,hexToBytes,isAddress,keccak256} from 'viem';
import {receiptState} from '../frontend/src/receipt.ts';
import {updateOperation} from './journal.mjs';

export const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const EVIDENCE=resolve(ROOT,'docs/evidence/studio-dev');
export const RPC='https://studio-next.genlayer.com/api';
export const EXPLORER='https://explorer-studio-dev.genlayer.com';
export const CHAIN={...studioDevnet,rpcUrls:{default:{http:[RPC]}}};
export const GEN=10n**18n;
export const RUNNER='5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng';
// The vendor SDK may print complete RPC errors. Never forward those objects.
let suppressedSdkLogs=0;
console.error=console.warn=()=>{suppressedSdkLogs++;};
export const safeLog=value=>console.log(JSON.stringify(value));
export function save(name,value){mkdirSync(EVIDENCE,{recursive:true});writeFileSync(resolve(EVIDENCE,name),JSON.stringify(value,null,2)+'\n');}
export function load(name){const path=resolve(EVIDENCE,name);return existsSync(path)?JSON.parse(readFileSync(path,'utf8')):null;}
export async function rpc(method,params=[]){
 const response=await fetch(RPC,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(50000)});
 if(!response.ok)throw Object.assign(Error('RPC HTTP failure'),{code:response.status});
 const body=await response.json();if(body.error){const e=Object.assign(Error('RPC rejected request'),{code:body.error.code});e.diagnostics={rollback:/rolled back|invalid transaction/i.test(String(body.error.message)),budget:/budget|fees|gas/i.test(String(body.error.message)),rateLimit:/rate limit/i.test(String(body.error.message)),transactionNotFound:/transaction.*not found|not found.*transaction/i.test(String(body.error.message))};throw e;}
 return body.result;
}
export function accounts(){
 const variables={};
 for(const path of [resolve(ROOT,'.env'),resolve(ROOT,'..','.env')]){
  if(!existsSync(path))continue;
  for(const line of readFileSync(path,'utf8').split(/\r?\n/)){
   const m=/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);if(!m||variables[m[1]])continue;
   const value=m[2].replace(/^(['"])(.*)\1$/,'$2');if(value)variables[m[1]]=value;
  }
 }
 return ['STUDIONET_PRIVATE_KEY','STUDIONET_INTEGRATOR_PRIVATE_KEY','STUDIONET_STEWARD_PRIVATE_KEY'].map(name=>{
  const key=variables[name];if(!key)throw Error('Required authorized role configuration is absent after child/parent discovery.');
  if(!/^(0x)?[a-f0-9]{64}$/i.test(key))throw Error('Authorized role key has an invalid format.');
  return privateKeyToAccount(key.startsWith('0x')?key:'0x'+key);
 });
}
export const asAddress=value=>{if(!isAddress(value))throw Error('Invalid address');return new CalldataAddress(hexToBytes(value));};
export const reader=createClient({chain:CHAIN});
export async function estimateWriteFees(client,{address,functionName,args,value=0n}){
 const quote=await client.estimateTransactionFees();
 const distribution=Object.fromEntries(Object.entries(quote.distribution).map(([k,v])=>[k,Array.isArray(v)?v.map(String):String(v)]));
 const result=await rpc('sim_estimateTransactionFees',[{type:'write',to:address,from:client.account.address,data:abi.transactions.serialize([abi.calldata.encode(abi.calldata.makeCalldataObject(functionName,args)),false]),value:'0x'+value.toString(16),fees:{distribution,feeValue:quote.feeValue.toString()},sim_config:{genvm_datetime:new Date().toISOString()}}]);
 const preset=result?.recommendedPreset;
 if(!preset?.distribution||preset.feeValue===undefined)throw Error('Authoritative fee estimate missing');
 const fees={distribution:createFeesDistribution(preset.distribution),messageAllocations:preset.messageAllocations??[],feeValue:BigInt(preset.feeValue)};
 if(fees.feeValue>GEN)throw Error('Fee deposit exceeds bounded 1 GEN demo cap');
 return fees;
}
export function identity(){
 const source=readFileSync(resolve(ROOT,'contracts/quorum_current.py'),'utf8');
 const sourceSha256=createHash('sha256').update(source).digest('hex');
 let commit=null;try{commit=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{/* Pre-commit inspection is read-only. */}
 return {network:'studio-dev',chainId:CHAIN.id,rpc:RPC,explorer:EXPLORER,sourceCommit:commit,sourceSha256,runner:RUNNER,api:'v0.3.0',sdk:'2.0.0-rc.1'};
}
export async function verifyChain(){const actual=await rpc('eth_chainId');if(Number(BigInt(actual))!==CHAIN.id)throw Error('Network identity mismatch');return actual;}
export async function inspect(){
 await verifyChain();const actors=accounts();
 const deployment=load('deployment.json');
 const balances=[];for(const actor of actors)balances.push({address:actor.address,balanceGEN:formatEther(BigInt(await rpc('eth_getBalance',[actor.address,'latest'])))});
 const policy=await reader.getCurrentFeePolicy();
 const report={at:new Date().toISOString(),...identity(),scope:'Read-only inspection; no signed transaction',actors:balances,distinctRoles:new Set(actors.map(a=>a.address.toLowerCase())).size,rolesReady:new Set(actors.map(a=>a.address.toLowerCase())).size===3,feesEnabled:policy.enabled,feePricesGEN:{timeUnit:formatEther(policy.genPerTimeUnit),storageUnit:formatEther(policy.storageUnitPrice),receiptGas:formatEther(policy.receiptGasPrice)},activeContract:deployment?.address??null,suppressedSdkLogs};
 if(deployment?.address)report.contractBalanceGEN=formatEther(BigInt(await rpc('eth_getBalance',[deployment.address,'latest'])));
 save('inspect.json',report);safeLog(report);return report;
}
export function active(){const d=load('deployment.json');if(!d?.address||!isAddress(d.address))throw Error('No active verified deployment');const i=identity();if(d.chainId!==i.chainId||d.sourceSha256!==i.sourceSha256||d.runner!==i.runner)throw Error('Deployment/source identity mismatch');return d;}
export async function view(method,args=[],address=active().address){return reader.readContract({address,functionName:method,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});}
export async function canonical(id){
 const address=active().address;
 const decision=JSON.parse(await view('get_decision',[id],address));
 return {decision:{...decision,escrowGEN:formatEther(BigInt(decision.escrow)),escrow:undefined},members:await Promise.all([0,1,2].map(async i=>JSON.parse(await view('get_member',[id,i],address)))),origins:JSON.parse(await view('get_resolution',[id],address)),accounting:await accounting(),nativeBalanceGEN:formatEther(BigInt(await rpc('eth_getBalance',[address,'latest'])))};
}
export async function accounting(){const raw=JSON.parse(await view('get_accounting'));return Object.fromEntries(Object.entries(raw).map(([k,v])=>[k+'GEN',formatEther(BigInt(v))]));}
export function safeReceipt(raw,hash){
 const status=receiptState(raw);
 const address=raw?.data?.contract_address??raw?.data?.contractAddress??raw?.txDataDecoded?.contractAddress;
 return {hash,explorer:EXPLORER+'/tx/'+hash,...status,contractAddress:isAddress(address??'')?address:null,createdAt:raw?.created_at??null,observedAt:new Date().toISOString()};
}
export async function finalReceipt(hash){
 let last='';
 for(let i=0;i<240;i++){
  const raw=await rpc('eth_getTransactionByHash',[hash]);const safe=safeReceipt(raw,hash);
  const state=safe.status+':'+safe.execution;if(state!==last){safeLog({hash,status:safe.status,execution:safe.execution});last=state;}
  if(safe.failed)throw Object.assign(Error('Transaction execution failed; inspect saved safe evidence'),{safeReceipt:safe});
  if(safe.finalized){if(!safe.successful)throw Object.assign(Error('Finalized execution not proven successful'),{safeReceipt:safe});return {raw,safe};}
  // Hosted Studio currently limits standard RPC traffic to 30 requests/minute.
  await new Promise(r=>setTimeout(r,10000));
 }
 throw Error('Finality remains pending; resume the saved hash, do not rebroadcast');
}
export async function operation(name,actor,send){
 await verifyChain();const journal=load('operations.json')??{};
 const persist=()=>updateOperation(resolve(EVIDENCE,'operations.json'),name,journal[name]);
 if(journal[name]?.hash){const result=await finalReceipt(journal[name].hash);journal[name].receipt=result.safe;journal[name].stage='FINALIZED_SUCCESS';persist();return result;}
 if(!identity().sourceCommit)throw Error('Commit reviewed source before deployment or value writes');
 const gitRoot=execFileSync('git',['rev-parse','--show-toplevel'],{cwd:ROOT,encoding:'utf8'}).trim();
 if(resolve(gitRoot).toLowerCase()!==ROOT.toLowerCase())throw Error('Git root must be this project child');
 execFileSync('git',['diff','--quiet','HEAD','--','contracts/quorum_current.py'],{cwd:ROOT});
 const signing={...actor,signTransaction:async(...args)=>{
  const serialized=await actor.signTransaction(...args);const hash=keccak256(serialized);
  journal[name]={name,actor:actor.address,hash,stage:'SIGNED_BROADCAST_UNCONFIRMED',at:new Date().toISOString(),...identity()};persist();
  return serialized;
 }};
 const client=createClient({chain:CHAIN,account:signing});
 let hash;
 try{hash=await send(client);}catch(error){
  // A signed envelope can already be in flight even when the SDK did not return.
  if(journal[name]?.hash){persist();safeLog({operation:name,hash:journal[name].hash,stage:'AMBIGUOUS_RESUME_REQUIRED'});}
  throw error;
 }
 if(journal[name]?.hash!==hash)throw Error('Signed/broadcast hash mismatch');
 journal[name].stage='SUBMITTED';persist();
 try{const result=await finalReceipt(hash);journal[name].receipt=result.safe;journal[name].stage='FINALIZED_SUCCESS';persist();return result;}
 catch(error){if(error.safeReceipt){journal[name].receipt=error.safeReceipt;persist();}throw error;}
}
export async function unsignedSourceSmoke(){
 await verifyChain();const source=readFileSync(resolve(ROOT,'contracts/quorum_current.py'),'utf8');
 const schema=await rpc('gen_getContractSchemaForCode',['0x'+Buffer.from(source).toString('hex')]);
 const simulation=await rpc('sim_call',[{type:'deploy',from:accounts()[0].address,to:'0x'+'0'.repeat(40),data:abi.transactions.serialize([source,abi.calldata.encode(abi.calldata.makeCalldataObject(undefined,[])),false])}]);
 const safe={at:new Date().toISOString(),...identity(),scope:'Unsigned exact-source constructor and schema smoke; no value/broadcast',hasConstructor:Boolean(schema?.ctor),createPayable:schema?.methods?.create_decision?.payable===true,methods:Object.keys(schema?.methods??{}),execution:simulation?.execution_result==='SUCCESS'?'SUCCESS':'NOT_SUCCESS'};
 save('source-smoke.json',safe);safeLog(safe);if(!safe.hasConstructor||!safe.createPayable||safe.methods.length!==14||safe.execution!=='SUCCESS')throw Error('Exact-source smoke failed');return safe;
}
export function reportFailure(error){
 safeLog({failed:true,errorType:error?.name??'Error',rpcCode:typeof error?.code==='number'?error.code:null,diagnostics:error?.diagnostics??null,receipt:error?.safeReceipt??null,suppressedSdkLogs});process.exitCode=1;
}
