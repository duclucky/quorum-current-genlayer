import {formatEther} from 'viem';
import {accounts,active,view,canonical,accounting,asAddress,operation,inspect,load,save,rpc,GEN,safeLog,reportFailure,estimateWriteFees} from './network.mjs';
const actors=accounts();
async function write(name,method,args,actor=actors[0],value=0n){
 const deployment=active();
 return operation(name,actor,async client=>{
  const estimate=await estimateWriteFees(client,{address:deployment.address,functionName:method,args,value});
  safeLog({operation:name,actor:actor.address,userValueGEN:formatEther(value),networkFeeDepositGEN:formatEther(estimate.feeValue)});
  return client.writeContract({address:deployment.address,functionName:method,args,value,fees:{distribution:estimate.distribution,messageAllocations:estimate.messageAllocations,feeValue:estimate.feeValue}});
 });
}
async function create(kind){
 const cases=load('cases.json')??{};
 if(!cases[kind]){
  const current=Math.floor(Date.now()/1000);
  cases[kind]={id:'qc-'+kind+'-'+current,kind,recordDeadline:current+(kind==='partial'?60:180),expiry:current+(kind==='partial'?120:900),at:new Date().toISOString()};save('cases.json',cases);
 }
 const item=cases[kind];
 if(!load('operations.json')?.[item.id+'-create']?.hash){const t=Math.floor(Date.now()/1000);item.recordDeadline=t+(kind==='partial'?120:360);item.expiry=t+(kind==='partial'?240:1500);save('cases.json',cases);}
 const title={cascade:'Monitoring council grant',cycle:'Circular council representation',unclear:'Ambiguous council delegation',partial:'Incomplete council recovery'}[kind];
 await write(item.id+'-create','create_decision',[item.id,title,'Authorize publication of aggregate uptime monitoring statistics, excluding personal data and promotional marketing.',...actors.map(a=>asAddress(a.address)),asAddress(actors[1].address),item.recordDeadline,item.expiry],actors[0],2n*GEN);
 save(item.id+'-created.json',await canonical(item.id));return item;
}
async function record(kind){
 const item=load('cases.json')?.[kind];if(!item)throw Error('Create the named case first');
 const d=JSON.parse(await view('get_decision',[item.id]));
 const targets=kind==='cycle'?[1,0,0]:[1,2,2];
 for(let i=0;i<(kind==='partial'?1:3);i++){
  const m=JSON.parse(await view('get_member',[item.id,i]));if(m.recorded)continue;
  const scope=targets[i]===i?'':kind==='unclear'?'Authorize only actions meeting my undisclosed confidential condition. The condition is not supplied.':'May represent me only on publication of anonymous aggregate uptime monitoring statistics; exclude personal-data disclosure and promotional marketing.';
  await write(item.id+'-record-'+i,'record_member',[item.id,d.digest,targets[i],scope,kind==='cycle'?'YES':i===2?'YES':'NO'],actors[i]);
 }
 save(item.id+'-recorded.json',await canonical(item.id));
}
async function review(kind){
 const item=load('cases.json')?.[kind];if(!item)throw Error('Unknown case');
 const d=JSON.parse(await view('get_decision',[item.id]));
 if(['APPROVED','REJECTED','RECOVERED','CLOSED'].includes(d.status)){safeLog({case:item.id,reusedStatus:d.status});return;}
 if(Math.floor(Date.now()/1000)<item.recordDeadline){safeLog({case:item.id,waitingUntil:new Date(item.recordDeadline*1000).toISOString(),action:'review not yet legal'});return;}
 await write(item.id+'-review-'+d.attempts,'review',[item.id]);
 const after=await canonical(item.id);const attempt=JSON.parse(await view('get_attempt',[item.id,after.decision.attempts-1]));
 save(item.id+'-reviewed.json',{...after,attempt});safeLog({case:item.id,status:after.decision.status,yes:after.decision.yes,no:after.decision.no,abstain:after.decision.abstain,labels:attempt.labels,accounting:after.accounting});
}
async function recover(kind){
 const item=load('cases.json')?.[kind];if(!item)throw Error('Unknown case');
 const d=JSON.parse(await view('get_decision',[item.id]));
 if(['APPROVED','REJECTED','RECOVERED','CLOSED'].includes(d.status)){safeLog({case:item.id,reusedStatus:d.status});return;}
 if(Math.floor(Date.now()/1000)<item.expiry){safeLog({case:item.id,waitingUntil:new Date(item.expiry*1000).toISOString(),action:'recovery not yet legal'});return;}
 await write(item.id+'-recover','recover',[item.id]);save(item.id+'-recovered.json',await canonical(item.id));
}
async function withdraw(index){
 const actor=actors[index];if(!actor)throw Error('Role index must be 0, 1 or 2');
 const credit=BigInt(await view('get_credit',[asAddress(actor.address)]));
 if(credit===0n){safeLog({actor:actor.address,ownCreditGEN:'0',action:'No withdrawal required'});return;}
 const address=active().address;
 const before={contract:BigInt(await rpc('eth_getBalance',[address,'latest'])),recipient:BigInt(await rpc('eth_getBalance',[actor.address,'latest']))};
 const name='withdraw-'+index+'-'+(await accounting()).withdrawnGEN;
 const result=await write(name,'withdraw',[],actor);
 const after={contract:BigInt(await rpc('eth_getBalance',[address,'latest'])),recipient:BigInt(await rpc('eth_getBalance',[actor.address,'latest']))};
 const ownAfter=BigInt(await view('get_credit',[asAddress(actor.address)]));
 const evidence={at:new Date().toISOString(),actor:actor.address,amountGEN:formatEther(credit),receipt:result.safe,contractBeforeGEN:formatEther(before.contract),contractAfterGEN:formatEther(after.contract),exactNativeContractDebit:before.contract-after.contract===credit,recipientBeforeGEN:formatEther(before.recipient),recipientAfterGEN:formatEther(after.recipient),recipientNetChangeGEN:formatEther(after.recipient-before.recipient),ownCreditAfterGEN:formatEther(ownAfter),accounting:await accounting()};
 save(name+'.json',evidence);safeLog(evidence);
 if(!evidence.exactNativeContractDebit||ownAfter!==0n)throw Error('Native GEN delivery not proven; do not close or duplicate withdrawal');
}
async function close(kind){
 const item=load('cases.json')?.[kind];if(!item)throw Error('Unknown case');
 if(JSON.parse(await view('get_decision',[item.id])).status==='CLOSED'){safeLog({case:item.id,reusedStatus:'CLOSED'});return;}
 await write(item.id+'-close','close',[item.id]);save(item.id+'-closed.json',await canonical(item.id));
}
try{
 const [action='inspect',kind='cascade']=process.argv.slice(2);
 if(action==='inspect')await inspect();
 else if(action==='create'&&['cascade','cycle','unclear','partial'].includes(kind))await create(kind);
 else if(action==='record')await record(kind);
 else if(action==='review')await review(kind);
 else if(action==='recover')await recover(kind);
 else if(action==='withdraw')await withdraw(Number(kind));
 else if(action==='close')await close(kind);
 else if(action==='state'){const item=load('cases.json')?.[kind];if(!item)throw Error('Unknown case');const value=await canonical(item.id);save(item.id+'-current.json',value);safeLog(value);}
 else throw Error('Use inspect, create, record, review, recover, withdraw, close or state with a valid case/role');
}catch(error){reportFailure(error);}
