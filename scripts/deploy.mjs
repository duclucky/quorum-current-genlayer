import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {ROOT,accounts,inspect,identity,load,save,safeLog,operation,reader,unsignedSourceSmoke,reportFailure} from './network.mjs';
const action=process.argv[2]??'inspect';
try{
 if(action==='inspect')await inspect();
 else if(action==='smoke')await unsignedSourceSmoke();
 else if(action==='deploy'){
  await inspect();await unsignedSourceSmoke();
  const existing=load('deployment.json');
  if(existing?.address){if(existing.sourceSha256!==identity().sourceSha256)throw Error('Archive/reconcile old revision explicitly before any replacement');safeLog({reused:true,address:existing.address});}
  else{
   const fees=await reader.estimateTransactionFees();
   const {safe}=await operation('deploy-v1',accounts()[0],c=>c.deployContract({code:readFileSync(resolve(ROOT,'contracts/quorum_current.py'),'utf8'),args:[],fees:{distribution:fees.distribution,feeValue:fees.feeValue}}));
   if(!safe.contractAddress)throw Error('Successful deployment has no verified address');
   const version=await reader.readContract({address:safe.contractAddress,functionName:'protocol_version',args:[]});
   if(version!=='QC_V1')throw Error('Deployed protocol version mismatch');
   const deployedSourceCommit=load('operations.json')['deploy-v1'].sourceCommit;
   const deployment={...identity(),sourceCommit:deployedSourceCommit,address:safe.contractAddress,version,receipt:safe,status:'ACTIVE',contractExplorer:identity().explorer+'/address/'+safe.contractAddress};save('deployment.json',deployment);safeLog(deployment);
  }
 }else throw Error('Use inspect, smoke or deploy');
}catch(error){reportFailure(error);}
