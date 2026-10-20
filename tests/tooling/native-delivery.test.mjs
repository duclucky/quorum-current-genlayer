import test from 'node:test';
import assert from 'node:assert/strict';
import {waitForNativeDelivery} from '../../scripts/native-delivery.mjs';

const actor='0x160b8045f65a82aaac362cf9dba6c958ceba35d5';
const amount=2n*10n**18n;
const before={contract:4n*10n**18n,recipient:3n*10n**18n};
test('a finalized debit waits for asynchronous recipient delivery instead of treating cleared credit as delivery',async()=>{
 let reads=0;
 const after=await waitForNativeDelivery({before,amount,actor,messages:[{recipient:actor,value:amount.toString()}],pollMs:0,maxPolls:3,read:async()=>({contract:before.contract-amount,recipient:before.recipient-100n+(++reads===1?0n:amount),credit:0n})});
 assert.equal(reads,2);assert.equal(after.recipient,before.recipient+amount-100n);
});
test('wrong destination or absent recipient increase cannot prove delivery',async()=>{
 let reads=0;
 const read=async()=>{reads++;return {contract:before.contract-amount,recipient:before.recipient-100n,credit:0n};};
 await assert.rejects(waitForNativeDelivery({before,amount,actor,messages:[{recipient:'0x0000000000000000000000000000000000000001',value:amount.toString()}],read,pollMs:0,maxPolls:1}),/destination/);
 assert.equal(reads,0);
 await assert.rejects(waitForNativeDelivery({before,amount,actor,messages:[{recipient:actor,value:amount.toString()}],read,pollMs:0,maxPolls:2}),/not proven/);
 assert.equal(reads,2);
});
