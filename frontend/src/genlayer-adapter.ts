import {createClient} from 'genlayer-js';
import {TransactionHashVariant,CalldataAddress} from 'genlayer-js/types';
import {formatEther,isAddress,hexToBytes,type Address,type Hex} from 'viem';
import type {ContractAdapter,Decision,Member,NewDecision,Origin,TxUpdate} from './types';
import type {Provider} from './wallet';
import {chain,ensureNetwork} from './network';
import {receiptState} from './receipt';
import {unconfiguredAdapter} from './adapter';

type Connection={account:string|null;provider:Provider|null};
type Options={address?:string;connection:()=>Connection;rpc?:string;pollMs?:number;maxPolls?:number};
const json=<T,>(value:unknown):T=>{if(typeof value!=='string')throw Error('The contract returned an unexpected response.');return JSON.parse(value) as T;};
const pause=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
const hash=(v:unknown):v is Hex=>typeof v==='string'&&/^0x[0-9a-f]{64}$/i.test(v);
const asAddress=(value:string)=>{if(!isAddress(value))throw Error('An EVM address is invalid.');return new CalldataAddress(hexToBytes(value));};

export function createGenLayerAdapter(options:Options):ContractAdapter{
 if(!options.address)return unconfiguredAdapter;
 if(!isAddress(options.address))throw Error('The configured decision contract address is invalid.');
 const address=options.address;
 const selectedChain={...chain,rpcUrls:{default:{http:[options.rpc??chain.rpcUrls.default.http[0]]}}};
 const reader=createClient({chain:selectedChain});
 const pending=new Map<string,Hex>();
 let prepared:{fingerprint:string;id:string}|null=null;
 async function read(method:string,args:Parameters<typeof reader.readContract>[0]['args']=[]){
  return reader.readContract({address,functionName:method,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});
 }
 async function wait(tx:Hex,update:(tx:TxUpdate)=>void){
  for(let i=0;i<(options.maxPolls??240);i++){
   const receipt=receiptState(await reader.getTransaction({hash:tx as Parameters<typeof reader.getTransaction>[0]['hash']}));
   if(receipt.failed)throw Error('The network could not execute this action. Read the latest state before retrying.');
   if(receipt.successful&&receipt.finalized){update({stage:'finalized',hash:tx});return;}
   if(receipt.successful)update({stage:'accepted',hash:tx});
   if(i+1<(options.maxPolls??240))await pause(options.pollMs??2500);
  }
  throw Error('Finality is still pending. Retry this action to check the existing transaction; it will not be sent twice.');
 }
 async function write(method:string,args:Parameters<typeof reader.writeContract>[0]['args'],update:(tx:TxUpdate)=>void,value=0n){
  const connection=options.connection();
  if(!connection.provider||!connection.account||!isAddress(connection.account))throw Error('Choose and connect a wallet before signing.');
  const account=connection.account,provider=connection.provider;
  const key=JSON.stringify([account.toLowerCase(),method,args]);
  let tx=pending.get(key);
  if(!tx){
   await ensureNetwork(provider);
   const authorized=await provider.request({method:'eth_accounts'});
   if(!Array.isArray(authorized)||!authorized.some(a=>typeof a==='string'&&a.toLowerCase()===account.toLowerCase()))throw Error('The selected account changed. Reconnect your wallet.');
   const selected:Provider={request:async request=>{
    if(request.method==='eth_sendTransaction'){
     await ensureNetwork(provider);
     const sent=await provider.request(request);
     if(!hash(sent))throw Error('Your wallet did not return a transaction identifier.');
     pending.set(key,sent);update({stage:'submitted',hash:sent});return sent;
    }
    return provider.request(request);
   }};
   // The selected string account is normalized by the real SDK here, never overridden per call.
   const writer=createClient({chain:selectedChain,account:account as Address,provider:selected});
   const estimate=await writer.estimateTransactionFeesForWrite({address,functionName:method,args,value});
   const fees={distribution:estimate.distribution,messageAllocations:estimate.messageAllocations,feeValue:estimate.feeValue};
   update({stage:'signature',message:`Network fee deposit: ${formatEther(estimate.feeValue)} GEN, separate from the decision budget.`});
   try{const sent=await writer.writeContract({address,functionName:method,args,value,fees});if(hash(sent)){tx=sent;pending.set(key,sent);}}
   catch{tx=pending.get(key);if(!tx)throw Error('Signing or submission did not complete. Check your selected wallet and try again.');}
   tx=tx??pending.get(key);
  }else update({stage:'submitted',hash:tx,message:'Checking your existing transaction.'});
  if(!tx)throw Error('No transaction identifier was returned. Refresh canonical state before trying again.');
  await wait(tx,update);pending.delete(key);
 }
 async function decision(id:string):Promise<Decision>{
  const d=json<Record<string,unknown>>(await read('get_decision',[id]));
  const [members,origins,accounting]=await Promise.all([
   Promise.all([0,1,2].map(async i=>json<Member>(await read('get_member',[id,i])))),
   read('get_resolution',[id]).then(v=>json<Origin[]>(v)),
   read('get_accounting').then(v=>json<{credits:string}>(v)),
  ]);
  const statuses=['COLLECTING','READY','RETRYABLE','APPROVED','REJECTED','RECOVERED','CLOSED'];
  if(d.id!==id||!statuses.includes(String(d.status))||members.length!==3||!members.every(m=>isAddress(m.address)))throw Error('The decision response is incomplete. Retry the canonical read.');
  return {id,title:String(d.title),proposal:String(d.proposal),digest:String(d.digest),sponsor:String(d.sponsor),beneficiary:String(d.beneficiary),members,status:d.status as Decision['status'],recordDeadline:Number(d.record_deadline),expiry:Number(d.expiry),escrowGEN:formatEther(BigInt(String(d.escrow))),attempts:Number(d.attempts),origins,yes:Number(d.yes),no:Number(d.no),abstain:Number(d.abstain),zeroLiability:BigInt(accounting.credits)===0n};
 }
 return {
  configured:true,decision,
  list:async()=>{const all:Decision[]=[];for(let offset=0;;offset+=50){const ids=json<string[]>(await read('list_decisions',[offset,50]));all.push(...await Promise.all(ids.map(decision)));if(ids.length<50)break;}return all.reverse();},
  credit:async owner=>formatEther(BigInt(String(await read('get_credit',[asAddress(owner)])))),
  create:async(input:NewDecision,update)=>{const fingerprint=JSON.stringify(input);if(!prepared||prepared.fingerprint!==fingerprint)prepared={fingerprint,id:'qc-'+crypto.randomUUID()};const id=prepared.id;await write('create_decision',[id,input.title,input.proposal,...input.members.map(asAddress),asAddress(input.beneficiary),input.recordDeadline,input.expiry],update,2n*10n**18n);prepared=null;await decision(id);return id;},
  record:async(id,digest,target,scope,ballot,update)=>{await write('record_member',[id,digest,target,scope,ballot],update);await decision(id);},
  review:async(id,update)=>{await write('review',[id],update);await decision(id);},
  recover:async(id,update)=>{await write('recover',[id],update);await decision(id);},
  close:async(id,update)=>{await write('close',[id],update);await decision(id);},
  withdraw:async update=>{
   const connection=options.connection();if(!connection.account||!isAddress(connection.account))throw Error('Connect your wallet first.');
   const contractBefore=await reader.getBalance({address});
   const own=BigInt(String(await read('get_credit',[asAddress(connection.account)])));
   if(own<=0n)throw Error('There is no own credit to withdraw.');
   await write('withdraw',[],update);
   // A finalized parent is insufficient. Confirm delivery by exact native contract debit.
   for(let i=0;i<(options.maxPolls??240);i++){
    const [balance,credit]=await Promise.all([reader.getBalance({address}),read('get_credit',[asAddress(connection.account)])]);
    if(contractBefore-balance===own&&BigInt(String(credit))===0n)return;
    await pause(options.pollMs??2500);
   }
   throw Error('The withdrawal was finalized, but GEN delivery is not verified yet. Refresh your credit and transaction details.');
  },
 };
}
