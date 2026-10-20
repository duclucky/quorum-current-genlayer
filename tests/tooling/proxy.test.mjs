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
