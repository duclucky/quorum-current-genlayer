import test from 'node:test';
import assert from 'node:assert/strict';
import {receiptState} from '../../frontend/src/receipt.ts';
test('raw Studio success requires execution, not finality alone',()=>{
 assert.equal(receiptState({status:'FINALIZED',consensus_data:{leader_receipt:[{execution_result:'SUCCESS',node_config:{private:'never copied'}}]}}).successful,true);
 assert.equal(receiptState({status:'FINALIZED'}).successful,false);
 assert.equal(receiptState({status:'FINALIZED',consensus_data:{leader_receipt:[{execution_result:'ERROR'}]}}).successful,false);
});
test('normalized SDK execution success and failure',()=>{
 assert.equal(receiptState({statusName:'FINALIZED',txExecutionResultName:'FINISHED_WITH_RETURN'}).successful,true);
 assert.equal(receiptState({status:'ACCEPTED',txExecutionResult:1}).successful,true);
 assert.equal(receiptState({status:'FINALIZED',txExecutionResult:2}).failed,true);
});
test('contradictory, malformed and undecided receipts never certify success',()=>{
 for(const tx of [null,{}, {status:'PENDING',txExecutionResult:1},{status:'ACCEPTED',statusName:'FINALIZED',txExecutionResult:1},{status:'FINALIZED',txExecutionResult:1,consensus_data:{leader_receipt:[{execution_result:'ERROR'}]}}])assert.equal(receiptState(tx).successful,false);
 assert.equal(receiptState({status:'UNDETERMINED'}).failed,true);
 assert.deepEqual(Object.keys(receiptState({})).sort(),['execution','failed','finalized','status','successful']);
});
test('pending NOT_VOTED and provisional leader errors do not terminate a resumable wait',()=>{
 for(const tx of [{status:'PENDING',txExecutionResult:0,txExecutionResultName:'NOT_VOTED'},{status:'PENDING',consensus_data:{leader_receipt:[{execution_result:'ERROR'}]}}]){
  assert.equal(receiptState(tx).failed,false);assert.equal(receiptState(tx).successful,false);
 }
});
