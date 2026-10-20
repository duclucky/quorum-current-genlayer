import { describe, it, expect } from 'vitest';
import { actions } from './permissions';
import type { Decision } from './types';
const members = [1,2,3].map(n=>({address:'0x'+String(n).repeat(40),recorded:false,target:0,scope:'Monitoring',ballot:'YES' as const}));
const base: Decision = {id:'one',title:'Decision',proposal:'A protocol choice',digest:'digest',sponsor:members[0].address,beneficiary:members[1].address,members,status:'COLLECTING',recordDeadline:100,expiry:200,escrowGEN:'2',attempts:0,origins:[],yes:0,no:0,abstain:0};
describe('legal contextual actions',()=>{
  it('offers recording only to the unrecorded origin before the exact boundary',()=>{
    expect(actions(base,members[1].address,99).record).toBe(true);
    expect(actions(base,members[1].address,100).record).toBe(false);
    expect(actions(base,members[1].address,101).record).toBe(false);
    expect(actions(base,'0x'+'9'.repeat(40),99).record).toBe(false);
    expect(actions({...base,members:members.map(m=>({...m,recorded:true}))},members[1].address,99).record).toBe(false);
  });
  it('opens review only after collection closes and before expiry',()=>{
    const d={...base,status:'READY' as const,members:members.map(m=>({...m,recorded:true}))};
    expect(actions(d,members[0].address,99).review).toBe(false);
    expect(actions(d,members[0].address,100).review).toBe(true);
    expect(actions(d,members[0].address,199).review).toBe(true);
    expect(actions(d,members[0].address,200).review).toBe(false);
    expect(actions(d,null,150).review).toBe(false);
    expect(actions({...d,attempts:3},members[0].address,150).review).toBe(false);
  });
  it('allows only the actual sponsor to recover expired unsettled value',()=>{
    expect(actions(base,members[0].address,199).recover).toBe(false);
    expect(actions(base,members[0].address,200).recover).toBe(true);
    expect(actions(base,members[1].address,200).recover).toBe(false);
    expect(actions({...base,status:'APPROVED'},members[0].address,201).recover).toBe(false);
    expect(actions({...base,status:'RECOVERED'},members[0].address,201).recover).toBe(false);
  });
});
