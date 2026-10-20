import type {IncomingMessage,ServerResponse} from 'node:http';
export const UPSTREAM='https://studio-next.genlayer.com/api';
const ALLOWED=new Set(['eth_chainId','gen_call','eth_getTransactionByHash','eth_getTransactionReceipt','eth_getBalance','eth_getTransactionCount','eth_estimateGas','eth_gasPrice','sim_getFeeConfig','sim_estimateTransactionFees']);
const pick=(input:unknown,keys:string[])=>{
 const value=input&&typeof input==='object'?input as Record<string,unknown>:{};
 return Object.fromEntries(keys.filter(k=>Object.hasOwn(value,k)).map(k=>[k,value[k]]));
};
export function projectResult(method:string,result:unknown):unknown{
 if(result===null)return null;
 if(method==='sim_getFeeConfig'){
  const value=result as {enabled?:boolean;policy?:unknown};
  return {enabled:value.enabled,policy:pick(value.policy,['genPerTimeUnit','storageUnitPrice','receiptGasPrice','timeUnitOverlayBps','intrinsicGas','bootloaderOverhead','gasPerChangedSlot','calldataGasPerByte','fixedProposeReceiptGas','fixedMessageRevealGas','messageFeeParamsBudgetFloor'])};
 }
 if(method==='sim_estimateTransactionFees'){
  const preset=(result as {recommendedPreset?:{distribution?:unknown;feeValue?:unknown;messageAllocations?:unknown[]}}).recommendedPreset;
  if(!preset)return {};
  return {recommendedPreset:{feeValue:preset.feeValue,distribution:pick(preset.distribution,['leaderTimeunitsAllocation','validatorTimeunitsAllocation','appealRounds','executionBudgetPerRound','executionConsumed','totalMessageFees','rotations','maxPriceGenPerTimeUnit','storageFeeMaxGasPrice','receiptFeeMaxGasPrice']),messageAllocations:preset.messageAllocations?.map(a=>pick(a,['messageType','recipient','callKey','budget','feeParams','parentIndex']))}};
 }
 if(method==='gen_call'){
  if(typeof result==='string')return result;
  const value=result as {data?:unknown;status?:{code?:number};result?:unknown;execution_result?:string};
  if(typeof value.data==='string')return {data:value.data,status:{code:value.status?.code??0,message:'Canonical contract read'}};
  if(typeof value.result==='string')return {result:value.result,execution_result:value.execution_result==='SUCCESS'?'SUCCESS':'ERROR'};
  return null;
 }
 if(method==='eth_getTransactionByHash'){
  const safe=pick(result,['hash','from','to','from_address','to_address','sender','recipient','status','statusName','txExecutionResult','txExecutionResultName','created_at','createdTimestamp','value','nonce','blockHash','blockNumber','transactionIndex','type','gas','gasPrice','input','r','s','v','chainId','messages']);
  const consensus=(result as {consensus_data?:{leader_receipt?:unknown[]}})?.consensus_data;
  if(Array.isArray(consensus?.leader_receipt))safe.consensus_data={leader_receipt:consensus.leader_receipt.map(r=>pick(r,['execution_result']))};
  // Message payloads may contain nested receipts/configuration. Keep only public identifiers.
  if(Array.isArray(safe.messages))safe.messages=safe.messages.map(m=>typeof m==='string'?m:pick(m,['hash','tx_id','to','recipient','value','status']));
  return safe;
 }
 if(method==='eth_getTransactionReceipt')return pick(result,['transactionHash','transactionIndex','blockHash','blockNumber','from','to','cumulativeGasUsed','gasUsed','contractAddress','logs','logsBloom','status','effectiveGasPrice','type']);
 return result;
}
export async function forwardRpc(body:unknown){
 const q=body as {id?:unknown;method?:string;params?:unknown[]};
 const id=typeof q?.id==='string'||typeof q?.id==='number'?q.id:null;
 const error=(code:number,message:string)=>({jsonrpc:'2.0',id,error:{code,message}});
 if(!q||typeof q.method!=='string'||!ALLOWED.has(q.method)||!Array.isArray(q.params))return error(-32601,'This RPC method is not available.');
 if(q.method==='gen_call'&&(!(q.params[0] as {type?:string})|| (q.params[0] as {type?:string}).type!=='read'))return error(-32602,'Only canonical contract reads are supported.');
 try{
  const response=await fetch(UPSTREAM,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id,method:q.method,params:q.params}),signal:AbortSignal.timeout(45000)});
  if(!response.ok)return error(-32000,'Studio Dev is temporarily unavailable. Retry the canonical read.');
  const payload=await response.json();
  if(payload.error)return error(typeof payload.error.code==='number'?payload.error.code:-32000,'Studio Dev could not complete this request. Check the network and canonical decision state.');
  return {jsonrpc:'2.0',id,result:projectResult(q.method,payload.result)};
 }catch{return error(-32000,'Studio Dev is temporarily unavailable. Retry the canonical read.');}
}
export async function rpcHandler(req:IncomingMessage&{body?:unknown},res:ServerResponse){
 res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.statusCode=405;res.end(JSON.stringify({error:'Use POST for contract reads.'}));return;}
 try{
  let body=req.body;
  if(body===undefined){let text='';for await(const chunk of req){text+=chunk.toString();if(text.length>100000)throw Error('bounds');}body=JSON.parse(text);}
  if(typeof body==='string')body=JSON.parse(body);
  if(JSON.stringify(body).length>100000)throw Error('bounds');
  res.end(JSON.stringify(await forwardRpc(body)));
 }catch{res.statusCode=400;res.end(JSON.stringify({error:'Invalid or oversized RPC request.'}));}
}
