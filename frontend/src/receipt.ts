import {executionResultNumberToName,transactionsStatusNumberToName} from 'genlayer-js/types';

type RecordValue=Record<string,unknown>;
const object=(value:unknown):RecordValue=>value!==null&&typeof value==='object'&&!Array.isArray(value)?value as RecordValue:{};
const name=(value:unknown,map:object)=>typeof value==='string'&&!/^\d+$/.test(value)?value:typeof value==='number'||typeof value==='string'?(map as Record<string,string>)[String(value)]:undefined;
export type ReceiptState={status:string;execution:string;successful:boolean;finalized:boolean;failed:boolean};
/** Extract only protocol status/result. Never retain a raw validator receipt or its configuration. */
export function receiptState(input:unknown):ReceiptState{
 const tx=object(input);
 const statuses=[name(tx.status,transactionsStatusNumberToName),name(tx.statusName,transactionsStatusNumberToName)].filter((x):x is string=>Boolean(x));
 const status=statuses.length&&statuses.every(x=>x===statuses[0])?statuses[0]:'UNKNOWN';
 const raw=object(tx.consensus_data).leader_receipt;
 const leaders=Array.isArray(raw)?raw:raw?[raw]:[];
 const results=[name(tx.txExecutionResultName,executionResultNumberToName),name(tx.txExecutionResult,executionResultNumberToName),...leaders.map(r=>object(r).execution_result)].filter(x=>x!==undefined&&x!==null&&x!=='NOT_VOTED');
 const good=(v:unknown)=>v==='SUCCESS'||v==='FINISHED_WITH_RETURN';
 const execution=results.length?(results.every(good)?'SUCCESS':'ERROR'):'UNKNOWN';
 const finalized=status==='FINALIZED';
 const successful=(status==='ACCEPTED'||finalized)&&execution==='SUCCESS';
 return {status,execution,successful,finalized,failed:((status==='ACCEPTED'||finalized)&&execution==='ERROR')||['UNDETERMINED','CANCELED','CANCELLED','REJECTED','LEADER_TIMEOUT','VALIDATORS_TIMEOUT'].includes(status)};
}
