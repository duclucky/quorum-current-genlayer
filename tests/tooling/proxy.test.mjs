import test from 'node:test';
import assert from 'node:assert/strict';
import {projectResult,forwardRpc} from '../../frontend/server/rpc.ts';
test('transaction projection never retains validator secrets or raw nested messages',()=>{
 const safe=projectResult('eth_getTransactionByHash',{hash:'public',status:'FINALIZED',consensus_data:{leader_receipt:[{execution_result:'SUCCESS',node_config:{secret:'must not survive'},stdout:'private'}]},messages:[{hash:'child',node_config:{secret:'private'}}],raw:{key:'private'}});
 assert.deepEqual(safe,{hash:'public',status:'FINALIZED',consensus_data:{leader_receipt:[{execution_result:'SUCCESS'}]},messages:[{hash:'child'}]});
});
test('proxy rejects transaction broadcasting and arbitrary simulation methods',async()=>{
 for(const method of ['eth_sendRawTransaction','eth_sendTransaction','sim_call','sim_installMocks'])assert.equal((await forwardRpc({id:1,method,params:[]})).error.code,-32601);
 assert.equal((await forwardRpc({id:1,method:'gen_call',params:[{type:'write'}]})).error.code,-32602);
});
test('fee simulation uses current server UTC and projects only the recommended public preset',async t=>{
 const original=globalThis.fetch;let observed;
 globalThis.fetch=async(_url,request)=>{observed=JSON.parse(request.body);return new Response(JSON.stringify({result:{recommendedPreset:{distribution:{rotations:['0']},feeValue:'0'},receipt:{node_config:{secret:'never copied'}}}}));};
 t.after(()=>{globalThis.fetch=original;});
 const before=Date.now(),result=await forwardRpc({id:1,method:'sim_estimateTransactionFees',params:[{type:'write',sim_config:{genvm_datetime:'2000-01-01T00:00:00Z'}}]});
 assert.ok(Date.parse(observed.params[0].sim_config.genvm_datetime)>=before);
 assert.equal(JSON.stringify(result).includes('node_config'),false);
 assert.equal(result.result.recommendedPreset.feeValue,'0');
});
