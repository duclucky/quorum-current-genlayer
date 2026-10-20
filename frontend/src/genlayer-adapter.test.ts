import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {abi} from 'genlayer-js';
import {CalldataAddress} from 'genlayer-js/types';
import {studioDevnet} from 'genlayer-js/chains';
import {bytesToHex,decodeFunctionData,fromRlp,hexToBytes,type Abi,type Hex} from 'viem';
import {createGenLayerAdapter} from './genlayer-adapter';
import type {TxUpdate} from './types';
const a=(n:number)=>('0x'+String(n).repeat(40)) as Hex;
const tx=('0x'+'a'.repeat(64)) as Hex;
const rpc='https://offline-sdk.invalid';
const calls:{method:string;params:unknown[];url:string}[]=[];
const sent:Record<string,unknown>[]=[];
let status='FINALIZED',native=2n*10n**18n,credit=2n*10n**18n;
let onSend=()=>{};
const decodeCall=(data:Hex)=>abi.calldata.decode(hexToBytes((fromRlp(data) as Hex[])[0])) as Map<string,unknown>;
const d={id:'one',title:'Monitoring',proposal:'Authorize aggregates.',digest:'bound',sponsor:a(1),beneficiary:a(2),members:[a(1),a(2),a(3)],status:'READY',record_deadline:100,expiry:200,escrow:'2000000000000000000',attempts:0,yes:0,no:0,abstain:0};
const provider={request:vi.fn(async({method,params}:{method:string;params?:unknown[]})=>{
 if(method==='eth_chainId')return '0xf22d';
 if(method==='eth_accounts')return [a(1)];
 if(method==='eth_sendTransaction'){sent.push((params??[])[0] as Record<string,unknown>);onSend();return tx;}
 throw Error('Unexpected wallet method '+method);
})};
beforeEach(()=>{
 calls.length=0;sent.length=0;status='FINALIZED';native=2n*10n**18n;credit=2n*10n**18n;onSend=()=>{};provider.request.mockClear();
 vi.stubGlobal('fetch',vi.fn(async(url,options)=>{
  const q=JSON.parse(options.body);calls.push({...q,url:String(url)});let result:unknown;
  switch(q.method){
   case 'sim_getFeeConfig':result={enabled:false,policy:{genPerTimeUnit:'0',storageUnitPrice:'0',receiptGasPrice:'0',timeUnitOverlayBps:'0'}};break;
   case 'sim_estimateTransactionFees':result={recommendedPreset:{distribution:{},feeValue:'0'}};break;
   case 'eth_getTransactionCount':result='0x0';break;
   case 'eth_estimateGas':result='0x30d40';break;
   case 'eth_gasPrice':result='0x0';break;
   case 'eth_getBalance':result='0x'+native.toString(16);break;
   case 'eth_getTransactionReceipt':result={transactionHash:tx,status:'0x1',logs:[],blockNumber:'0x1',transactionIndex:'0x0',gasUsed:'0x1',cumulativeGasUsed:'0x1',effectiveGasPrice:'0x0',type:'0x0'};break;
   case 'eth_getTransactionByHash':result={hash:tx,status,consensus_data:{leader_receipt:[{execution_result:'SUCCESS'}]}};break;
   case 'gen_call':{
    const call=decodeCall(q.params[0].data),method=call.get(''),args=call.get('args') as unknown[];
    let value:unknown;
    if(method==='get_decision')value={...d,id:args[0]};
    else if(method==='get_member'){const i=Number(args[1]);value={address:a(i+1),recorded:true,target:i,scope:'',ballot:'YES'};}
    else if(method==='get_resolution')value=[];
    else if(method==='get_accounting')value={credits:credit.toString()};
    else if(method==='list_decisions')value=['one'];
    else if(method==='get_credit'){expect(args[0]).toBeInstanceOf(CalldataAddress);value=credit.toString();}
    else throw Error('Unexpected contract view '+String(method));
    result=bytesToHex(abi.calldata.encode(typeof value==='string'?value:JSON.stringify(value)));break;
   }
   default:throw Error('Unexpected offline RPC '+q.method);
  }
  return new Response(JSON.stringify({jsonrpc:'2.0',id:q.id,result}),{headers:{'content-type':'application/json'}});
 }));
});
afterEach(()=>vi.unstubAllGlobals());
function adapter(){return createGenLayerAdapter({address:a(9),connection:()=>({account:a(1),provider}),rpc,pollMs:0,maxPolls:2});}
it('real SDK reads only the IC path at latest-final and formats GEN exactly',async()=>{
 const client=adapter();expect(await client.credit(a(1))).toBe('2');const decision=await client.decision('one');expect(decision.escrowGEN).toBe('2');expect(decision.members).toHaveLength(3);
 expect(calls.every(c=>c.url===rpc)).toBe(true);expect(calls.filter(c=>c.method==='gen_call').every(c=>(c.params[0] as {transaction_hash_variant:string}).transaction_hash_variant==='latest-final')).toBe(true);
 expect(provider.request).not.toHaveBeenCalled();
});
it.each(['review','recover','close'] as const)('actual project adapter encodes zero-value %s through selected EVM provider',async method=>{
 const updates:TxUpdate[]=[];await adapter()[method]('one',u=>updates.push(u));expect(sent).toHaveLength(1);
 const request=sent[0];expect(request.from).toBe(a(1));expect(request.to?.toString().toLowerCase()).toBe(studioDevnet.consensusMainContract?.address.toLowerCase());expect(BigInt(request.value as string)).toBe(0n);
 const envelope=decodeFunctionData({abi:studioDevnet.consensusMainContract!.abi as Abi,data:request.data as Hex});expect(envelope.functionName).toBe('addTransaction');
 const params=envelope.args![0] as {sender:string;recipient:string;userValue:bigint;txCalldata:Hex};expect(params.sender.toLowerCase()).toBe(a(1));expect(params.recipient.toLowerCase()).toBe(a(9));expect(params.userValue).toBe(0n);
 expect(decodeCall(params.txCalldata).get('')).toBe(method);expect(updates.map(u=>u.stage)).toEqual(['signature','submitted','finalized']);
 expect(calls.every(c=>c.url===rpc&&c.method!=='eth_sendTransaction')).toBe(true);
});
it('actual project create encodes exactly 2 GEN and Address-typed council arguments',async()=>{
 const client=adapter();await client.create({title:'Monitoring',proposal:'Authorize aggregates.',members:[a(1),a(2),a(3)],beneficiary:a(2),recordDeadline:100,expiry:200},()=>{});
 const request=sent[0];expect(BigInt(request.value as string)).toBe(2n*10n**18n);
 const envelope=decodeFunctionData({abi:studioDevnet.consensusMainContract!.abi as Abi,data:request.data as Hex});const params=envelope.args![0] as {userValue:bigint;txCalldata:Hex};expect(params.userValue).toBe(2n*10n**18n);
 const call=decodeCall(params.txCalldata);expect(call.get('')).toBe('create_decision');const args=call.get('args') as unknown[];for(const i of [3,4,5,6])expect(args[i]).toBeInstanceOf(CalldataAddress);
});
it('keeps an ambiguous submission hash and checks it on retry without sending twice',async()=>{
 status='ACCEPTED';const client=adapter();await expect(client.review('one',()=>{})).rejects.toThrow('Finality is still pending');expect(sent).toHaveLength(1);
 status='FINALIZED';await client.review('one',()=>{});expect(sent).toHaveLength(1);
});
it('actual record wrapper binds proposal digest and original vote parameters',async()=>{
 await adapter().record('one','bound',1,'Monitoring only','NO',()=>{});
 const envelope=decodeFunctionData({abi:studioDevnet.consensusMainContract!.abi as Abi,data:sent[0].data as Hex});const params=envelope.args![0] as {txCalldata:Hex};
 const call=decodeCall(params.txCalldata);expect(call.get('')).toBe('record_member');expect(call.get('args')).toEqual(['one','bound',1n,'Monitoring only','NO']);
});
it('withdraw wrapper requires exact native contract debit in addition to finalized parent',async()=>{
 onSend=()=>{native=0n;credit=0n;};await adapter().withdraw(()=>{});expect(sent).toHaveLength(1);
 expect(calls.filter(c=>c.method==='eth_getBalance')).toHaveLength(2);
});
it('withdraw never reports delivery when the parent finalized but native GEN stayed',async()=>{
 onSend=()=>{credit=0n;};await expect(adapter().withdraw(()=>{})).rejects.toThrow('GEN delivery is not verified');expect(sent).toHaveLength(1);
});
it('rejects absent/invalid configuration and disconnected writes before RPC',async()=>{
 expect(createGenLayerAdapter({connection:()=>({account:null,provider:null})}).configured).toBe(false);
 expect(()=>createGenLayerAdapter({address:'undefined',connection:()=>({account:null,provider:null})})).toThrow('invalid');
 await expect(createGenLayerAdapter({address:a(9),connection:()=>({account:null,provider:null}),rpc}).review('one',()=>{})).rejects.toThrow('connect a wallet');expect(calls).toHaveLength(0);
});
